"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ReactNode, Suspense, useEffect, useLayoutEffect, useRef, useState } from "react";
import { LoadingScreen } from "./loading-screen";

export interface TabItem {
    id: string;
    label: string;
    badgeCount?: number;
    icon?: ReactNode;
    content: ReactNode;
}

interface AppTabsProps {
    tabs: TabItem[];
    defaultTab?: string;
    className?: string;
}

export default function AppTabs({ tabs, defaultTab, className = "w-full" }: AppTabsProps) {
    const [activeTab, setActiveTab] = useState<string>(
        defaultTab || (tabs && tabs.length > 0 ? tabs[0].id : "")
    );

    const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

    useIsomorphicLayoutEffect(() => {
        const handleHashChange = () => {
            if (typeof window !== "undefined") {
                const hash = window.location.hash.replace("#", "");
                if (hash && tabs.some((tab) => tab.id === hash)) {
                    setActiveTab(hash);
                }
            }
        };

        handleHashChange();
        window.addEventListener("hashchange", handleHashChange);
        return () => window.removeEventListener("hashchange", handleHashChange);
    }, [tabs]);

    const handleTabChange = (value: string) => {
        setActiveTab(value);
        window.history.replaceState(null, "", `#${value}`);
    };

    // Drag to scroll logic
    const tabsListRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!tabsListRef.current) return;
        setIsDragging(true);
        setStartX(e.pageX - tabsListRef.current.offsetLeft);
        setScrollLeft(tabsListRef.current.scrollLeft);
    };

    const handleMouseLeave = () => {
        setIsDragging(false);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !tabsListRef.current) return;
        e.preventDefault();
        const x = e.pageX - tabsListRef.current.offsetLeft;
        const walk = (x - startX) * 2;
        tabsListRef.current.scrollLeft = scrollLeft - walk;
    };

    if (!tabs || tabs.length === 0) return null;

    return (
        <Tabs value={activeTab} onValueChange={handleTabChange} className={cn("w-full", className)}>
            {/* Nav Container */}
            <div className="mb-8">
                <TabsList
                    ref={tabsListRef}
                    onMouseDown={handleMouseDown}
                    onMouseLeave={handleMouseLeave}
                    onMouseUp={handleMouseUp}
                    onMouseMove={handleMouseMove}
                    className={cn(
                        "relative w-full flex items-center justify-start h-auto p-1.5 bg-slate-100/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-[1.5rem] border border-slate-200/50 dark:border-slate-700/50 overflow-x-auto scrollbar-hide no-scrollbar flex-nowrap shrink-0 transition-all select-none",
                        isDragging ? "cursor-grabbing" : "cursor-grab"
                    )}
                >
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                            <TabsTrigger
                                key={tab.id}
                                value={tab.id}
                                className="group relative flex items-center gap-2.5 px-6 py-3 rounded-2xl text-muted-foreground data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400 font-black text-[11px] tracking-widest transition-all uppercase whitespace-nowrap bg-transparent z-10 border-none shadow-none ring-0 focus-visible:ring-0 shrink-0 flex-none"
                            >
                                <span className={cn("transition-transform duration-300", isActive && "scale-110")}>
                                    {tab.icon}
                                </span>

                                <span className="relative">
                                    {tab.label}
                                    {!!tab.badgeCount && (
                                        <div className="absolute -top-3 -right-5 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[8px] font-black text-white shadow-lg shadow-indigo-100 ring-2 ring-white dark:ring-slate-900 animate-in zoom-in duration-300">
                                            {tab.badgeCount > 99 ? '99+' : tab.badgeCount}
                                        </div>
                                    )}
                                </span>

                                {isActive && (
                                    <motion.div
                                        layoutId="tabBackground"
                                        className="absolute inset-0 bg-white dark:bg-slate-900 rounded-2xl shadow-sm z-[-1]"
                                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                    />
                                )}
                            </TabsTrigger>
                        );
                    })}
                </TabsList>
            </div>

            {/* Tab content */}
            {tabs.map((tab) => (
                <TabsContent key={tab.id} value={tab.id} className="space-y-6 mt-0">
                    <Suspense fallback={<LoadingScreen />}>
                        {tab.content}
                    </Suspense>
                </TabsContent>
            ))}
        </Tabs>
    );
}