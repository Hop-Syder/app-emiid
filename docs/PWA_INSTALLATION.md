# Installation sur l'écran d'accueil (PWA)

## Ce qui manquait

L'application avait un service worker, mais **uniquement pour les notifications
push**. Trois conditions de l'installabilité n'étaient pas remplies :

| Condition | Avant | Après |
|-----------|-------|-------|
| Manifeste | ❌ absent | ✅ `app/manifest.ts` |
| Icônes 192 et 512 | ❌ seulement 32×32 | ✅ `public/icons/` |
| Service worker avec gestionnaire `fetch` | ❌ `push` seulement | ✅ ajouté |
| Enregistrement du worker au démarrage | ❌ à l'abonnement push | ✅ au chargement |

Le dernier point était le plus pénalisant : l'installation n'aurait été proposée
qu'aux personnes ayant **déjà accepté les notifications**.

## Les deux parcours

**Chromium (Chrome, Edge, Samsung Internet, Opera).** L'événement
`beforeinstallprompt` est intercepté et son affichage par défaut annulé, puis
conservé pour être déclenché **au moment choisi par l'utilisateur**. `appinstalled`
referme l'invitation. La boîte native ne se rejoue pas : l'événement est consommé
au premier appel.

**Safari iOS.** N'implémente pas `beforeinstallprompt` — aucune installation ne
peut être déclenchée par le code. La seule voie est le menu Partager, d'où des
instructions illustrées en trois étapes. La détection couvre iPadOS 13+, qui se
présente comme un Mac : le test tactile lève l'ambiguïté.

## Comportement

- Rien ne s'affiche si l'application tourne déjà en mode installé
  (`display-mode: standalone`, ou `navigator.standalone` sur iOS).
- L'invitation apparaît après **4 secondes** : laisser l'utilisateur arriver
  quelque part avant de lui proposer autre chose.
- « Plus tard » met l'invitation en sommeil **14 jours** (`localStorage`), pas
  définitivement. Un stockage indisponible (navigation privée) n'empêche rien.

## Icônes

Une source 3000×3000 existe déjà — malgré son nom, `public/logo/icon-light-32x32.png`.
Pour produire les tailles exactes :

```bash
cd frontend-user
node scripts/generate-pwa-icons.js
```

Génère `icon-192`, `icon-256`, `icon-384`, `icon-512` et `icon-maskable-512`.
Cette dernière est rétrécie sur un aplat de marque : Android rogne les icônes
adaptatives en cercle et ne garantit que ~80 % du carré.

> **Sans ces fichiers, Chrome ne proposera pas l'installation.** Le manifeste les
> déclare ; le script doit être lancé une fois.

## Mise en cache

Le service worker applique **réseau d'abord, cache en secours** : l'application
reste à jour et le cache ne sert qu'en cas de coupure — fréquent en mobile.

Sont exclus : les requêtes non-`GET`, les autres origines et tout `/api/*`.
Servir une réponse périmée sur un profil ou un paiement ferait plus de mal que
de bien.

## Vérifier

1. Chrome mobile → menu → « Installer l'application » doit apparaître.
2. DevTools → Application → Manifest : aucune erreur, icônes listées.
3. DevTools → Application → Service Workers : `activated and is running`.
4. Lighthouse → catégorie PWA.
