/**
 * @description Hub de modération — vue d'ensemble unifiée (galerie + signalements).
 */

import Link from "next/link"
import Image from "next/image"
import {
  CheckCircle2,
  Clock,
  Flag,
  Image as ImageIcon,
  MessageSquare,
  ShieldAlert,
  UserX,
  ArrowRight,
} from "lucide-react"
import { getModerationCounts, getContentReports, getGalleryItems } from "@/lib/actions/admin"

export const metadata = {
  title: "Modération | EmiID Admin",
  description: "Vue d'ensemble de la file de modération",
}

export default async function ModerationHubPage() {
  const [counts, recentReports, galleryItems] = await Promise.all([
    getModerationCounts(),
    getContentReports({ status: "open", limit: 5 }),
    getGalleryItems(),
  ])

  const pendingGallery = galleryItems.filter((i) => i.status === "pending").slice(0, 5)

  const kpis = [
    {
      label: "Tâches en attente",
      value: counts.totalPending,
      icon: ShieldAlert,
      tone: "bg-rose-100 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400",
      href: "#pending-list",
      testId: "kpi-total-pending",
    },
    {
      label: "Galeries à modérer",
      value: counts.galleryPending,
      icon: ImageIcon,
      tone: "bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400",
      href: "/moderation/galerie",
      testId: "kpi-gallery-pending",
    },
    {
      label: "Signalements ouverts",
      value: counts.reportsOpen,
      icon: Flag,
      tone: "bg-orange-100 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400",
      href: "/moderation/signalements",
      testId: "kpi-reports-open",
    },
  ]

  const breakdown = [
    { type: "gallery", label: "Galerie", icon: ImageIcon, count: counts.reportsByType.gallery, tone: "text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20" },
    { type: "message", label: "Messages", icon: MessageSquare, count: counts.reportsByType.message, tone: "text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20" },
    { type: "profile", label: "Profils", icon: UserX, count: counts.reportsByType.profile, tone: "text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/20" },
  ]

  return (
    <div className="space-y-8" data-testid="moderation-hub-page">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-rose-500 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-rose-200 dark:shadow-rose-950/40 shrink-0">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Modération</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">File centralisée — galerie, signalements utilisateurs et contenus</p>
          </div>
        </div>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {kpis.map((kpi) => (
          <Link
            key={kpi.label}
            href={kpi.href}
            data-testid={kpi.testId}
            className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-md transition group"
          >
            <div className="flex items-start justify-between">
              <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${kpi.tone}`}>
                <kpi.icon className="h-6 w-6" />
              </div>
              <ArrowRight className="h-4 w-4 text-slate-300 dark:text-slate-600 group-hover:text-blue-500 group-hover:translate-x-0.5 transition" />
            </div>
            <p className="mt-5 text-3xl font-bold text-slate-900 dark:text-white">{kpi.value}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{kpi.label}</p>
          </Link>
        ))}
      </div>

      {/* Breakdown */}
      <section className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Signalements par type</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {breakdown.map((b) => (
            <div key={b.type} data-testid={`breakdown-${b.type}`} className="flex items-center gap-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 p-4">
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${b.tone}`}>
                <b.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500 font-semibold">{b.label}</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">{b.count}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recent items */}
      <section id="pending-list" className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Gallery pending */}
        <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Galerie à modérer</h2>
            <Link href="/moderation/galerie" className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-semibold" data-testid="see-all-gallery">
              Tout voir →
            </Link>
          </div>
          {pendingGallery.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-700 p-6 text-center text-sm text-slate-500 dark:text-slate-400">
              <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto mb-2" />
              Aucun projet en attente.
            </div>
          ) : (
            <ul className="space-y-2">
              {pendingGallery.map((item) => (
                <li key={item.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <div className="h-12 w-12 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0">
                    {item.image_url ? (
                      <Image src={item.image_url} alt="" className="w-full h-full object-cover" width={48} height={48} unoptimized />
                    ) : (
                      <ImageIcon className="h-5 w-5 text-slate-400 dark:text-slate-500 mx-auto mt-3.5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{item.title || "Projet sans titre"}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Par {item.user_name} · {new Date(item.created_at).toLocaleDateString("fr-FR")}</p>
                  </div>
                  <Clock className="h-4 w-4 text-amber-500 flex-shrink-0" />
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Reports recent */}
        <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Signalements récents</h2>
            <Link href="/moderation/signalements" className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-semibold" data-testid="see-all-reports">
              Tout voir →
            </Link>
          </div>
          {recentReports.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-700 p-6 text-center text-sm text-slate-500 dark:text-slate-400">
              <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto mb-2" />
              Aucun signalement ouvert.
            </div>
          ) : (
            <ul className="space-y-2">
              {recentReports.map((r) => (
                <li key={r.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    r.subject_type === "gallery" ? "bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400"
                    : r.subject_type === "message" ? "bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400"
                    : "bg-purple-100 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400"
                  }`}>
                    {r.subject_type === "gallery" ? <ImageIcon className="h-5 w-5" />
                      : r.subject_type === "message" ? <MessageSquare className="h-5 w-5" />
                      : <UserX className="h-5 w-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{r.subject_preview || "(contenu indisponible)"}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      Signalé par {r.reporter_name} · {new Date(r.created_at).toLocaleDateString("fr-FR")}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-300 italic mt-1 line-clamp-1">« {r.reason} »</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  )
}
