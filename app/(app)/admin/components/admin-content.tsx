"use client";

import { useAdminUsers } from "@/tanstacks/admin";
import { AdminSkeleton } from "./admin-skeleton";
import { AdminStats } from "./admin-stats";
import { UserList } from "./user-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Settings as SettingsIcon } from "lucide-react";
import { AppSettingsTab } from "./app-settings-tab";
import AppTabs from "@/components/app-tabs";

export function AdminContent() {
    const { data: users, isLoading } = useAdminUsers();

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
                        label: "User Management",
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
                        label: "Application Settings",
                        icon: <SettingsIcon size={20} />,
                        content: <AppSettingsTab />
                    }
                ]}
            />
        </div>
    );
}
