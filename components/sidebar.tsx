"use client";

import { useSession } from "@/lib/auth/auth-client";
import { envClient } from "@/lib/env.client";
import { t } from "@/lib/languages/i18n";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Settings,
  UserRoundCog
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useUserConfig } from "./providers/user-config-provider";

type NavItem = {
  label: string;
  icon: React.ReactNode;
  href: string;
};

const Sidebar = () => {
  const { language } = useUserConfig();
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";

  const navItems: NavItem[] = [
    { label: t("nav.dashboard", language), icon: <LayoutDashboard size={20} />, href: "/dashboard" },
    { label: t("nav.settings", language), icon: <Settings size={20} />, href: "/settings" },
    ...(isAdmin ? [{ label: t("nav.admin", language), icon: <UserRoundCog size={20} />, href: "/admin" }] : []),
  ];

  return (
    <>
      {/* ================= Desktop Sidebar ================= */}
      <aside
        className={clsx(
          "hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border shadow-2xl",
          "transition-[width] duration-500 cubic-bezier(0.4, 0, 0.2, 1)",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* Toggle Button - Floating on Right Edge */}
        <div className="absolute top-18 -right-4 z-100">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center justify-center h-8 w-8 rounded-full bg-sidebar border border-sidebar-border text-sidebar-foreground shadow-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-300 active:scale-90 cursor-pointer"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronLeft size={16} className="rotate-180" /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Header */}
        <div className="flex items-center gap-3 px-3 py-6 relative shrink-0">
          <div className="h-10 w-10 shrink-0 flex items-center justify-center relative rounded-xl bg-sidebar-accent/10">
            <Image
              src="/images/logo/light_logo.svg"
              alt={envClient.NEXT_PUBLIC_APP_NAME}
              loading="eager"
              width={26}
              height={26}
              className="dark:hidden"
            />
            <Image
              src="/images/logo/dark_logo.svg"
              alt={envClient.NEXT_PUBLIC_APP_NAME}
              loading="eager"
              width={26}
              height={26}
              className="hidden dark:block"
            />
          </div>

          {!collapsed && (
            <span className="text-xl font-black tracking-tight whitespace-nowrap animate-in fade-in duration-500">
              {envClient.NEXT_PUBLIC_APP_NAME}
            </span>
          )}
        </div>

        {/* Nav Container - Ensuring tooltips don't get clipped */}
        <nav className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 py-4 space-y-2 custom-scrollbar px-2">
            {navItems.map((item) => {
              const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);
              return (
                <DesktopNavItem
                  key={item.href}
                  {...item}
                  active={active}
                  collapsed={collapsed}
                />
              );
            })}
          </div>
        </nav>
      </aside>

      {/* ================= Mobile Bottom Nav ================= */}
      <div className="fixed bottom-4 left-0 right-0 z-50 flex justify-center lg:hidden px-4">
        <nav className="w-full max-w-md h-18 px-2 py-2 bg-background/80 dark:bg-card/80 backdrop-blur-2xl border border-border shadow-[0_8px_32px_rgba(0,0,0,0.12)] rounded-[2.5rem] flex items-center justify-around relative">
          {navItems.map((item) => {
            const active = pathname?.startsWith(item.href);

            return (
              <MobileNavItem
                key={item.href}
                {...item}
                active={active}
              />
            );
          })}
        </nav>
      </div>
      {/* Bottom Shade */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-linear-to-t from-background to-transparent h-28 pointer-events-none lg:hidden"></div>

      <div className={`hidden lg:block shrink-0 ${collapsed ? "w-20" : "w-64"}`} />
    </>
  );
}

/* ================= Desktop Item ================= */
interface desktopNavProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  collapsed: boolean;
  href: string;
}

function DesktopNavItem({ icon, label, active, collapsed, href }: desktopNavProps) {
  return (
    <Link
      key={href}
      href={href as any}
      className={clsx(
        "group relative flex items-center gap-4 rounded-xl transition-all duration-300 ease-out h-11",
        active
          ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-lg shadow-indigo-500/20"
          : "text-sidebar-foreground/60 hover:bg-sidebar-accent/10 hover:text-sidebar-foreground",
        collapsed ? "justify-center w-12 mx-auto" : "px-4"
      )}
    >
      <div className={clsx(
        "shrink-0 transition-transform duration-300 group-hover:scale-110",
        active ? "text-sidebar-accent-foreground" : "group-hover:text-sidebar-foreground"
      )}>
        {icon}
      </div>

      {!collapsed && (
        <span className={clsx(
          "text-sm tracking-wide font-semibold transition-colors whitespace-nowrap",
          active ? "text-sidebar-accent-foreground" : "text-sidebar-foreground/70 group-hover:text-sidebar-foreground"
        )}>
          {label}
        </span>
      )}

      {/* Anti-clipping Tooltip for collapsed mode */}
      {collapsed && (
        <div className="fixed left-20 z-100 flex items-center opacity-0 -translate-x-2 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
          <div className="px-3 py-2 bg-sidebar-accent text-sidebar-accent-foreground text-xs font-bold rounded-lg shadow-2xl whitespace-nowrap relative border border-sidebar-border/20">
            {label}
            {/* Tooltip Arrow */}
            <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 border-y-[6px] border-y-transparent border-r-[6px] border-r-sidebar-accent" />
          </div>
        </div>
      )}
    </Link>
  );
}

/* ================= Mobile Item ================= */
interface MobileNavItemProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  href: string;
}

function MobileNavItem({ icon, active, href }: MobileNavItemProps) {
  return (
    <Link
      href={href as any}
      className="flex flex-col items-center justify-center transition-all duration-300 active:scale-95 group h-full w-full relative"
    >
      <div className={clsx(
        "relative flex flex-col items-center justify-center h-full w-full transition-all duration-500 rounded-[1.5rem] overflow-hidden",
        active
          ? "bg-primary/20 text-primary shadow-[inset_0_0_15px_rgba(var(--primary-rgb),0.15)]"
          : "bg-transparent text-muted-foreground hover:bg-muted/15"
      )}>
        {/* ICON with smooth transition */}
        <div className="relative w-6 h-6 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={active ? "active" : "inactive"}
              initial={{ opacity: 0, scale: 0.5, rotate: active ? -15 : 15 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              {icon}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Animated Active Background Indicator */}
        {active && (
          <motion.div
            layoutId="active-pill"
            className="absolute inset-0 bg-primary/10 -z-10"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}
      </div>
    </Link>
  );
}


export { Sidebar };

