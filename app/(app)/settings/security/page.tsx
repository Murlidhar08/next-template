"use client";

import { getListUserAccounts } from "@/actions/user-settings.actions";
import AppTabs from "@/components/app-tabs";
import { BackHeader } from "@/components/back-header";
import { useUserConfig } from "@/components/providers/user-config-provider";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/lib/auth/auth-client";
import { t } from "@/lib/languages/i18n";
import { motion } from "framer-motion";
import { Key, Lock, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PasskeyTab } from "./components/passkeyTab";
import { SecureTab } from "./components/secureTab";
import { TwoFactorTab } from "./components/twoFactorTab";

export default function SecurityPage() {
    const router = useRouter();
    const { data: session, isPending } = useSession();
    const { language } = useUserConfig();
    const [hasPasswordAccount, setHasPasswordAccount] = useState<boolean | null>(null);

    useEffect(() => {
        getListUserAccounts()
            .then(accounts => {
                const hasPassAcc = accounts.some(a => a.providerId === "credential")
                setHasPasswordAccount(hasPassAcc);
            })
    }, [])

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    if (isPending || hasPasswordAccount === null) {
        return <SecuritySkeleton />;
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            <BackHeader
                title={t("security.title", language)}
                backUrl="/settings"
            />

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="mx-auto max-w-4xl p-6 mt-4"
            >
                <AppTabs
                    defaultTab="password"
                    tabs={[
                        {
                            id: "password",
                            label: t("security.access.title", language),
                            icon: <Lock size={14} />,
                            content: (
                                <SecureTab
                                    email={session?.user.email ?? ""}
                                    hasPasswordAccount={hasPasswordAccount}
                                />
                            )
                        },
                        {
                            id: "2fa",
                            label: t("security.two_factor.title", language),
                            icon: <ShieldCheck size={14} />,
                            content: (
                                <TwoFactorTab
                                    isTwoFactorEnabled={session?.user?.twoFactorEnabled ?? false}
                                    hasPasswordAccount={hasPasswordAccount}
                                />
                            )
                        },
                        {
                            id: "passkeys",
                            label: t("security.passkeys.title", language),
                            icon: <Key size={14} />,
                            content: (
                                <PasskeyTab />
                            )
                        }
                    ]}
                />
            </motion.div>
        </div>
    );
}

function SecuritySkeleton() {
    const { language } = useUserConfig();
    return (
        <div className="min-h-screen bg-background">
            <BackHeader title={t("security.title", language)} />
            <div className="mx-auto max-w-lg p-6 mt-6 space-y-8">
                <div className="space-y-4">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-48 w-full rounded-3xl" />
                </div>
                <div className="space-y-4">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-32 w-full rounded-3xl" />
                </div>
            </div>
        </div>
    );
}
