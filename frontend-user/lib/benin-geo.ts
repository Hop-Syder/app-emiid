/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Référentiel géographique officiel de la République du Bénin (12 départements, 77 communes).
 * @created 2026-09-05
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

export interface BeninDepartment {
  id: string
  name: string
  communes: string[]
}

export const BENIN_DEPARTMENTS: BeninDepartment[] = [
  {
    id: "alibori",
    name: "Alibori",
    communes: ["Banikoara", "Gogounou", "Kandi", "Karimama", "Malanville", "Ségbana"],
  },
  {
    id: "atacora",
    name: "Atacora",
    communes: [
      "Boukoumbé",
      "Cobly",
      "Kérou",
      "Kouandé",
      "Matéri",
      "Natitingou",
      "Pehunco",
      "Tanguiéta",
      "Toucountouna",
    ],
  },
  {
    id: "atlantique",
    name: "Atlantique",
    communes: [
      "Abomey-Calavi",
      "Allada",
      "Kpomassè",
      "Ouidah",
      "Sô-Ava",
      "Toffo",
      "Tori-Bossito",
      "Zè",
    ],
  },
  {
    id: "borgou",
    name: "Borgou",
    communes: [
      "Bembèrèkè",
      "Kalalé",
      "N'Dali",
      "Nikki",
      "Parakou",
      "Pèrèrè",
      "Sinendé",
      "Tchaourou",
    ],
  },
  {
    id: "collines",
    name: "Collines",
    communes: ["Bantè", "Dassa-Zoumè", "Glazoué", "Ouèssè", "Savalou", "Savè"],
  },
  {
    id: "couffo",
    name: "Couffo",
    communes: ["Aplahoué", "Djakotomey", "Dogbo", "Klouékanmè", "Lalo", "Toviklin"],
  },
  {
    id: "donga",
    name: "Donga",
    communes: ["Bassila", "Copargo", "Djougou", "Ouaké"],
  },
  {
    id: "littoral",
    name: "Littoral",
    communes: ["Cotonou"],
  },
  {
    id: "mono",
    name: "Mono",
    communes: ["Athiémé", "Bopa", "Comè", "Grand-Popo", "Houéyogbé", "Lokossa"],
  },
  {
    id: "oueme",
    name: "Ouémé",
    communes: [
      "Adjarra",
      "Adjohoun",
      "Aguégués",
      "Akpro-Missérété",
      "Avrankou",
      "Bonou",
      "Dangbo",
      "Porto-Novo",
      "Sèmè-Kpodji",
    ],
  },
  {
    id: "plateau",
    name: "Plateau",
    communes: ["Adja-Ouèrè", "Ifangni", "Kétou", "Pobè", "Sakété"],
  },
  {
    id: "zou",
    name: "Zou",
    communes: [
      "Abomey",
      "Agbangnizoun",
      "Bohicon",
      "Covè",
      "Djidja",
      "Ouinhi",
      "Za-Kpota",
      "Zagnanado",
      "Zogbodomey",
    ],
  },
]

export function getDepartmentById(id?: string | null): BeninDepartment | undefined {
  if (!id) return undefined
  return BENIN_DEPARTMENTS.find((d) => d.id.toLowerCase() === id.toLowerCase())
}

export function getCommunesByDepartmentId(id?: string | null): string[] {
  const dept = getDepartmentById(id)
  return dept ? dept.communes : []
}
