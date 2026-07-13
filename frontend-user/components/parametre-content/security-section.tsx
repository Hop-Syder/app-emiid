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

import { Fingerprint, KeyRound, LogOut, Shield, Trash2, UserX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { ConfirmActionDialog } from "@/components/ui/confirm-action-dialog"
import { PinDialog, MfaDialog, ReauthDialog } from "./security-dialogs"
import { useSecuritySection } from "@/hooks/use-security-section"
import type { UserProfileData } from "@/hooks/use-settings"

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
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6">
        <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-5">
          Authentification et accès
        </h2>
        <div className="divide-y divide-slate-100">
          <div className="flex items-start justify-between gap-4 py-4 first:pt-0">
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <div className="shrink-0 mt-0.5 w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                <KeyRound className="h-4 w-4 text-slate-500" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900">Verrouillage par Code PIN</p>
                <p className="text-xs text-slate-500 mt-0.5">Sécurisez l&apos;accès au tableau de bord</p>
                {profile.pin_enabled && (
                  <button
                    onClick={() => handlePinToggle(true)}
                    className="mt-2 text-xs font-bold text-primary hover:underline underline-offset-2"
                  >
                    Modifier le code PIN
                  </button>
                )}
              </div>
            </div>
            <Switch className="shrink-0 mt-1" checked={profile.pin_enabled} onCheckedChange={handlePinToggle} />
          </div>

          <div className="flex items-start justify-between gap-4 py-4 last:pb-0">
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <div className="shrink-0 mt-0.5 w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                <Fingerprint className="h-4 w-4 text-slate-500" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900">Authentification à deux facteurs (2FA)</p>
                <p className="text-xs text-slate-500 mt-0.5">Code de validation via WhatsApp ou SMS</p>
              </div>
            </div>
            <Switch
              className="shrink-0 mt-1"
              checked={securitySettings.two_factor_enabled}
              onCheckedChange={(checked) => void handleTwoFactorToggle(checked)}
            />
          </div>
        </div>
      </div>

      {/* ── Zone de danger ─────────────────────────────────────────────── */}
      <div className="bg-white border border-red-100 rounded-2xl p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-5">
          <Shield className="h-3.5 w-3.5 text-red-500 shrink-0" />
          <h2 className="text-[11px] font-black text-red-400 uppercase tracking-wider">Zone de danger</h2>
        </div>
        <div className="divide-y divide-red-50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-4 first:pt-0">
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <div className="shrink-0 mt-0.5 w-8 h-8 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center">
                <UserX className="h-4 w-4 text-red-500" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900">Désactiver le compte</p>
                <p className="text-xs text-slate-500 mt-0.5">Votre compte sera masqué et l&apos;accès bloqué</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleDeactivateAccount}
              disabled={accountLoading}
              className="w-full sm:w-auto shrink-0 h-9 rounded-xl border-red-200 text-red-600 bg-transparent hover:bg-red-50 hover:text-red-700 text-sm font-bold"
            >
              Désactiver
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-4 last:pb-0">
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <div className="shrink-0 mt-0.5 w-8 h-8 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center">
                <Trash2 className="h-4 w-4 text-red-500" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900">Supprimer le compte</p>
                <p className="text-xs text-slate-500 mt-0.5">Suppression définitive de toutes vos données</p>
              </div>
            </div>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={accountLoading}
              className="w-full sm:w-auto shrink-0 h-9 rounded-xl text-sm font-bold"
            >
              Supprimer
            </Button>
          </div>
        </div>
      </div>

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
        setMfaStep={() => {}}
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
