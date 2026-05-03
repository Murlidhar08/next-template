"use client";

// Packages
import { AnimatePresence, motion } from "framer-motion";
import { Eye, EyeOff, Fingerprint, Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Lib
import { authClient, signIn, signInWithDiscord, signInWithGoogle } from "@/lib/auth/auth-client";
import { envClient } from "@/lib/env.client";

// Components
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

interface LoginFormProps {
  providers: {
    google: boolean;
    discord: boolean;
  };
}

export default function LoginForm({ providers }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [discordLoading, setDiscordLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [lastLogin, setLastLogin] = useState("");

  // Redirect to dashboard
  useEffect(() => {
    // Check for error parameter
    const searchParams = new URLSearchParams(window.location.search);
    const errorParam = searchParams.get("error");
    if (errorParam === "banned") {
      const description = searchParams.get("error_description");
      router.push(`/banned${description ? `?reason=${encodeURIComponent(description)}` : ""}` as any);
      return;
    }

    authClient.getSession()
      .then((session) => {
        if (session.data) {
          if (session.data.user.banned) router.push("/banned" as any);
          else router.push("/dashboard" as any);
        }
      });

    // Last Login Method
    setLastLogin(authClient.getLastUsedLoginMethod() || "");
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn.email({ email, password });
      if (result.error) {
        setError(result.error.message || "Sign in failed");
      } else {
        // We need to get the session again or just check the user returned in result if available
        // Better Auth signIn returns the user in data.user
        if (result.data?.user?.banned) {
          const reason = result.data.user.banReason;
          router.push(`/banned${reason ? `?reason=${encodeURIComponent(reason)}` : ""}` as any);
        }
        else router.push("/dashboard" as any);
      }
    } catch (err) {
      setError("An error occurred during sign in");
      console.error(err)
    } finally {
      setLoading(false);
    }
  };

  const handlePasskeySignIn = async () => {
    setError("");
    setLoading(true);

    try {
      const { error } = await authClient.signIn.passkey();
      if (error) {
        setError(error.message || "Passkey authentication failed");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError("An unexpected error occurred during passkey sign in");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error(err);
      setGoogleLoading(false);
    }
  };

  const handleDiscordLogin = async () => {
    setDiscordLoading(true);
    try {
      await signInWithDiscord();
    } catch (err) {
      console.error(err);
      setDiscordLoading(false);
    }
  }

  const hasSocialLogin = providers.google || providers.discord;

  return (
    <div className="h-screen w-full flex flex-col lg:flex-row select-none bg-background overflow-hidden relative">
      {/* BACKGROUND DECORATION */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40 dark:opacity-20 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[10%] w-[30%] h-[30%] rounded-full bg-primary/10 blur-[100px] animate-pulse [animation-delay:2s]" />
      </div>

      {/* LEFT SIDE: FORM */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="flex flex-col justify-between w-full lg:w-1/2 px-6 sm:px-12 lg:px-6 py-8 relative z-10 h-full overflow-y-auto scrollbar-none bg-background/50 backdrop-blur-sm border-r border-border/50"
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

        {/* CENTER FORM AREA */}
        <div className="flex flex-col justify-center max-w-sm mx-auto w-full py-8 lg:py-0">
          <motion.div variants={itemVariants as any} className="mb-6">
            <h2 className="text-3xl font-bold tracking-tight mb-3">
              Welcome back
            </h2>
          </motion.div>

          <motion.form variants={itemVariants as any} onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  className="rounded-2xl bg-destructive/10 p-4 text-sm text-destructive border border-destructive/20 flex items-center gap-3"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold ml-1 text-foreground/70">Email Address</label>
                <div className="relative group">
                  <Input
                    type="email"
                    tabIndex={1}
                    placeholder="name@company.com"
                    className="h-13 rounded-2xl pl-4 pr-12 transition-all duration-300 bg-muted/40 border-border/50 focus:bg-background focus:ring-4 focus:ring-primary/10 focus:border-primary shadow-sm"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus={true}
                  />
                  <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors w-5 h-5" />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-sm font-semibold text-foreground/70">Password</label>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-bold text-primary hover:text-primary/80 transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative group">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="h-13 rounded-2xl pl-4 pr-12 transition-all duration-300 bg-muted/40 border-border/50 focus:bg-background focus:ring-4 focus:ring-primary/10 focus:border-primary shadow-sm"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    tabIndex={2}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors group-focus-within:text-primary"
                  >
                    {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              tabIndex={3}
              disabled={loading || googleLoading || discordLoading}
              className="relative rounded-2xl h-14 w-full text-lg font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300 active:scale-[0.98] mt-2"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Authenticating...
                </div>
              ) : "Sign In"}
              {lastLogin === "email" && (
                <Badge variant="secondary" className="absolute -top-3 -right-2 px-3 py-1 bg-background border-primary/20 text-primary shadow-md">Last used</Badge>
              )}
            </Button>
            <Button
              type="button"
              tabIndex={4}
              onClick={handlePasskeySignIn}
              disabled={loading || googleLoading || discordLoading}
              className="relative rounded-2xl h-14 w-full text-lg font-bold shadow-lg shadow-primary/5 hover:shadow-primary/10 transition-all duration-300 active:scale-[0.98] mt-2 bg-muted/40 border border-muted-foreground/10 text-foreground hover:bg-muted/60 group"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  Authenticating...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-3">
                  <Fingerprint className="size-6 text-primary group-hover:scale-110 transition-transform" />
                  <span className="tracking-tight">Sign In with Passkey</span>
                </div>
              )}
              {lastLogin === "passkey" && (
                <Badge variant="secondary" className="absolute -top-3 -right-2 px-3 py-1 bg-background border-primary/20 text-primary shadow-md animate-in fade-in zoom-in duration-300">Last used</Badge>
              )}
            </Button>
          </motion.form>

          {hasSocialLogin && (
            <>
              <motion.div variants={itemVariants as any} className="relative my-10">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border/50"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background/50 backdrop-blur-sm px-4 text-muted-foreground font-bold tracking-widest">
                    Or continue with
                  </span>
                </div>
              </motion.div>

              <motion.div variants={itemVariants as any} className={`grid ${providers.google && providers.discord ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
                {providers.google && (
                  <Button
                    onClick={handleGoogle}
                    variant="outline"
                    tabIndex={5}
                    disabled={googleLoading || loading || discordLoading}
                    className="relative rounded-2xl h-14 px-6 flex items-center justify-center gap-3 hover:bg-muted/50 border-border/50 transition-all duration-300 active:scale-[0.98] group/google shadow-sm"
                  >
                    {googleLoading ? (
                      <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    ) : (
                      <Image src="/google.svg" alt="Google" width={20} height={20} className="group-hover/google:scale-110 transition-transform" />
                    )}
                    <span className="font-bold">{googleLoading ? "..." : "Google"}</span>
                    {lastLogin === "google" && !googleLoading && (
                      <Badge variant="secondary" className="absolute -top-3 -right-2 px-3 py-1 bg-background border-primary/20 text-primary shadow-md">Last used</Badge>
                    )}
                  </Button>
                )}

                {providers.discord && (
                  <Button
                    onClick={handleDiscordLogin}
                    variant="outline"
                    tabIndex={6}
                    disabled={discordLoading || loading || googleLoading}
                    className="relative rounded-2xl h-14 px-6 flex items-center justify-center gap-3 hover:bg-muted/50 border-border/50 transition-all duration-300 active:scale-[0.98] group/discord shadow-sm"
                  >
                    {discordLoading ? (
                      <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    ) : (
                      <Image src="/discord.svg" alt="Discord" width={20} height={20} className="group-hover/discord:scale-110 transition-transform" />
                    )}
                    <span className="font-bold">{discordLoading ? "..." : "Discord"}</span>
                    {lastLogin === "discord" && !discordLoading && (
                      <Badge variant="secondary" className="absolute -top-3 -right-2 px-3 py-1 bg-background border-primary/20 text-primary shadow-md">Last used</Badge>
                    )}
                  </Button>
                )}
              </motion.div>
            </>
          )}
        </div>

        {/* SIGN UP */}
        <motion.div variants={itemVariants as any} className="mt-8 pt-8 border-t border-border/50">
          <p className="text-center text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link tabIndex={7} href="/signup" className="font-bold text-primary hover:text-primary/80 transition-colors">
              Get Started
            </Link>
          </p>
        </motion.div>
      </motion.div>

      {/* RIGHT SIDE: ILLUSTRATION & FEATURES */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="hidden lg:flex flex-1 p-12 items-center justify-center bg-linear-to-br from-primary via-primary/90 to-primary/80 relative overflow-hidden"
      >
        {/* Animated Background Elements */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-black/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4" />

        {/* Abstract Grid Pattern */}
        <div className="absolute inset-0 opacity-10 mask-[radial-gradient(ellipse_at_center,black,transparent)]"
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
              Master your <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-white to-white/60">financial destiny.</span>
            </motion.h2>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-white/80 text-xl font-medium max-w-lg mx-auto leading-relaxed"
            >
              Experience the next generation of finance management with real-time insights and enterprise security.
            </motion.p>
          </div>
        </div>
      </motion.div >
    </div >
  );
}
