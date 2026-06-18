"use client";

import { useSession } from "next-auth/react";
import { trpc } from "@/lib/trpc";
import { format, isToday, isFuture } from "date-fns";
import { 
  Inbox, 
  Calendar as CalendarIcon, 
  Sparkles, 
  ArrowRight,
  Loader2,
  Clock,
  PenLine,
  Video,
  ChevronRight,
  Mail,
  Bot
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/stores/app-store";

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const user = session?.user;
  const { setComposeOpen, setQuickInviteOpen } = useAppStore();

  const [prompt, setPrompt] = useState("");

  const handleAskAI = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    router.push("/agent");
  };

  return (
    <div className="flex-1 overflow-y-auto h-full bg-background page-enter">
      <div className="max-w-6xl mx-auto p-6 sm:p-8 space-y-8 pb-20">
        
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary/20 via-background to-background border border-border/50 p-8 sm:p-12 shadow-lg">
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-60 pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl opacity-50 pointer-events-none" />
          
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-muted-foreground mb-6 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              System Online
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent leading-tight">
              Good {new Date().getHours() < 12 ? "morning" : "afternoon"},<br />
              {user?.name?.split(" ")[0] || "there"}
            </h1>
            <p className="text-lg text-muted-foreground">
              Welcome to your intelligent workspace. Everything you need is right here.
            </p>

            <div className="flex flex-wrap gap-3 mt-8">
              <button 
                onClick={() => setComposeOpen(true)}
                className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-all glow-primary flex items-center gap-2"
              >
                <PenLine className="w-4 h-4" />
                Compose Mail
              </button>
              <button 
                onClick={() => setQuickInviteOpen(true)}
                className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-border text-foreground rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
              >
                <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                Schedule Event
              </button>
            </div>
          </div>
        </div>

        {/* AI Command Center */}
        <div className="relative p-1 rounded-3xl bg-gradient-to-b from-primary/30 to-transparent">
          <div className="bg-card/80 backdrop-blur-xl rounded-[22px] p-6 sm:p-8 border border-border/50 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-1/4 w-1/2 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center glow-primary shrink-0 border border-primary/30">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Orbit AI</h2>
                  <p className="text-sm text-muted-foreground">Your autonomous agent</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setPrompt("Draft an email to the team about the upcoming launch")} className="text-xs px-4 py-2 rounded-full bg-background hover:bg-accent text-muted-foreground hover:text-foreground transition-all border border-border">
                  Draft email
                </button>
                <button onClick={() => setPrompt("What is my schedule for tomorrow?")} className="text-xs px-4 py-2 rounded-full bg-background hover:bg-accent text-muted-foreground hover:text-foreground transition-all border border-border">
                  Check schedule
                </button>
              </div>
            </div>

            <form onSubmit={handleAskAI} className="relative group">
              <input 
                type="text" 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ask anything or command Orbit..."
                className="w-full bg-black/40 border border-border/50 rounded-2xl pl-5 pr-14 py-4 text-base focus:border-primary/50 focus:bg-black/60 outline-none transition-all shadow-inner placeholder:text-muted-foreground/50"
              />
              <button 
                type="submit" 
                disabled={!prompt.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-primary text-primary-foreground rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 shrink-0"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>

        {/* Two Column Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          
          {/* Inbox Summary */}
          <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border/50 flex flex-col h-[320px] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors" />
            
            <div className="flex items-center justify-between mb-8 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Inbox className="w-5 h-5 text-blue-500" />
                </div>
                <h2 className="text-lg font-semibold">Inbox Pulse</h2>
              </div>
            </div>
            
            <div className="flex-1 flex flex-col items-center justify-center relative z-10">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-blue-500/5 border border-blue-500/10 mb-4">
                  <Mail className="w-10 h-10 text-blue-500" />
                </div>
                <p className="text-muted-foreground font-medium mb-4">Manage your emails</p>
                <Link href="/mail" className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-full text-sm font-medium transition-colors inline-flex items-center gap-2">
                  Go to Inbox
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Up Next */}
          <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border/50 flex flex-col h-[320px] relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />

            <div className="flex items-center justify-between mb-6 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-lg font-semibold">AI Agent</h2>
              </div>
            </div>
            
            <div className="flex-1 flex flex-col items-center justify-center relative z-10">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/5 border border-primary/10 mb-4">
                  <Sparkles className="w-10 h-10 text-primary" />
                </div>
                <p className="text-muted-foreground font-medium mb-4">Let Orbit AI help you</p>
                <Link href="/agent" className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full text-sm font-medium transition-colors inline-flex items-center gap-2">
                  Open Agent
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
