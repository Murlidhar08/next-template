"use client"

import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { TabItem } from "./tab-item";
import { useNavItems } from "./use-nav-items";

interface MobileNavProps {
    navItems?: (TabItem & { active?: boolean })[];
    onChange?: (value: string) => void;
}

export default function MobileNav({ navItems: propNavItems, onChange }: MobileNavProps) {
    const pathname = usePathname();
    const defaultNavItems = useNavItems();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const navItems = propNavItems && propNavItems.length > 0 ? propNavItems : defaultNavItems;

    if (!mounted) return null;

    return (
        <>
            <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center lg:hidden px-6">
                <nav className="w-full max-w-[400px] h-20 px-3 bg-background/80 dark:bg-card/80 backdrop-blur-3xl border border-border/50 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[2.5rem] flex items-center justify-center gap-2 relative">
                    {navItems.map((item) => {
                        const active = item.active !== undefined
                            ? item.active
                            : (item.href ? pathname?.startsWith(item.href) : false);

                        return (
                            <MobileNavItem
                                onChange={onChange}
                                key={item.id}
                                {...item}
                                active={active}
                            />
                        );
                    })}
                </nav>
            </div>

            {/* Mobile bottom shade */}
            <div className="fixed bottom-0 left-0 right-0 z-40 bg-linear-to-t from-background to-transparent h-28 pointer-events-none lg:hidden"></div>
        </>
    );
}

interface MobileNavItemProps {
    icon?: React.ReactNode;
    label: string;
    active: boolean;
    href?: string;
    onChange?: (value: string) => void;
}

function MobileNavItem({ icon, label, active, href, onChange }: MobileNavItemProps) {
    const isHash = href?.startsWith("#");
    const handleClick = (e: React.MouseEvent) => {
        if (isHash && href && onChange) {
            e.preventDefault();
            onChange(href.replace("#", ""));
        } else if (onChange) {
            onChange(href || "");
        }
    };

    return (
        <Link
            href={(href || "#") as any}
            onClick={handleClick}
            aria-label={label}
            className="flex flex-col items-center justify-center transition-all duration-300 active:scale-95 group h-14 flex-1 max-w-[100px] relative"
        >
            <div className={clsx(
                "relative flex flex-col items-center justify-center h-full w-full transition-all duration-500 rounded-3xl overflow-hidden",
                active
                    ? "bg-primary/10 text-primary"
                    : "bg-transparent text-muted-foreground hover:bg-muted/10"
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
