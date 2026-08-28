/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Page de la Politique de Confidentialité
 * @created 2026-05-11
*/

import React from 'react'
import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Confidentialité - EmiID',
  description: 'Politique de confidentialité et protection des données de EmiID.',
}

export default function ConfidentialitePage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden">
        <div className="bg-emerald-600 px-6 py-8 sm:px-10">
          <h1 className="text-3xl font-extrabold text-white text-center">
            Politique de Confidentialité
          </h1>
          <p className="mt-2 text-emerald-100 text-center text-sm">
            Dernière mise à jour : 11 Mai 2026
          </p>
        </div>
        
        <div className="px-6 py-10 sm:px-10 text-slate-700 leading-relaxed space-y-8">
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
              <span className="bg-emerald-100 text-emerald-700 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">1</span>
              Collecte des Données
            </h2>
            <p>
              Nous collectons les informations que vous nous fournissez directement lors de la création de votre profil (nom, email, profession, etc.) ainsi que les données relatives à votre utilisation de la plateforme.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
              <span className="bg-emerald-100 text-emerald-700 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">2</span>
              Utilisation des Données
            </h2>
            <p>
              Vos données sont utilisées pour :
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Afficher votre profil professionnel dans l&apos;annuaire.</li>
              <li>Permettre la communication entre les membres.</li>
              <li>Améliorer nos services et la sécurité de la plateforme.</li>
              <li>Vous envoyer des notifications importantes.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
              <span className="bg-emerald-100 text-emerald-700 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">3</span>
              Protection des Données
            </h2>
            <p>
              Nous mettons en œuvre des mesures de sécurité techniques (chiffrement, accès restreints) pour protéger vos données contre tout accès non autorisé. Vos codes PIN sont hashés et ne sont jamais stockés en clair.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
              <span className="bg-emerald-100 text-emerald-700 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">4</span>
              Partage des Données
            </h2>
            <p>
              Nous ne vendons jamais vos données personnelles à des tiers. Vos informations de profil ne sont visibles par les autres membres que si vous choisissez de publier votre profil.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
              <span className="bg-emerald-100 text-emerald-700 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">5</span>
              Vos Droits (RGPD)
            </h2>
            <p>
              Vous disposez d&apos;un droit d&apos;accès, de rectification et de suppression de vos données. Vous pouvez exercer ces droits directement depuis vos paramètres de profil ou en nous contactant.
            </p>
          </section>

          <div className="pt-8 border-t border-slate-100 flex justify-between items-center">
            <Link href="/" className="text-emerald-600 hover:text-emerald-500 font-medium transition-colors">
              ← Retour à l&apos;accueil
            </Link>
            <Link href="/conditions" className="text-slate-500 hover:text-slate-700 text-sm transition-colors">
              Conditions Générales
            </Link>
          </div>
        </div>
      </div>
      
      <div className="mt-8 text-center text-slate-400 text-xs">
        &copy; 2026 Nexus Partners. Tous droits réservés.
      </div>
    </div>
  )
}
