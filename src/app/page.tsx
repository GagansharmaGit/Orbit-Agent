import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Bot, Calendar, Mail, Sparkles, Zap } from "lucide-react";
import { auth } from "@/server/auth";
import { redirect } from "next/navigation";

export default async function LandingPage() {
  const session = await auth();
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white selection:bg-[#1a73e8]/30">
      {/* Navigation */}
      <nav className="border-b border-white/5 bg-[#0b0f19]/80 backdrop-blur-md fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logo.jpg" alt="Orbit Logo" width={32} height={32} className="rounded-lg shadow-lg glow-primary" />
            <span className="font-bold text-xl tracking-tight">Orbit</span>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="text-sm font-medium text-muted-foreground hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link 
              href="/dashboard" 
              className="px-4 py-2 bg-[#1a73e8] text-white rounded-full text-sm font-medium hover:bg-[#1557b0] transition-colors flex items-center gap-2"
            >
              Go to App
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-24 px-6 relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#1a73e8]/20 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-[#1a73e8] mb-8">
            <Sparkles className="w-4 h-4" />
            The intelligent, AI-powered workspace
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-tight">
            Manage your time with <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1a73e8] to-[#4285f4]">
              absolute precision.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Orbit brings your Mail, Calendar, and a powerful AI Agent into one unified, 
            lightning-fast interface designed for maximum productivity.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link 
              href="/dashboard" 
              className="px-8 py-4 bg-[#1a73e8] text-white rounded-full font-medium hover:bg-[#1557b0] transition-all hover:scale-105 active:scale-95 flex items-center gap-2 shadow-lg shadow-[#1a73e8]/20"
            >
              <Zap className="w-5 h-5" />
              Get Started Free
            </Link>
          </div>
        </div>
      </main>

      {/* Features Grid */}
      <section className="py-24 px-6 border-t border-white/5 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-[#1a73e8]/10 flex items-center justify-center mb-6">
                <Mail className="w-6 h-6 text-[#1a73e8]" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Lightning Fast Mail</h3>
              <p className="text-muted-foreground leading-relaxed">
                Experience a clutter-free inbox that loads instantly. Search, filter, and organize your emails with unparalleled speed.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-[#1a73e8]/10 flex items-center justify-center mb-6">
                <Calendar className="w-6 h-6 text-[#1a73e8]" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Integrated Calendar</h3>
              <p className="text-muted-foreground leading-relaxed">
                Your schedule, seamlessly connected to your communications. Send quick invites and manage meetings effortlessly.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-[#1a73e8]/10 flex items-center justify-center mb-6">
                <Bot className="w-6 h-6 text-[#1a73e8]" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Autonomous AI Agent</h3>
              <p className="text-muted-foreground leading-relaxed">
                Let Orbit AI draft emails, summarize unread threads, and schedule meetings on your behalf.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5 text-center text-sm text-muted-foreground">
        <p>© 2026 Orbit Workspace. All rights reserved.</p>
      </footer>
    </div>
  );
}
