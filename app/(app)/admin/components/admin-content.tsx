"use client";

import AppTabs from "@/components/app-tabs";
import { useUserConfig } from "@/components/providers/user-config-provider";
import { t } from "@/lib/languages/i18n";
import { useAdminUsers } from "@/tanstacks/admin";
import { Settings as SettingsIcon, Users } from "lucide-react";
import { AdminSkeleton } from "./admin-skeleton";
import { AdminStats } from "./admin-stats";
import { AppSettingsTab } from "./app-settings-tab";
import { UserList } from "./user-list";

export function AdminContent() {
    const { data: users, isLoading } = useAdminUsers();
    const { language } = useUserConfig();

    if (isLoading) {
        return <AdminSkeleton />;
    }

    if (!users) return null;

    const totalUsers = users.length;
    const adminUsers = users.filter((u: any) => u.role === "admin").length;
    const bannedUsers = users.filter((u: any) => u.banned).length;
    const activeUsers = totalUsers - bannedUsers;

    return (
        <div className="flex-1 px-4 pb-34 pt-6 max-w-7xl mx-auto w-full">
            <AppTabs
                defaultTab="user-management"
                tabs={[
                    {
                        id: "user-management",
                        label: t("admin.user_mng.title", language),
                        icon: <Users size={20} />,
                        content: (
                            <>
                                <AdminStats
                                    totalUsers={totalUsers}
                                    activeUsers={activeUsers}
                                    bannedUsers={bannedUsers}
                                    adminUsers={adminUsers}
                                />
                                <UserList />
                            </>
                        )
                    },
                    {
                        id: "application-settings",
                        label: t("admin.app_config.title", language),
                        icon: <SettingsIcon size={20} />,
                        content: <AppSettingsTab />
                    }
                ]}
            />
        </div>
    );
}
