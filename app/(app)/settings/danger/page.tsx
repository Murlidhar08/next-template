"use client";

import { BackHeader } from "@/components/back-header";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/lib/auth/auth-client";
import { useUserConfig } from "@/components/providers/user-config-provider";
import { t } from "@/lib/languages/i18n";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { DangerModalBody } from "../components/danger-body";

export default function DangerPage() {
    const router = useRouter();
    const { isPending } = useSession();
    const { language } = useUserConfig();

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    if (isPending) {
        return <DangerSkeleton />;
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            <BackHeader
                title={t("danger.title", language)}
                backUrl="/settings"
            />

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="mx-auto max-w-lg p-6 mt-4"
            >
                <DangerModalBody />
            </motion.div>
        </div>
    );
}

function DangerSkeleton() {
    const { language } = useUserConfig();
    return (
        <div className="min-h-screen bg-background">
            <BackHeader title={t("danger.title", language)} />
            <div className="mx-auto max-w-lg p-6 mt-6 space-y-8">
                <div className="space-y-4">
                    <Skeleton className="h-48 w-full rounded-[2.5rem]" />
                </div>
            </div>
        </div>
    );
}
