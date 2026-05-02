"use client";

// Packages
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, LogOut } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

// Lib
import { authClient } from "@/lib/auth/auth-client";
import { envClient } from "@/lib/env.client";

// Components
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

export default function BannedPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ banned?: boolean | null, banReason?: string | null, id?: string } | null>(null);

  // Priority: DB reason (if session exists) > URL reason (for failed logins) > generic fallback
  const displayReason = user?.banReason || searchParams.get("reason") || "Your account has been flagged for violating our terms of service.";

  useEffect(() => {
    authClient.getSession().then((session) => {
      if (session.data) {
        if (!session.data.user.banned) {
          router.push("/dashboard");
        } else {
          setUser(session.data.user);
        }
      }
      setLoading(false);
    });
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background p-6">
        <div className="w-full max-w-md space-y-8 text-center">
          <Skeleton className="h-16 w-16 rounded-full mx-auto" />
          <div className="space-y-2">
            <Skeleton className="h-10 w-64 mx-auto" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6 mx-auto" />
          </div>
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-14 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col lg:flex-row select-none bg-background overflow-hidden relative">
      {/* BACKGROUND DECORATION */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40 dark:opacity-20 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-destructive/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[10%] w-[30%] h-[30%] rounded-full bg-destructive/5 blur-[100px] animate-pulse [animation-delay:2s]" />
      </div>

      {/* LEFT SIDE: CONTENT */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="flex flex-col justify-between w-full lg:w-1/2 px-6 sm:px-12 lg:px-16 xl:px-24 py-8 relative z-10 h-full overflow-y-auto scrollbar-none bg-background/50 backdrop-blur-sm border-r border-border/50"
      >
        {/* LOGO + BRAND */}
        <motion.div
          variants={itemVariants as any}
          className="flex items-center gap-4 mb-12 group cursor-pointer"
          onClick={() => router.push("/")}
        >
          <div className="relative w-12 h-12 flex items-center justify-center">
            <div className="absolute inset-0 bg-primary/10 rounded-2xl blur-lg group-hover:bg-primary/20 transition-colors" />
            <div className="relative z-10 p-2 bg-background rounded-2xl border border-border/50 shadow-sm group-hover:border-primary/50 transition-colors">
              <Image
                src="/images/logo/light_logo.svg"
                alt={envClient.NEXT_PUBLIC_APP_NAME}
                loading="eager"
                width={32}
                height={32}
                className="dark:hidden group-hover:rotate-12 transition-transform duration-500"
              />
              <Image
                src="/images/logo/dark_logo.svg"
                alt={envClient.NEXT_PUBLIC_APP_NAME}
                loading="eager"
                width={32}
                height={32}
                className="hidden dark:block group-hover:rotate-12 transition-transform duration-500"
              />
            </div>
          </div>
          <div className="flex flex-col gap-0">
            <h1 className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-linear-to-br from-foreground to-foreground/70 leading-none">
              {envClient.NEXT_PUBLIC_APP_NAME}
            </h1>
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-60">
              Finance Architecture
            </p>
          </div>
        </motion.div>

        {/* CENTER CONTENT AREA */}
        <div className="flex flex-col justify-center max-w-sm md:max-w-xl mx-auto w-full py-4 lg:py-0">
          <motion.div variants={itemVariants as any} className="mb-8 flex md:flex-row flex-col gap-6">
            <div className="w-20 h-20 bg-destructive/10 rounded-3xl flex items-center justify-center mb-6 ring-8 ring-destructive/5">
              <AlertCircle className="w-10 h-10 text-destructive" />
            </div>
            <div>
              <h2 className="text-[clamp(1.5rem,5vw,2.5rem)] font-bold tracking-tight mb-3 text-destructive">
                Access Restricted
              </h2>
              <p className="text-muted-foreground text-lg font-medium leading-relaxed">
                Your access to the platform has been restricted due to a policy violation.
              </p>
            </div>
          </motion.div>

          <motion.div variants={itemVariants as any} className="space-y-6">
            <div className="bg-muted/40 border border-border/50 p-6 rounded-3xl relative overflow-hidden group hover:bg-muted/60 transition-all duration-500">
              <div className="absolute top-0 right-0 w-24 h-24 bg-destructive/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-3">
                Reason for Suspension
              </h3>
              <p className="text-foreground text-lg font-medium leading-relaxed">
                {displayReason}
              </p>
            </div>

            <p className="text-sm text-muted-foreground font-medium px-2 leading-relaxed">
              If you believe this is a mistake, contact our support team at{" "}
              <a href="mailto:support@example.app" className="text-primary hover:underline font-bold">
                support@example.app
              </a>
            </p>

            <Button
              variant="outline"
              onClick={async () => {
                await authClient.signOut();
                router.push("/login");
              }}
              className="relative rounded-2xl h-14 w-full text-lg font-bold border-border/50 hover:bg-muted/50 transition-all duration-300 active:scale-[0.98] group"
            >
              <LogOut className="mr-2 h-5 w-5 transition-transform group-hover:-translate-x-1" />
              Return to Login
            </Button>
          </motion.div>
        </div>

        {/* FOOTER */}
        <motion.div variants={itemVariants as any} className="mt-8 pt-8 border-t border-border/50 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
          {user?.id ? (
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground opacity-40">
              REF ID: {user.id.slice(-12).toUpperCase()}
            </p>
          ) : (
            <div />
          )}
          <p className="text-muted-foreground text-xs font-medium">
            &copy; {new Date().getFullYear()} {envClient.NEXT_PUBLIC_APP_NAME}
          </p>
        </motion.div>
      </motion.div>

      {/* RIGHT PANEL - Unified "Financial Architect" Design */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="hidden lg:flex flex-1 p-12 items-center justify-center bg-linear-to-br from-destructive via-destructive/90 to-destructive/80 relative overflow-hidden"
      >
        {/* Animated Background Elements */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-black/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4" />

        {/* Abstract Grid Pattern */}
        <div className="absolute inset-0 opacity-10 [mask-image:radial-gradient(ellipse_at_center,black,transparent)]"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />

        <div className="relative z-10 w-full max-w-2xl text-center text-white space-y-12">
          <motion.div
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="w-32 h-32 bg-white/10 backdrop-blur-2xl rounded-[2.5rem] flex items-center justify-center border border-white/20 shadow-2xl mx-auto relative group"
          >
            <div className="absolute inset-0 bg-white/20 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <Image
              src="/images/logo/dark_logo.svg"
              alt={envClient.NEXT_PUBLIC_APP_NAME}
              loading="eager"
              width={80}
              height={80}
              className="relative z-10 group-hover:scale-110 transition-transform duration-500"
            />
          </motion.div>

          <div className="space-y-6">
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-[clamp(2rem,5vw,3.5rem)] font-black tracking-tight leading-tight"
            >
              Integrity and <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-white to-white/60">Compliance.</span>
            </motion.h2>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-white/80 text-xl font-medium max-w-lg mx-auto leading-relaxed"
            >
              Our platform maintains strict standards to ensure a secure environment for all {envClient.NEXT_PUBLIC_APP_NAME} users.
            </motion.p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

