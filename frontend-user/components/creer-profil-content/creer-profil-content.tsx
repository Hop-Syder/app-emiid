/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Point d'entrée de la création de profil — rend le tunnel d'onboarding
 *              en 3 étapes (Qui / Que / Où). Les formulaires avancés (bio, portfolio,
 *              réseaux, horaires, sécurité, vérification) sont désormais dans /parametres.
 * @created 2026-01-16
 * @updated 2026-08-19
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { CreerProfilWizard } from "./creer-profil-wizard"

export function CreerProfilContent() {
    return <CreerProfilWizard />
}
