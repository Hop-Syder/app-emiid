# Annonces — modèles réutilisables et mesure

## Modèles

Une annonce envoyée ne laissait qu'une ligne dans le journal d'administration :
illisible, et impossible à rejouer. Renvoyer le même message imposait de tout
retaper.

Le panneau **« Mes modèles »**, présent dans les deux onglets d'Annonces,
permet d'enregistrer le message en cours et de le recharger plus tard.

Un modèle conserve **le texte et le ciblage** : le réutiliser restitue l'envoi
complet, pas seulement son contenu. Deux nuances :

- côté e-mail, c'est la **source éditée** qui est conservée, pas le HTML
  produit — sinon le message reviendrait figé dans son rendu, non modifiable ;
- les **destinataires nommés** (adresses saisies à la main, personnes
  sélectionnées) ne sont pas rejoués. Un modèle décrit une audience, pas une
  liste de personnes figée dans le temps.

## Mesure

### Notifications internes — fiable

`notifications.is_read` dit exactement qui a ouvert. L'historique affiche
« N lues · N non lues · taux ».

### E-mails — clics, et non ouvertures

**Le taux d'ouverture n'est plus mesurable honnêtement.** La seule technique
disponible est le pixel invisible, et elle est faussée dans les deux sens :

- **Apple Mail** (protection de la vie privée, active par défaut) précharge
  toutes les images → des ouvertures comptées pour des messages jamais lus ;
- **Gmail** passe par son proxy → l'ouverture est comptée, mais sans savoir
  quand ni depuis quel appareil ;
- de nombreux clients **bloquent les images** → des lectures réelles jamais
  comptées.

Nous mesurons donc les **clics**. Un clic est un geste délibéré : le chiffre
est plus bas qu'un taux d'ouverture, mais il est vrai.

À l'envoi, chaque lien du corps est remplacé par un lien de suivi propre au
destinataire (`/api/t/{destinataire}/{lien}`), qui enregistre le clic puis
redirige. Les liens `mailto:`, les ancres et **les liens de désinscription**
sont laissés intacts — compter un désabonnement comme un signe d'intérêt
fausserait la mesure.

### Pas de redirection ouverte

La destination est **stockée en base** (`campaign_links`) et renvoyée par
`record_email_click`. Elle n'est jamais lue dans l'URL appelante : une
redirection pilotée par un paramètre ferait de ce point d'entrée un tremplin
d'hameçonnage depuis notre propre domaine.

Le suivi ne bloque jamais un envoi : si l'enregistrement de la campagne échoue,
le message part tel quel, simplement sans mesure. De même, un lien de suivi
invalide redirige vers l'accueil plutôt que d'afficher une erreur.

## Mise en service

1. Jouer `sql/migrations/20260829_message_templates.sql` dans Supabase.
2. Vérifier que `NEXT_PUBLIC_PUBLIC_URL` (ou `NEXT_PUBLIC_SITE_URL`) est
   définie sur **frontend-admin** : les liens de suivi sont absolus, ils
   partent dans des boîtes mail. Sans elle, le repli est `https://app.emiid.com`.

Les campagnes envoyées avant cette migration n'ont pas d'identifiant de
campagne : leur ligne d'historique reste sans statistiques, ce qui est normal.
