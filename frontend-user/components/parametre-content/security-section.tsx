/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Onglet Sécurité : code PIN, double authentification TOTP
 *              (Google / Microsoft Authenticator) et zone de danger.
 * @created 2026-06-22
 * @updated 2026-10-08
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { Fingerprint, KeyRound, Shield, Trash2, UserX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ConfirmActionDialog } from "@/components/ui/confirm-action-dialog"
import { PinDialog, TotpEnrollDialog, IdentityCheckDialog } from "./security-dialogs"
import { useSecuritySection } from "@/hooks/use-security-section"
import type { UserProfileData } from "@/hooks/use-settings"
import { SectionCard, SettingToggle } from "./settings-primitives"

interface SecuritySectionProps {
  profile: UserProfileData
  setProfile: (profile: UserProfileData) => void
}

/** Ligne d'action de la zone de danger. */
function DangerRow({
  icon: Icon, iconClass, title, description, action,
}: { icon: React.ElementType; iconClass: string; title: string; description: string; action: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3.5 first:pt-0 last:pb-0">
      <div className="flex items-start gap-3.5 min-w-0 flex-1">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${iconClass}`}>
          <Icon className="h-4.5 w-4.5" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-foreground leading-snug">{title}</p>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{description}</p>
        </div>
      </div>
      {action}
    </div>
  )
}

export function SecuritySection({ profile, setProfile }: SecuritySectionProps) {
  const s = useSecuritySection({ profile, setProfile })

  return (
    <div className="space-y-4">
      <SectionCard
        title="Authentification & accès"
        icon={Shield}
        description="Protégez l'accès à votre espace et à vos données."
      >
        <div className="divide-y divide-border">
          <div className="py-3 first:pt-0">
            <SettingToggle
              id="mfa-security-toggle"
              icon={Fingerprint}
              iconBg="bg-emerald-50 dark:bg-emerald-950/40"
              iconColor="text-emerald-600"
              title="Double authentification (2FA)"
              description="À chaque connexion, un code de Google Authenticator ou Microsoft Authenticator vous sera demandé."
              checked={s.totpEnabled}
              disabled={s.totpLoading}
              onCheckedChange={s.handleTotpToggle}
            />
          </div>

          <div className="py-3 last:pb-0">
            <SettingToggle
              id="pin-security-toggle"
              icon={KeyRound}
              iconBg="bg-indigo-50 dark:bg-indigo-950/40"
              iconColor="text-indigo-600"
              title="Code PIN de verrouillage"
              description="Verrouille l'accès à votre tableau de bord sur cet appareil."
              checked={profile.pin_enabled}
              onCheckedChange={s.handlePinToggle}
            />
            {profile.pin_enabled && (
              <div className="pl-12.5 pt-1">
                <button
                  type="button"
                  onClick={() => s.requestAction("pin-change")}
                  className="text-xs font-bold text-[#013ff4] hover:underline underline-offset-2 cursor-pointer"
                >
                  Modifier le code PIN
                </button>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Demande votre PIN actuel{s.totpEnabled ? " ou un code de votre application d'authentification" : ""}.
                </p>
              </div>
            )}
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Zone de danger"
        icon={Shield}
        className="border-red-200/80 bg-red-50/10 dark:border-red-900/40 dark:bg-red-950/20"
        description="Actions critiques sur votre compte EmiID."
      >
        <div className="divide-y divide-red-100/60 dark:divide-red-900/40">
          <DangerRow
            icon={UserX}
            iconClass="bg-amber-100/80 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300"
            title="Désactiver temporairement le compte"
            description="Votre profil est masqué de l'annuaire et vos accès suspendus."
            action={
              <Button
                type="button"
                variant="outline"
                onClick={() => s.requestAction("deactivate")}
                disabled={s.accountLoading}
                className="w-full sm:w-auto shrink-0 h-10 px-4 rounded-xl border-amber-200 dark:border-amber-800/50 text-amber-800 dark:text-amber-300 text-xs font-bold"
              >
                Désactiver
              </Button>
            }
          />
          <DangerRow
            icon={Trash2}
            iconClass="bg-rose-100/80 dark:bg-rose-900/40 text-rose-600"
            title="Supprimer définitivement le compte"
            description="Suppression irréversible de vos informations et de votre profil."
            action={
              <Button
                type="button"
                variant="destructive"
                onClick={() => s.requestAction("delete")}
                disabled={s.accountLoading}
                className="w-full sm:w-auto shrink-0 h-10 px-4 rounded-xl text-xs font-bold"
              >
                Supprimer
              </Button>
            }
          />
        </div>
      </SectionCard>

      <PinDialog
        open={s.pinDialogOpen}
        onOpenChange={s.setPinDialogOpen}
        isChange={profile.pin_enabled}
        saving={s.pinSaving}
        onSubmit={s.submitNewPin}
      />

      <TotpEnrollDialog
        open={s.enroll.open}
        onOpenChange={s.closeEnroll}
        qrCode={s.enroll.qrCode}
        secret={s.enroll.secret}
        loading={s.enrollLoading}
        onVerify={s.verifyTotpEnroll}
      />

      <IdentityCheckDialog
        open={s.pendingAction !== null}
        onOpenChange={(open) => { if (!open) s.cancelIdentity() }}
        methods={s.identityMethods}
        title={s.identityTitle}
        loading={s.identityLoading}
        error={s.identityError}
        onSubmit={(method, secret, captcha) => void s.submitIdentity(method, secret, captcha)}
      />

      <ConfirmActionDialog
        isOpen={s.confirmAction !== null}
        onClose={() => s.setConfirmAction(null)}
        onConfirm={() => void s.runAccountAction()}
        variant={s.confirmAction === "delete" ? "destructive" : "warning"}
        title={s.confirmAction === "delete" ? "Supprimer le compte ?" : "Désactiver le compte ?"}
        description={
          s.confirmAction === "delete"
            ? "Cette action est irréversible. Toutes vos données seront définitivement supprimées."
            : "Votre profil ne sera plus visible. Vous pourrez le réactiver plus tard."
        }
        confirmText={s.confirmAction === "delete" ? "Supprimer définitivement" : "Confirmer"}
        isLoading={s.accountLoading}
      />
    </div>
  )
}
