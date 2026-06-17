"use client";

import { usePathname } from "next/navigation";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useAppStore } from "@/stores/app-store";
import { Sidebar } from "@/components/layout/sidebar";
import { CommandPalette } from "@/components/command-palette";
import { ComposeDialog } from "@/components/mail/compose-dialog";
import { QuickInviteDialog } from "@/components/calendar/quick-invite-dialog";

import { LayoutDashboard, Inbox, Calendar, Bot } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const mobileNav = [
  { view: "dashboard", icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { view: "mail", icon: Inbox, label: "Mail", href: "/mail" },
  { view: "calendar", icon: Calendar, label: "Calendar", href: "/calendar" },
  { view: "agent", icon: Bot, label: "Agent", href: "/agent" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  useKeyboardShortcuts();
  const { isComposeOpen, setComposeOpen, isQuickInviteOpen, setQuickInviteOpen } = useAppStore();

  return (
    <div className="flex h-screen overflow-hidden bg-background flex-col md:flex-row pb-16 md:pb-0">
      
      {/* Sidebar hidden on mobile */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      <main className="flex-1 overflow-hidden page-enter flex flex-col h-[calc(100vh-64px)] md:h-screen">
        {children}
      </main>

      {/* Mobile Floating Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 px-4 pb-safe border-t border-border/30 bg-card/80 backdrop-blur-xl h-16 flex items-center justify-around">
        {mobileNav.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          return (
            <Link
              key={item.view}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-14 h-full gap-1 transition-colors",
                isActive ? "text-[#1a73e8]" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive && "fill-[#1a73e8]/20")} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <CommandPalette />
      <ComposeDialog open={isComposeOpen} onClose={() => setComposeOpen(false)} />
      <QuickInviteDialog open={isQuickInviteOpen} onClose={() => setQuickInviteOpen(false)} />
    </div>
  );
}
