"use client";

import { updateAppConfig } from "@/actions/admin/app-config";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Fingerprint, Globe, Mail, PenLine } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const emailRegex = /^([^<]+<)?([^@\s<>]+@[^@\s<>.]+\.[^@\s<>.]+)>?$/;

const appConfigSchema = z.object({
    appName: z.string().min(1, "App name is required"),
    appDescription: z.string().min(1, "Description is required"),
    smtpHost: z.string().optional().nullable(),
    smtpPort: z.coerce.number().int().optional().nullable(),
    smtpUser: z.string().optional().nullable(),
    smtpPass: z.string().optional().nullable(),
    smtpSecure: z.boolean().default(false),
    fromEmail: z.string().refine((val) => !val || emailRegex.test(val), {
        message: "Invalid email format. Use 'email@example.com' or 'Name <email@example.com>'",
    }).optional().nullable().or(z.literal("")),
    googleClientId: z.string().optional().nullable(),
    googleClientSecret: z.string().optional().nullable(),
    discordClientId: z.string().optional().nullable(),
    discordClientSecret: z.string().optional().nullable(),
});

type AppConfigValues = z.infer<typeof appConfigSchema>;

import { FooterButtons } from "@/components/footer-buttons";
import { useUserConfig } from "@/components/providers/user-config-provider";
import { t } from "@/lib/languages/i18n";
import { useQueryClient } from "@tanstack/react-query";

interface AppSettingsFormProps {
    initialData: any;
}

export function AppSettingsForm({ initialData }: AppSettingsFormProps) {
    const [loading, setLoading] = useState(false);
    const queryClient = useQueryClient();
    const { language } = useUserConfig();

    const appConfigSchema = z.object({
        appName: z.string().min(1, t("admin.app_config.msg.app_name_required", language)),
        appDescription: z.string().min(1, t("admin.app_config.msg.description_required", language)),
        smtpHost: z.string().optional().nullable(),
        smtpPort: z.coerce.number().int().optional().nullable(),
        smtpUser: z.string().optional().nullable(),
        smtpPass: z.string().optional().nullable(),
        smtpSecure: z.boolean().default(false),
        fromEmail: z.string().refine((val) => !val || emailRegex.test(val), {
            message: t("admin.app_config.msg.invalid_email_format", language),
        }).optional().nullable().or(z.literal("")),
        googleClientId: z.string().optional().nullable(),
        googleClientSecret: z.string().optional().nullable(),
        discordClientId: z.string().optional().nullable(),
        discordClientSecret: z.string().optional().nullable(),
    });

    const form = useForm<AppConfigValues>({
        resolver: zodResolver(appConfigSchema) as any,
        defaultValues: {
            appName: initialData.appName || "",
            appDescription: initialData.appDescription || "",
            smtpHost: initialData.smtpHost || "",
            smtpPort: initialData.smtpPort || 587,
            smtpUser: initialData.smtpUser || "",
            smtpPass: initialData.smtpPass || "",
            smtpSecure: !!initialData.smtpSecure,
            fromEmail: initialData.fromEmail || "",
            googleClientId: initialData.googleClientId || "",
            googleClientSecret: initialData.googleClientSecret || "",
            discordClientId: initialData.discordClientId || "",
            discordClientSecret: initialData.discordClientSecret || ""
        },
    });

    const onSubmit = async (data: AppConfigValues) => {
        setLoading(true);
        try {
            await updateAppConfig(data as any);
            queryClient.invalidateQueries({ queryKey: ["admin-app-config"] });
            toast.success(t("admin.app_config.msg.settings_updated_success", language));
        } catch (error: any) {
            toast.error(error.message || t("admin.app_config.msg.settings_update_failed", language));
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-10">
            {/* TODO: PENDING General & Branding Card */}
            {/* <ConfigCard
                title={t("admin.app_config.general_branding", language)}
                description={t("admin.app_config.general_branding_desc", language)}
                icon={<Layout className="w-5 h-5" />}
            >
                <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest opacity-50 ml-1">{t("admin.app_config.app_name", language)}</Label>
                    <Input
                        {...form.register("appName")}
                        className="h-12 rounded-2xl border-none bg-muted/40 shadow-inner focus-visible:ring-primary/20 transition-all font-bold"
                        placeholder={t("admin.app_config.app_name_placeholder", language)}
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest opacity-50 ml-1">{t("admin.app_config.description", language)}</Label>
                    <Textarea
                        {...form.register("appDescription")}
                        className="min-h-[100px] rounded-2xl border-none bg-muted/40 shadow-inner focus-visible:ring-primary/20 transition-all font-bold resize-none"
                        placeholder={t("admin.app_config.description_placeholder", language)}
                    />
                </div>
            </ConfigCard> */}

            {/* Email Server Card */}
            <ConfigCard
                title={t("admin.app_config.email_server", language)}
                description={t("admin.app_config.email_server_desc", language)}
                icon={<Mail className="w-5 h-5" />}
            >
                <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest opacity-50 ml-1">{t("admin.app_config.support_email", language)}</Label>
                    <Input
                        {...form.register("fromEmail")}
                        className="h-12 rounded-2xl border-none bg-muted/40 shadow-inner focus-visible:ring-primary/20 transition-all font-bold"
                        placeholder="noreply@example.com"
                    />
                </div>
                <div className="grid gap-6 sm:grid-cols-3">
                    <div className="sm:col-span-2 space-y-2">
                        <Label className="text-xs font-black uppercase tracking-widest opacity-50 ml-1">{t("admin.app_config.host", language)}</Label>
                        <Input
                            {...form.register("smtpHost")}
                            className="h-12 rounded-2xl border-none bg-muted/40 shadow-inner focus-visible:ring-primary/20 transition-all font-bold"
                            placeholder="smtp.example.com"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs font-black uppercase tracking-widest opacity-50 ml-1">{t("admin.app_config.port", language)}</Label>
                        <Input
                            type="number"
                            {...form.register("smtpPort")}
                            className="h-12 rounded-2xl border-none bg-muted/40 shadow-inner focus-visible:ring-primary/20 transition-all font-bold"
                        />
                    </div>
                </div>
                <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label className="text-xs font-black uppercase tracking-widest opacity-50 ml-1">{t("admin.app_config.user", language)}</Label>
                        <Input
                            {...form.register("smtpUser")}
                            className="h-12 rounded-2xl border-none bg-muted/40 shadow-inner focus-visible:ring-primary/20 transition-all font-bold"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs font-black uppercase tracking-widest opacity-50 ml-1">{t("admin.app_config.password", language)}</Label>
                        <Input
                            type="password"
                            {...form.register("smtpPass")}
                            className="h-12 rounded-2xl border-none bg-muted/40 shadow-inner focus-visible:ring-primary/20 transition-all font-bold"
                        />
                    </div>
                </div>
                <div className="flex items-center space-x-3 p-4 rounded-2xl bg-primary/5 border border-primary/10">
                    <Checkbox
                        id="smtpSecure"
                        checked={form.watch("smtpSecure")}
                        onCheckedChange={(checked) => form.setValue("smtpSecure", !!checked)}
                        className="rounded-lg h-6 w-6 border-primary/20 data-[state=checked]:bg-primary"
                    />
                    <div className="grid gap-1">
                        <Label htmlFor="smtpSecure" className="text-sm font-black">{t("admin.app_config.secure_connection", language)}</Label>
                        <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest italic">{t("admin.app_config.secure_connection_desc", language)}</p>
                    </div>
                </div>
            </ConfigCard>

            {/* Email Auth Card (OAuth) */}
            <ConfigCard
                title={t("admin.app_config.email_auth", language)}
                description={t("admin.app_config.email_auth_desc", language)}
                icon={<Fingerprint className="w-5 h-5" />}
            >
                <div className="space-y-6">
                    {/* Google */}
                    <div className="p-5 rounded-2xl border-2 border-dashed border-muted-foreground/10 space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center">
                                <Globe className="w-4 h-4 text-rose-500" />
                            </div>
                            <h4 className="font-black text-[11px] uppercase tracking-widest">{t("admin.app_config.google_auth", language)}</h4>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Input
                                {...form.register("googleClientId")}
                                className="h-11 rounded-xl border-none bg-background shadow-inner text-xs font-bold"
                                placeholder={t("admin.app_config.client_id", language)}
                            />
                            <Input
                                type="password"
                                {...form.register("googleClientSecret")}
                                className="h-11 rounded-xl border-none bg-background shadow-inner text-xs font-bold"
                                placeholder={t("admin.app_config.client_secret", language)}
                            />
                        </div>
                    </div>

                    {/* Discord */}
                    <div className="p-5 rounded-2xl border-2 border-dashed border-muted-foreground/10 space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center">
                                <Globe className="w-4 h-4 text-indigo-500" />
                            </div>
                            <h4 className="font-black text-[11px] uppercase tracking-widest">{t("admin.app_config.discord_auth", language)}</h4>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Input
                                {...form.register("discordClientId")}
                                className="h-11 rounded-xl border-none bg-background shadow-inner text-xs font-bold"
                                placeholder={t("admin.app_config.client_id", language)}
                            />
                            <Input
                                type="password"
                                {...form.register("discordClientSecret")}
                                className="h-11 rounded-xl border-none bg-background shadow-inner text-xs font-bold"
                                placeholder={t("admin.app_config.client_secret", language)}
                            />
                        </div>
                    </div>
                </div>
            </ConfigCard>

            <FooterButtons>
                <Button
                    type="submit"
                    disabled={loading}
                    variant="default"
                    className={cn(
                        "h-14 w-full text-white md:w-auto rounded-full px-8 md:px-12 gap-3 font-bold uppercase",
                        "bg-linear-to-r from-primary to-primary hover:from-primary/80 hover:to-primary/60",
                        "shadow-[0_10px_40px_rgba(225,29,72,0.3)] hover:shadow-[0_15px_50px_rgba(225,29,72,0.4)]",
                        "border-t border-white/20 transition-all duration-300"
                    )}
                >
                    <PenLine className="size-5 md:size-6" />
                    <span className="text-center font-black tracking-[0.15em] text-sm hidden md:block">
                        {loading ? t("admin.app_config.msg.saving_settings", language) : t("admin.app_config.sync_config_button", language)}
                    </span>
                </Button>
            </FooterButtons>
        </form>
    );
}

function ConfigCard({ title, description, icon, children }: {
    title: string;
    description: string;
    icon: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group relative rounded-[2.5rem] border-2 border-primary/5 bg-card p-6 sm:p-10 shadow-xl shadow-primary/5 transition-all hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/20"
        >
            <div className="flex items-center gap-4 mb-8">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center transition-transform group-hover:rotate-12">
                    {icon}
                </div>
                <div>
                    <h3 className="text-xl font-black tracking-tight">{title}</h3>
                    <p className="text-sm font-bold text-muted-foreground/60">{description}</p>
                </div>
            </div>
            <div className="space-y-6">
                {children}
            </div>
        </motion.div>
    );
}
