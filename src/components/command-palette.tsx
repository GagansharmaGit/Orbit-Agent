"use client";

import { useEffect, useState } from "react";
import { Command } from "cmdk";
import { useAppStore } from "@/stores/app-store";
import { useRouter } from "next/navigation";
import { Mail, Calendar, Bot, Search, Pen, Inbox, Send, Star, Zap, FileText } from "lucide-react";

export function CommandPalette() {
  const router = useRouter();
  const { isCommandPaletteOpen, setCommandPaletteOpen, setActiveFolder, setComposeOpen, setQuickInviteOpen } = useAppStore();
  const [search, setSearch] = useState("");

  useEffect(() => { if (!isCommandPaletteOpen) setSearch(""); }, [isCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const runAndClose = (fn: () => void) => { fn(); setCommandPaletteOpen(false); };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setCommandPaletteOpen(false)} />
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-full max-w-lg">
        <Command className="glass-strong rounded-xl shadow-2xl overflow-hidden border border-border/50" shouldFilter>
          <div className="flex items-center gap-3 px-4 border-b border-border/50">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Command.Input value={search} onValueChange={setSearch} placeholder="Type a command or search..." className="flex-1 py-3.5 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50" />
            <kbd>ESC</kbd>
          </div>
          <Command.List className="max-h-[300px] overflow-y-auto p-2">
            <Command.Empty className="py-8 text-center text-sm text-muted-foreground">No results found.</Command.Empty>
            <Command.Group heading="Actions" className="mb-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:text-muted-foreground/50 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5">
              <CmdItem icon={Pen} label="Compose Email" shortcut="C" onSelect={() => runAndClose(() => setComposeOpen(true))} />
              <CmdItem icon={Zap} label="Quick Calendar Invite" shortcut="I" onSelect={() => runAndClose(() => setQuickInviteOpen(true))} />
            </Command.Group>
            <Command.Group heading="Navigate" className="mb-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:text-muted-foreground/50 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5">
              <CmdItem icon={Inbox} label="Go to Inbox" onSelect={() => runAndClose(() => { router.push("/mail"); setActiveFolder("inbox"); })} />
              <CmdItem icon={Send} label="Go to Sent" onSelect={() => runAndClose(() => { router.push("/mail"); setActiveFolder("sent"); })} />
              <CmdItem icon={FileText} label="Go to Drafts" onSelect={() => runAndClose(() => { router.push("/mail"); setActiveFolder("drafts"); })} />
              <CmdItem icon={Star} label="Go to Starred" onSelect={() => runAndClose(() => { router.push("/mail"); setActiveFolder("starred"); })} />
              <CmdItem icon={Calendar} label="Go to Calendar" onSelect={() => runAndClose(() => router.push("/calendar"))} />
              <CmdItem icon={Bot} label="Go to AI Agent" onSelect={() => runAndClose(() => router.push("/agent"))} />
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
}

function CmdItem({ icon: Icon, label, shortcut, onSelect }: { icon: React.ElementType; label: string; shortcut?: string; onSelect: () => void }) {
  return (
    <Command.Item onSelect={onSelect} className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-sm text-muted-foreground data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground transition-colors">
      <Icon className="w-4 h-4" /><span className="flex-1">{label}</span>{shortcut && <kbd>{shortcut}</kbd>}
    </Command.Item>
  );
}
