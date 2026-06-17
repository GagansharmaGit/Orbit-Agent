"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Inbox,
  Calendar,
  Bot,
  Command,
  Star,
  AlertCircle,
  Send,
  FileText,
  AlertOctagon,
  Trash2,
  ChevronLeft,
  LayoutDashboard
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore, type MailFolder } from "@/stores/app-store";

const mainNav = [
  { view: "dashboard", icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { view: "mail", icon: Inbox, label: "Mail", href: "/mail", badge: "1" },
  { view: "calendar", icon: Calendar, label: "Calendar", href: "/calendar", badge: "2" },
  { view: "agent", icon: Bot, label: "AI Agent", href: "/agent", badge: "3" },
];

const folders: { view: MailFolder; icon: React.ElementType; label: string; href: string }[] = [
  { view: "inbox", icon: Inbox, label: "Inbox", href: "/mail" },
  { view: "starred", icon: Star, label: "Starred", href: "/mail" },
  { view: "important", icon: AlertCircle, label: "Important", href: "/mail" },
  { view: "sent", icon: Send, label: "Sent", href: "/mail" },
  { view: "drafts", icon: FileText, label: "Drafts", href: "/mail" },
  { view: "spam", icon: AlertOctagon, label: "Spam", href: "/mail" },
  { view: "trash", icon: Trash2, label: "Trash", href: "/mail" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;
  const initial = (user?.name?.charAt(0) || user?.email?.charAt(0) || "?").toUpperCase();
  const { activeFolder, setActiveFolder, isMobileSidebarOpen, setMobileSidebarOpen } = useAppStore();

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden" 
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col w-[260px] border-r border-border/30 bg-background transition-transform duration-300 md:static md:translate-x-0",
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
      
      {/* Logo Area */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border/30">
        <Link href="/" className="flex items-center gap-3 text-foreground hover:opacity-80 transition-opacity">
          <Image src="/logo.jpg" alt="Orbit Logo" width={28} height={28} className="rounded-md shadow-sm" />
          <span className="font-semibold text-lg tracking-tight">Orbit</span>
        </Link>
        <button className="w-6 h-6 flex items-center justify-center rounded hover:bg-white/5 text-muted-foreground transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-6">
        
        {/* Quick Actions Search */}
        <button className="w-full flex items-center justify-between px-3 py-2 bg-transparent hover:bg-white/5 border border-transparent hover:border-border/50 rounded-lg text-sm text-muted-foreground transition-colors group">
          <div className="flex items-center gap-2">
            <Command className="w-4 h-4" />
            <span>Quick actions...</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="bg-white/5 border border-border/50 rounded px-1.5 py-0.5 text-[10px] font-medium">⌘K</kbd>
          </div>
        </button>

        {/* Main Navigation */}
        <nav className="space-y-1">
          {mainNav.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            return (
              <Link
                key={item.view}
                href={item.href}
                onClick={() => setMobileSidebarOpen(false)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200 group",
                  isActive 
                    ? "bg-[#1a73e8]/10 text-[#1a73e8]" 
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={cn("w-[18px] h-[18px]", isActive ? "text-[#1a73e8]" : "text-muted-foreground group-hover:text-foreground")} />
                  <span className={cn("font-medium text-[14px]", isActive ? "text-[#1a73e8]" : "")}>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={cn("text-[10px] font-medium w-5 h-5 flex items-center justify-center rounded bg-white/5 border border-border/30", isActive ? "text-[#1a73e8] border-[#1a73e8]/30 bg-[#1a73e8]/10" : "text-muted-foreground")}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Folders Navigation */}
        <div className="space-y-2">
          <h4 className="px-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Folders</h4>
          <nav className="space-y-0.5">
            {folders.map((item) => {
              const isActive = (pathname === "/mail" || pathname?.startsWith("/mail/")) && activeFolder === item.view;
              return (
                <Link
                  key={item.view}
                  href={item.href}
                  onClick={() => {
                    setActiveFolder(item.view);
                    setMobileSidebarOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-1.5 rounded-lg transition-all duration-200 group",
                    isActive 
                      ? "bg-[#1a73e8]/10 text-[#1a73e8]" 
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  )}
                >
                  <item.icon className={cn("w-[16px] h-[16px]", isActive ? "text-[#1a73e8]" : "text-muted-foreground group-hover:text-foreground")} />
                  <span className={cn("font-medium text-[13px]", isActive ? "text-[#1a73e8]" : "")}>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Profile Section (Bottom) */}
      <div className="p-4 border-t border-border/30">
        <button className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-white/5 transition-colors group">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#11b981] flex items-center justify-center text-sm font-semibold text-white">
              {initial}
            </div>
            <div className="text-left">
              <p className="text-[14px] font-medium text-foreground/90 leading-tight">{user?.name || "Gagan Sharma"}</p>
              <p className="text-[11px] text-muted-foreground truncate max-w-[120px]">{user?.email || "gagan.brainalive@gmail.com"}</p>
            </div>
          </div>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-muted-foreground group-hover:text-foreground">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </aside>
    </>
  );
}
