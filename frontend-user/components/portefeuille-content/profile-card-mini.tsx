/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Carte de profil miniature pour le portefeuille avec style Luxury Glassmorphism et Note Taker optimisé
 * @created 2026-05-24
 * @updated 2026-06-22
 * 🌐 ceo.nexuspartners.xyz
 */

"use client";

import { StickyNote, Loader2, CheckCircle2, UserMinus, Mail, MapPin, ExternalLink, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Image from "next/image";

export interface ProfileData {
  id: string;
  slug?: string;
  name: string;
  role: string;
  location: string;
  avatar: string;
  lastActive: string;
  newUpdates: number;
  lastUpdate: string;
  followers: number;
  premium?: boolean;
  verified?: boolean;
  specialty?: string;
  notes?: string;
  card_variant?: string;
  isActiveToday?: boolean;
}

interface ProfileCardMiniProps {
  profile: ProfileData;
  onUnfollow?: (id: string) => void;
  onViewProfile?: (id: string) => void;
  onSaveNote?: (id: string, note: string) => void;
  onMessage?: (id: string) => void;
  isUnfollowing?: boolean;
}

export function ProfileCardMini({ profile, onUnfollow, onViewProfile, onSaveNote, onMessage, isUnfollowing = false }: ProfileCardMiniProps) {
  const [localNote, setLocalNote] = useState(profile.notes || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSaveNote?.(profile.id, localNote);
    } finally {
      setIsSaving(false);
    }
  };

  const isPremium = !!profile.premium;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.3 }}
      className="group w-full flex flex-col lg:flex-row gap-4 items-stretch"
    >
      {/* ─── Identity Block ─── */}
      <Card
        className={cn(
          "relative w-full lg:w-[360px] rounded-2xl p-5 cursor-pointer overflow-hidden transition-all duration-300 backdrop-blur-md flex flex-col justify-between group/id shadow-sm border",
          isPremium
            ? "bg-slate-950/45 dark:bg-black/50 border-amber-500/25 hover:border-amber-500/50 shadow-[0_0_20px_rgba(212,175,55,0.08)] text-white"
            : "bg-card/75 border-border hover:border-foreground/20 text-foreground"
        )}
        onClick={() => onViewProfile?.(profile.slug || profile.id)}
      >
        {isPremium && (
          <div className="absolute top-0 right-0 p-3 opacity-20 pointer-events-none">
            <div className="w-20 h-20 bg-amber-500/30 blur-2xl rounded-full" />
          </div>
        )}

        <div className="relative z-10 flex flex-row items-center gap-4">
          <div className="relative shrink-0 group/avatar">
            <Image
              src={profile.avatar}
              alt={profile.name}
              width={64}
              height={64}
              className={cn(
                "relative h-16 w-16 rounded-full object-cover shadow-md transition-transform duration-300 group-hover/avatar:scale-105",
                isPremium ? "ring-2 ring-amber-500/30" : "ring-1 ring-border"
              )}
            />
            {profile.verified && (
              <div className={cn(
                "absolute -bottom-1 -right-1 rounded-full p-0.5 shadow-sm border-2",
                isPremium ? "bg-black border-amber-500" : "bg-background border-primary/20"
              )}>
                <CheckCircle2 className={cn("h-3.5 w-3.5", isPremium ? "text-amber-500" : "text-primary")} />
              </div>
            )}
          </div>

          <div className="flex flex-col flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold tracking-tight truncate group-hover/id:text-primary dark:group-hover/id:text-secondary transition-colors">
                {profile.name}
              </h3>
              {profile.isActiveToday && (
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
              )}
            </div>
            
            <span className={cn(
              "text-[10px] font-bold uppercase tracking-widest mt-0.5 truncate",
              isPremium ? "text-amber-400" : "text-primary"
            )}>
              {profile.role}
            </span>
            <div className="flex items-center gap-1.5 opacity-60 mt-1.5 truncate">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span className="text-[11px] font-medium truncate">{profile.location}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="relative z-10 flex items-center gap-2 mt-5">
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onMessage?.(profile.id);
            }}
            className={cn(
              "flex-1 h-9 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all",
              isPremium
                ? "bg-amber-500 text-black hover:bg-amber-400"
                : "bg-primary text-primary-foreground hover:opacity-90"
            )}
          >
            <Mail className="h-3.5 w-3.5 mr-1.5" /> Message
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={isUnfollowing}
            onClick={(e) => {
              e.stopPropagation();
              onUnfollow?.(profile.id);
            }}
            className={cn(
              "h-9 w-9 p-0 rounded-xl transition-all shrink-0 border-border bg-background hover:bg-muted disabled:opacity-60",
              isPremium ? "text-white/60 hover:text-white" : "text-muted-foreground hover:text-foreground"
            )}
            title="Ne plus suivre"
          >
            {isUnfollowing ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserMinus className="h-4 w-4" />}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onViewProfile?.(profile.slug || profile.id);
            }}
            className="h-9 w-9 p-0 rounded-xl opacity-60 hover:opacity-100 hover:bg-muted shrink-0 text-muted-foreground"
            title="Voir le profil"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </Card>

      {/* ─── CRM Notes Block ─── */}
      <Card className={cn(
        "flex-1 p-5 rounded-2xl flex flex-col justify-between transition-all duration-300 relative overflow-hidden backdrop-blur-md border shadow-sm",
        isPremium
          ? "bg-slate-950/65 border-amber-500/15 text-white shadow-[0_0_25px_rgba(245,158,11,0.03)]"
          : "bg-white/80 dark:bg-slate-900/60 border-slate-200/60 dark:border-slate-800/60 text-slate-800 dark:text-slate-100"
      )}>
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={cn("p-1.5 rounded-lg", isPremium ? "bg-amber-500/10" : "bg-indigo-50 dark:bg-indigo-950/50")}>
                <StickyNote className={cn("h-4 w-4 opacity-90", isPremium ? "text-amber-500" : "text-indigo-500 dark:text-indigo-400")} />
              </div>
              <span className={cn("text-[10px] font-bold uppercase tracking-wider", isPremium ? "text-slate-400" : "text-slate-700 dark:text-slate-350")}>Notes Privées</span>
            </div>
            {isSaving ? (
              <Loader2 className={cn("h-3.5 w-3.5 animate-spin opacity-70", isPremium ? "text-amber-500" : "text-indigo-500")} />
            ) : (
              <div
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  localNote !== (profile.notes || "")
                    ? (isPremium ? "bg-amber-500 animate-pulse" : "bg-indigo-500 animate-pulse")
                    : "bg-emerald-500"
                )}
              />
            )}
          </div>

          <div className="relative mt-2">
            <Textarea
              value={localNote}
              onChange={(e) => setLocalNote(e.target.value)}
              placeholder="Ajouter des observations privées sur ce contact..."
              className={cn(
                "w-full min-h-[60px] text-xs resize-none bg-transparent border-0 focus-visible:ring-0 p-0 shadow-none font-medium leading-relaxed",
                isPremium ? "placeholder:text-slate-500 text-white" : "placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-800 dark:text-slate-100"
              )}
            />
          </div>
        </div>

        <div className={cn("flex items-center justify-between mt-4 pt-3 border-t", isPremium ? "border-white/10" : "border-slate-100 dark:border-slate-800")}>
          <span className={cn("text-[10px] font-semibold truncate max-w-[150px]", isPremium ? "text-slate-500" : "text-slate-400 dark:text-slate-500")}>
            {profile.lastUpdate || "Aucune note"}
          </span>

          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving || localNote === (profile.notes || "")}
            className={cn(
              "h-8 px-4 rounded-xl font-bold text-[9px] uppercase tracking-wider transition-all",
              localNote !== (profile.notes || "")
                ? (isPremium 
                    ? "bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/25" 
                    : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/10")
                : (isPremium 
                    ? "bg-white/5 text-white/30 cursor-not-allowed border border-white/5" 
                    : "bg-slate-100 text-slate-400 dark:bg-slate-800/50 dark:text-slate-600 cursor-not-allowed")
            )}
          >
            <Save className="h-3 w-3 mr-1.5" /> Enregistrer
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
