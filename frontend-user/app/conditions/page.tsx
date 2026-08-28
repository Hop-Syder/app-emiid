/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Page des Conditions Générales d'Utilisation (CGU)
 * @created 2026-05-11
*/

import React from 'react'
import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Conditions Générales - EmiID',
  description: 'Conditions générales d’utilisation de la plateforme EmiID.',
}

export default function ConditionsPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden">
        <div className="bg-indigo-600 px-6 py-8 sm:px-10">
          <h1 className="text-3xl font-extrabold text-white text-center">
            Conditions Générales d&apos;Utilisation
          </h1>
          <p className="mt-2 text-indigo-100 text-center text-sm">
            Dernière mise à jour : 11 Mai 2026
          </p>
        </div>
        
        <div className="px-6 py-10 sm:px-10 text-slate-700 leading-relaxed space-y-8">
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
              <span className="bg-indigo-100 text-indigo-700 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">1</span>
              Acceptation des Conditions
            </h2>
            <p>
              En accédant et en utilisant la plateforme EmiID, vous acceptez d&apos;être lié par les présentes Conditions Générales d&apos;Utilisation. Si vous n&apos;acceptez pas ces conditions, veuillez ne pas utiliser nos services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
              <span className="bg-indigo-100 text-indigo-700 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">2</span>
              Description du Service
            </h2>
            <p>
              EmiID est une plateforme de mise en relation professionnelle. Nous fournissons des outils pour créer des profils numériques, échanger des messages et gérer un portefeuille de contacts professionnels.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
              <span className="bg-indigo-100 text-indigo-700 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">3</span>
              Responsabilité de l&apos;Utilisateur
            </h2>
            <p>
              Vous êtes responsable du contenu que vous publiez sur votre profil. Vous vous engagez à fournir des informations exactes et à ne pas usurper l&apos;identité d&apos;un tiers. Toute utilisation abusive de la messagerie peut entraîner la suspension de votre compte.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
              <span className="bg-indigo-100 text-indigo-700 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">4</span>
              Propriété Intellectuelle
            </h2>
            <p>
              Tous les éléments de la plateforme (logos, designs, codes) sont la propriété exclusive de Nexus Partners. Toute reproduction sans autorisation est strictement interdite.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
              <span className="bg-indigo-100 text-indigo-700 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">5</span>
              Modification des Conditions
            </h2>
            <p>
              Nous nous réservons le droit de modifier ces conditions à tout moment. Les utilisateurs seront informés des changements majeurs via la plateforme.
            </p>
          </section>

          <div className="pt-8 border-t border-slate-100 flex justify-between items-center">
            <Link href="/" className="text-indigo-600 hover:text-indigo-500 font-medium transition-colors">
              ← Retour à l&apos;accueil
            </Link>
            <Link href="/confidentialite" className="text-slate-500 hover:text-slate-700 text-sm transition-colors">
              Politique de Confidentialité
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
