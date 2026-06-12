"use client";

import { motion } from "framer-motion";

const stats = [
  { id: 1, name: "Startups Innovantes", value: "500+" },
  { id: 2, name: "Investisseurs Actifs", value: "150+" },
  { id: 3, name: "Mises en relation", value: "10,000+" },
  { id: 4, name: "Pays Couverts", value: "35" },
];

export function SocialProofSection() {
  return (
    <section className="bg-white dark:bg-gray-900 py-24 sm:py-32">
      <div className="mx-auto max-w-[1440px] px-8 md:px-12 lg:px-16">
        <div className="mx-auto max-w-2xl lg:max-w-none">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Rejoignez l'écosystème de confiance
            </h2>
            <p className="mt-4 text-lg leading-8 text-gray-600">
              Des milliers d'acteurs de la tech africaine font déjà confiance à Emiid pour propulser leur croissance.
            </p>
          </div>
          <dl className="mt-16 grid grid-cols-1 gap-0.5 overflow-hidden rounded-2xl text-center sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex flex-col bg-gray-50/50 p-8"
              >
                <dt className="text-sm font-semibold leading-6 text-gray-600 uppercase tracking-wide">{stat.name}</dt>
                <dd className="order-first text-4xl font-bold tracking-tight text-indigo-600 mb-2">{stat.value}</dd>
              </motion.div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
