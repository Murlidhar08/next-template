"use client";

import { motion } from "framer-motion";
import { Mail, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { BetterAuthActionButton } from "@/components/auth/better-auth-action-button";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { LoadingSwap } from "@/components/ui/loading-swap";

import { getListUserAccounts } from "@/actions/user-settings.actions";
import { useUserConfig } from "@/components/providers/user-config-provider";
import { authClient } from "@/lib/auth/auth-client";
import { t } from "@/lib/languages/i18n";
import { cn } from "@/lib/utils";
import { TwoFactorAuth } from "./two-factor-auth";

interface SecurityModalBodyProps {
    email: string
    isTwoFactorEnabled: boolean
}

const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 }
};

export function SecurityModalBody({ email, isTwoFactorEnabled }: SecurityModalBodyProps) {
    const [hasPasswordAccount, setHasPasswordAccount] = useState<boolean>();
    const { language } = useUserConfig();

    useEffect(() => {
        getListUserAccounts()
            .then(accounts => {
                const hasPassAcc = accounts.some(a => a.providerId === "credential")
                setHasPasswordAccount(hasPassAcc);
            })
    }, [])

    return (
        <div className="space-y-10">
            {/* Password Management */}
            <motion.section variants={itemVariants} className="space-y-4">
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">
                    {t("security.secure_access", language)}
                </h3>
                <div className="rounded-[2.5rem] bg-card border shadow-xs p-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-colors" />

                    {hasPasswordAccount === undefined ? (
                        <div className="space-y-4">
                            <div className="h-4 w-32 animate-pulse bg-muted rounded" />
                            <div className="h-12 w-full animate-pulse bg-muted rounded-2xl" />
                            <div className="h-12 w-full animate-pulse bg-muted rounded-2xl" />
                        </div>
                    ) : hasPasswordAccount ? (
                        <ChangePasswordForm />
                    ) : (
                        <SetPasswordForm email={email} />
                    )}
                </div>
            </motion.section>

            {/* Two Factor Authentication */}
            <motion.section
                variants={itemVariants}
                className="space-y-4"
            >
                <div className="flex items-center justify-between ml-2">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                        {t("security.two_factor_auth", language)}
                    </h3>
                    <div className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                        isTwoFactorEnabled ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-muted text-muted-foreground border-transparent"
                    )}>
                        {isTwoFactorEnabled ? t("security.enabled", language) : t("security.disabled", language)}
                    </div>
                </div>

                <div className="rounded-[2.5rem] bg-card border shadow-xs p-8 space-y-6 relative overflow-hidden">
                    <div className="flex items-start gap-4 mb-2">
                        <div className="h-12 w-12 rounded-2xl bg-primary/5 text-primary flex items-center justify-center shrink-0">
                            <ShieldCheck size={24} />
                        </div>
                        <div className="space-y-1">
                            <p className="font-bold text-base">{t("security.authenticator_app", language)}</p>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {t("security.authenticator_description", language)}
                            </p>
                        </div>
                    </div>

                    <div className="rounded-3xl bg-muted/30 p-2 border border-muted-foreground/5 shadow-inner">
                        {hasPasswordAccount === false ? (
                            <div className="p-6 text-center">
                                <p className="text-sm text-muted-foreground italic">
                                    {t("security.set_password_first", language)}
                                </p>
                            </div>
                        ) : (
                            <TwoFactorAuth isEnabled={isTwoFactorEnabled} />
                        )}
                    </div>

                    {!isTwoFactorEnabled && (
                        <div className="flex items-center gap-2 p-4 rounded-2xl bg-amber-50/50 border border-amber-100/50">
                            <p className="text-[11px] text-amber-700 font-bold uppercase tracking-wide">
                                {t("security.two_factor_recommended", language)}
                            </p>
                        </div>
                    )}

                    <div className="absolute bottom-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-primary/10 to-transparent" />
                </div>
            </motion.section>

        </div>
    )
}

/* --- Internal components --- */

type ChangePasswordFormValues = {
    currentPassword: string
    newPassword: string
    revokeOtherSessions: boolean
}

function ChangePasswordForm() {
    const { language } = useUserConfig();
    const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting }, setValue } = useForm<ChangePasswordFormValues>({
        defaultValues: { currentPassword: "", newPassword: "", revokeOtherSessions: false },
    })

    async function onSubmit(values: ChangePasswordFormValues) {
        await authClient.changePassword(values, {
            onSuccess: () => {
                toast.success(t("security.password_updated", language))
                reset()
            },
            onError: (error) => {
                toast.error(error?.error?.message ?? t("security.password_update_failed", language))
            },
        })
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 relative z-10">
            <div className="grid gap-6">
                <div className="space-y-2">
                    <label className="ml-1 text-[11px] font-black uppercase tracking-widest text-muted-foreground italic">
                        {t("security.current_password", language)}
                    </label>
                    <Input
                        {...register("currentPassword", { required: t("security.required", language) })}
                        type="password"
                        className="h-14 rounded-2xl bg-muted/10 border-muted-foreground/10 focus:bg-background transition-all"
                    />
                    {errors.currentPassword && <p className="ml-1 text-xs font-bold text-rose-500 italic">
                        {t("security.enter_current_password", language)}
                    </p>}
                </div>

                <div className="space-y-2">
                    <label className="ml-1 text-[11px] font-black uppercase tracking-widest text-muted-foreground italic">
                        {t("security.new_password", language)}
                    </label>
                    <Input
                        {...register("newPassword", { required: t("security.required", language), minLength: 8 })}
                        type="password"
                        className="h-14 rounded-2xl bg-muted/10 border-muted-foreground/10 focus:bg-background transition-all"
                    />
                    {errors.newPassword && <p className="ml-1 text-xs font-bold text-rose-500 italic">
                        {t("security.min_length_8", language)}
                    </p>}
                </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-2xl bg-muted/20 border border-muted-foreground/5 cursor-pointer hover:bg-muted/30 transition-colors group">
                <Checkbox
                    checked={watch("revokeOtherSessions")}
                    onCheckedChange={(checked) => setValue("revokeOtherSessions", Boolean(checked))}
                    id="revoke-sessions"
                    className="size-5 rounded-lg border-2"
                />
                <label htmlFor="revoke-sessions" className="text-sm font-bold text-muted-foreground group-hover:text-foreground cursor-pointer transition-colors">
                    {t("security.revoke_others_label", language)}
                </label>
            </div>

            <Button
                type="submit"
                className="w-full h-14 rounded-2xl font-black uppercase tracking-[0.1em] shadow-xl shadow-primary/20 hover:shadow-2xl transition-all active:scale-[0.98]"
                disabled={isSubmitting}
            >
                <LoadingSwap isLoading={isSubmitting}>{t("security.update_password", language)}</LoadingSwap>
            </Button>
        </form>
    )
}

function SetPasswordForm({ email }: { email: string }) {
    const { language } = useUserConfig();
    return (
        <div className="space-y-6 relative z-10 text-center sm:text-left">
            <div className="space-y-2">
                <p className="font-bold text-lg text-foreground">{t("security.password_not_set", language)}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                    {t("security.password_not_set_description", language)}
                </p>
            </div>

            <BetterAuthActionButton
                variant="outline"
                className="w-full h-14 rounded-2xl font-black uppercase tracking-[0.1em] border-primary/20 hover:bg-primary/5 transition-all text-primary"
                successMessage={t("security.recovery_link_sent", language)}
                action={() => authClient.requestPasswordReset({ email, redirectTo: "/reset-password" })}
            >
                <Mail className="size-4 mr-2" />
                {t("security.initialize_password_setup", language)}
            </BetterAuthActionButton>
        </div>
    )
}

