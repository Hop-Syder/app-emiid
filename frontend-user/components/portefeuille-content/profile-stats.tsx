/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Statistiques de suivi avec design Bento premium
 * @created 2026-04-19
 * @updated 2026-06-03
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Users, Activity, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

interface ProfileStatsProps {
  total: number;
  updates: number;
  activeToday: number;
}

export function ProfileStats({ total, updates, activeToday }: ProfileStatsProps) {
  const stats = [
    {
      label: "Profils suivis",
      value: total,
      icon: Users,
      color: "text-blue-500 dark:text-blue-400",
      bg: "bg-blue-500/10 dark:bg-blue-500/5",
      border: "border-blue-500/10 dark:border-blue-400/20",
      gradient: "from-blue-500/10 to-transparent",
    },
    {
      label: "Mises à jour",
      value: updates,
      icon: RefreshCw,
      color: "text-amber-500 dark:text-amber-400",
      bg: "bg-amber-500/10 dark:bg-amber-500/5",
      border: "border-amber-500/10 dark:border-amber-400/20",
      gradient: "from-amber-500/10 to-transparent",
    },
    {
      label: "Actifs aujourd'hui",
      value: activeToday,
      icon: Activity,
      color: "text-emerald-500 dark:text-emerald-400",
      bg: "bg-emerald-500/10 dark:bg-emerald-500/5",
      border: "border-emerald-500/10 dark:border-emerald-400/20",
      gradient: "from-emerald-500/10 to-transparent",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.08, duration: 0.4 }}
        >
          <Card className="overflow-hidden border border-border bg-card relative group hover:border-foreground/20 transition-colors duration-300">
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
            <CardContent className="p-6 relative z-10 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{stat.label}</p>
                <h3 className={`text-3xl font-black tracking-tight ${stat.color}`}>
                  {stat.value}
                </h3>
              </div>
              <div className={`p-3.5 rounded-2xl ${stat.bg} ${stat.color} border ${stat.border} transition-transform duration-300 group-hover:scale-105`}>
                <stat.icon className="h-5.5 w-5.5" />
              </div>
            </CardContent>
            
            {/* Visual highlight line */}
            <div className={`absolute bottom-0 left-0 h-[2px] w-0 bg-current transition-all duration-500 group-hover:w-full ${stat.color}`} />
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
