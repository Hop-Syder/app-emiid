# Jeu de données de démonstration

> Objectif : donner de la matière à l'annuaire, à la recherche et au classement.
> Un annuaire vide ne prouve rien — pas même que la recherche fonctionne.

## Principe : marqué, donc supprimable

Chaque profil créé porte **`user_profiles.is_demo = true`**
(migration `20260827_demo_flag.sql`).

C'est une **colonne dédiée**, et non une convention sur l'e-mail ou le nom :
un préfixe se perd dès qu'un profil est modifié, une colonne non. Les profils
restent par ailleurs **indiscernables des vrais côté interface** — sans quoi la
démonstration ne prouverait rien.

Les adresses utilisent le domaine réservé **`@demo.emiid.invalid`** : aucune
collision possible avec une adresse réelle, et rien ne peut être envoyé dessus.

## Commandes

```bash
cd backend
node scripts/seed-demo.js            # crée le jeu (15 profils)
node scripts/seed-demo.js --count    # combien reste-t-il ?
node scripts/seed-demo.js --purge    # supprime TOUT ce qui est marqué démo
```

Variables requises : `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.

## Contenu

15 professionnels répartis sur **7 communes** (Cotonou, Abomey-Calavi,
Porto-Novo, Parakou, Bohicon, Ouidah), couvrant les métiers visés : électricien,
couturière, mécanicien, traiteur, développeur, coiffeuse, menuisier, comptable,
plombier, graphiste, soudeur, photographe, vulcanisateur, maçon, pâtissière.

Chacun a un métier, une spécialité, une biographie, des compétences et un
rattachement à sa commune. Parmi eux :

- **4 comptes Pro** (avec abonnement actif — le trigger `sync_is_premium` fait le
  reste) ;
- **7 profils vérifiés** ;
- **1 boost communal actif** à Cotonou, pour que le classement ait quelque chose
  à montrer.

Ce panachage est délibéré : il permet de démontrer la hiérarchie du classement
(boost > Pro > vérifié > standard) sur des résultats réels.

## Suppression

`--purge` supprime les **comptes `auth.users`** correspondants. La cascade retire
alors profils, compétences, vues, messages, abonnements et boosts : rien ne
subsiste. Équivalent SQL :

```sql
DELETE FROM auth.users
WHERE id IN (SELECT user_id FROM public.user_profiles WHERE is_demo = true);
```

## Avant la mise en production réelle

```sql
SELECT count(*) FROM public.user_profiles WHERE is_demo = true;  -- doit valoir 0
```
