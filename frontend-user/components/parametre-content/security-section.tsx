/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Onglet Sécurité de la page de paramètres. Entièrement typé et épuré.
 * @created 2026-06-22
 * @updated 2026-07-13
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { Fingerprint, KeyRound, Shield, Trash2, UserX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ConfirmActionDialog } from "@/components/ui/confirm-action-dialog"
import { PinDialog, MfaDialog, ReauthDialog } from "./security-dialogs"
import { useSecuritySection } from "@/hooks/use-security-section"
import type { UserProfileData } from "@/hooks/use-settings"
import { SectionCard, SettingToggle } from "./settings-primitives"

// eslint-disable-next-line @typescript-eslint/no-empty-function -- setter requis par MfaDialog mais volontairement neutralisé ici
const noop = () => {}

interface SecuritySectionProps {
  profile: UserProfileData
  setProfile: (profile: UserProfileData) => void
  securitySettings: { two_factor_enabled: boolean }
  setSecuritySettings: (settings: { two_factor_enabled: boolean }) => void
  saveSettings: (payload: {
    security_preferences?: { two_factor_enabled: boolean }
  }, successMessage: string) => Promise<boolean>
}

export function SecuritySection({
  profile,
  setProfile,
  securitySettings,
  setSecuritySettings,
  saveSettings,
}: SecuritySectionProps) {
  const {
    pinDialogOpen,
    setPinDialogOpen,
    pinStep,
    tempPin,
    setTempPin,
    confirmPin,
    setConfirmPin,
    pinError,
    setPinError,
    mfaDialogOpen,
    setMfaDialogOpen,
    mfaStep,
    mfaPhoneNumber,
    setMfaPhoneNumber,
    mfaChannel,
    setMfaChannel,
    mfaCode,
    setMfaCode,
    mfaLoading,
    reauthDialogOpen,
    setReauthDialogOpen,
    reauthPassword,
    setReauthPassword,
    reauthPin,
    setReauthPin,
    showReauthPassword,
    setShowReauthPassword,
    reauthLoading,
    reauthError,
    pendingAction,
    isConfirmOpen,
    setIsConfirmOpen,
    accountLoading,
    handlePinToggle,
    handlePinSubmit,
    handleTwoFactorToggle,
    handleMfaEnroll,
    handleMfaVerify,
    handleReauthSubmit,
    handleDeactivateAccount,
    handleDeleteAccount,
    confirmDisable2fa,
    confirmDeactivateAccount,
    confirmDeleteAccount,
  } = useSecuritySection({
    profile,
    setProfile,
    securitySettings,
    setSecuritySettings,
    saveSettings,
  })

  return (
    <div className="space-y-4">
      {/* ── Authentification & accès ──────────────────────────────────── */}
      <SectionCard
        title="Authentification & Sécurité d'accès"
        icon={Shield}
        description="Protégez l'accès à votre espace utilisateur et à vos données confidentielles."
      >
        <div className="divide-y divide-border">
          <div className="py-3 first:pt-0 last:pb-0">
            <SettingToggle
              id="pin-security-toggle"
              icon={KeyRound}
              iconBg="bg-indigo-50 dark:bg-indigo-950/40"
              iconColor="text-indigo-600"
              title="Code PIN de Verrouillage"
              description="Sécurisez l'accès immédiat à votre tableau de bord et à vos transactions."
              checked={profile.pin_enabled}
              onCheckedChange={handlePinToggle}
            />
            {profile.pin_enabled && (
              <div className="pl-12.5 pt-1">
                <button
                  type="button"
                  onClick={() => handlePinToggle(true)}
                  className="text-xs font-bold text-[#013ff4] hover:underline underline-offset-2"
                >
                  Modifier le code PIN
                </button>
              </div>
            )}
          </div>

          <div className="py-3 first:pt-0 last:pb-0">
            <SettingToggle
              id="mfa-security-toggle"
              icon={Fingerprint}
              iconBg="bg-emerald-50 dark:bg-emerald-950/40"
              iconColor="text-emerald-600"
              title="Double Authentification (2FA)"
              description="Recevez un code de validation temporaire via WhatsApp ou SMS à chaque connexion sensible."
              checked={securitySettings.two_factor_enabled}
              onCheckedChange={(checked) => void handleTwoFactorToggle(checked)}
            />
          </div>
        </div>
      </SectionCard>

      {/* ── Zone de danger ─────────────────────────────────────────────── */}
      <SectionCard
        title="Zone de Danger"
        icon={Shield}
        className="border-red-100 bg-red-50/20 dark:border-red-900/40 dark:bg-red-950/20"
        description="Actions critiques et gestion du cycle de vie de votre compte EmiID."
      >
        <div className="divide-y divide-red-100/60 dark:divide-red-900/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3.5 first:pt-0">
            <div className="flex items-start gap-3.5 min-w-0 flex-1">
              <div className="w-9 h-9 rounded-none bg-amber-100/80 dark:bg-amber-900/40 flex items-center justify-center shrink-0 mt-0.5">
                <UserX className="h-4.5 w-4.5 text-amber-700 dark:text-amber-300" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-foreground leading-snug">Désactiver temporairement le compte</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  Votre profil public sera masqué de l&apos;annuaire et vos accès suspendus.
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleDeactivateAccount}
              disabled={accountLoading}
              className="w-full sm:w-auto shrink-0 h-10 px-4 rounded-none border-amber-200 dark:border-amber-800/50 text-amber-800 dark:text-amber-300 bg-card hover:bg-amber-50 text-xs font-bold shadow-xs transition-all"
            >
              Désactiver
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3.5 last:pb-0">
            <div className="flex items-start gap-3.5 min-w-0 flex-1">
              <div className="w-9 h-9 rounded-none bg-rose-100/80 dark:bg-rose-900/40 flex items-center justify-center shrink-0 mt-0.5">
                <Trash2 className="h-4.5 w-4.5 text-rose-600" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-foreground leading-snug">Supprimer définitivement le compte</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  Suppression irréversible de vos informations, identifiants et données de profil.
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={accountLoading}
              className="w-full sm:w-auto shrink-0 h-10 px-4 rounded-none text-xs font-bold shadow-xs transition-all"
            >
              Supprimer
            </Button>
          </div>
        </div>
      </SectionCard>

      {/* ── Dialogs ───────────────────────────────────────────────────── */}

      <PinDialog
        open={pinDialogOpen}
        onOpenChange={setPinDialogOpen}
        pinEnabled={profile.pin_enabled}
        pinStep={pinStep}
        tempPin={tempPin}
        confirmPin={confirmPin}
        pinError={pinError}
        onTempPinChange={setTempPin}
        onConfirmPinChange={setConfirmPin}
        onPinErrorChange={setPinError}
        onSubmit={() => void handlePinSubmit()}
      />

      <MfaDialog
        open={mfaDialogOpen}
        onOpenChange={setMfaDialogOpen}
        mfaStep={mfaStep}
        setMfaStep={noop}
        mfaPhoneNumber={mfaPhoneNumber}
        setMfaPhoneNumber={setMfaPhoneNumber}
        mfaChannel={mfaChannel}
        setMfaChannel={setMfaChannel}
        mfaCode={mfaCode}
        setMfaCode={setMfaCode}
        mfaLoading={mfaLoading}
        onEnroll={() => void handleMfaEnroll()}
        onVerify={() => void handleMfaVerify()}
      />

      <ReauthDialog
        open={reauthDialogOpen}
        onOpenChange={setReauthDialogOpen}
        profile={profile}
        reauthPin={reauthPin}
        setReauthPin={setReauthPin}
        reauthPassword={reauthPassword}
        setReauthPassword={setReauthPassword}
        showPassword={showReauthPassword}
        setShowPassword={setShowReauthPassword}
        reauthLoading={reauthLoading}
        reauthError={reauthError}
        onSubmit={(e) => void handleReauthSubmit(e)}
      />

      <ConfirmActionDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={() => {
          if (pendingAction === "disable2fa") void confirmDisable2fa()
          else if (pendingAction === "deactivate") void confirmDeactivateAccount()
          else if (pendingAction === "delete") void confirmDeleteAccount()
        }}
        variant={pendingAction === "delete" ? "destructive" : "warning"}
        title={
          pendingAction === "disable2fa" ? "Désactiver la 2FA ?" :
          pendingAction === "deactivate" ? "Désactiver le compte ?" :
          "Supprimer le compte ?"
        }
        description={
          pendingAction === "disable2fa" ? "Votre compte sera moins sécurisé. Voulez-vous continuer ?" :
          pendingAction === "deactivate" ? "Votre profil ne sera plus visible. Vous pourrez le réactiver plus tard." :
          "Cette action est irréversible. Toutes vos données seront définitivement supprimées."
        }
        confirmText={
          pendingAction === "delete" ? "Supprimer définitivement" :
          "Confirmer"
        }
        isLoading={accountLoading}
      />
    </div>
  )
}
