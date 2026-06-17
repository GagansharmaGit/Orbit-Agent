"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { Zap, Mail, Calendar, Bot, ArrowRight, Shield } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("demo@orbit.dev");
  const [name, setName] = useState("Demo User");
  const [loading, setLoading] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

  const handleDemoLogin = async () => {
    setLoading(true);
    await signIn("credentials", { email, name, callbackUrl: "/mail" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.25_0.08_250)_0%,transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,oklch(0.2_0.06_300)_0%,transparent_50%)]" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/3 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-4 glow-primary shadow-2xl overflow-hidden">
            <Image src="/logo.jpg" alt="Orbit Logo" width={80} height={80} className="w-full h-full object-cover" />
          </div>
          <h1 className="text-3xl font-bold gradient-text mb-2">Orbit</h1>
          <p className="text-muted-foreground">Superhuman for Gmail & Calendar</p>
        </div>

        {/* Features */}
        <div className="flex items-center justify-center gap-6 mb-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5"><Mail className="w-4 h-4 text-primary/60" />Email</div>
          <div className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-primary/60" />Calendar</div>
          <div className="flex items-center gap-1.5"><Bot className="w-4 h-4 text-primary/60" />AI Agent</div>
        </div>

        {/* Login card */}
        <div className="glass-strong rounded-2xl p-6 border-gradient">
          {/* Primary: Google Sign-In */}
          <button
            onClick={() => signIn("google", { callbackUrl: "/mail" })}
            className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-all glow-primary"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          {/* Permissions note */}
          <div className="mt-4 flex items-start gap-2 px-2">
            <Shield className="w-4 h-4 text-muted-foreground/40 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground/50 leading-relaxed">
              Orbit requests access to your Gmail and Google Calendar to display your emails and events. 
              Your data stays in your browser and is never stored on our servers.
            </p>
          </div>

          {/* Demo login toggle */}
          <div className="mt-5 pt-4 border-t border-border/30">
            {!showDemo ? (
              <button
                onClick={() => setShowDemo(true)}
                className="w-full text-center text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors"
              >
                Or continue with demo account (mock data) →
              </button>
            ) : (
              <div className="space-y-3 page-enter">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Name</label>
                  <input value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 bg-muted/50 rounded-lg text-sm border border-border/50 focus:border-primary/30 outline-none transition-all" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Email</label>
                  <input value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2 bg-muted/50 rounded-lg text-sm border border-border/50 focus:border-primary/30 outline-none transition-all" />
                </div>
                <button onClick={handleDemoLogin} disabled={loading} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-muted/50 rounded-lg text-sm hover:bg-muted transition-colors border border-border/50 disabled:opacity-50">
                  {loading ? "Signing in..." : <><span>Continue with Demo</span><ArrowRight className="w-4 h-4" /></>}
                </button>
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground/40 mt-6">Powered by Corsair • Built for the Corsair Hackathon</p>
      </div>
    </div>
  );
}
