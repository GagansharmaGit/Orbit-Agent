"use client";

import { useState } from "react";
import { X, Send, Minimize2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export function ComposeDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const sendMutation = trpc.mail.send.useMutation({
    onSuccess: () => { toast.success("Email sent!"); onClose(); setTo(""); setSubject(""); setBody(""); },
    onError: () => toast.error("Failed to send email"),
  });

  if (!open) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40 w-[520px] glass-strong rounded-xl shadow-2xl border border-border/50 flex flex-col page-enter">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-muted/30 rounded-t-xl">
        <h3 className="text-sm font-medium">New Message</h3>
        <div className="flex items-center gap-1">
          <button onClick={onClose} className="p-1 rounded hover:bg-accent transition-colors"><Minimize2 className="w-3.5 h-3.5" /></button>
          <button onClick={onClose} className="p-1 rounded hover:bg-accent transition-colors"><X className="w-3.5 h-3.5" /></button>
        </div>
      </div>
      <div className="px-4 py-2 border-b border-border/30">
        <div className="flex items-center gap-2 py-1"><span className="text-sm text-muted-foreground w-12">To</span><input value={to} onChange={e => setTo(e.target.value)} className="flex-1 bg-transparent text-sm outline-none" placeholder="recipient@email.com" /></div>
        <div className="flex items-center gap-2 py-1 border-t border-border/20"><span className="text-sm text-muted-foreground w-12">Subject</span><input value={subject} onChange={e => setSubject(e.target.value)} className="flex-1 bg-transparent text-sm outline-none" placeholder="Subject" /></div>
      </div>
      <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Write your message..." className="flex-1 min-h-[200px] px-4 py-3 bg-transparent text-sm outline-none resize-none" />
      <div className="flex items-center justify-between px-4 py-3 border-t border-border/50">
        <div className="text-xs text-muted-foreground/50">Press <kbd>⌘</kbd>+<kbd>Enter</kbd> to send</div>
        <button onClick={() => sendMutation.mutate({ to, subject, body })} disabled={!to || !subject || sendMutation.isPending} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 glow-primary">
          <Send className="w-4 h-4" />{sendMutation.isPending ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}
