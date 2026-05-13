"use client";

import { useSession } from "@/lib/auth/auth-client";
import { t } from "@/lib/languages/i18n";
import { LayoutDashboard, Settings, UserRoundCog } from "lucide-react";
import { useUserConfig } from "../providers/user-config-provider";
import { TabItem } from "./tab-item";

export const useNavItems = () => {
  const { language } = useUserConfig();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";

  const navItems: TabItem[] = [
    { id: "dashboard", label: t("nav.dashboard", language), icon: <LayoutDashboard size={20} />, href: "/dashboard" },
    { id: "settings", label: t("nav.settings", language), icon: <Settings size={20} />, href: "/settings" },
    ...(isAdmin ? [{ id: "admin", label: t("nav.admin", language), icon: <UserRoundCog size={20} />, href: "/admin" }] : []),
  ];

  return navItems;
};
