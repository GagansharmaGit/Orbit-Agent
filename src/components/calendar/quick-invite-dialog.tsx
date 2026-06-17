"use client";

import { useState } from "react";
import { X, Zap, Calendar, Video } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export function QuickInviteDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [emails, setEmails] = useState("");
  const [title, setTitle] = useState("Meeting");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("09:00");
  const [duration, setDuration] = useState(60);
  const [addMeetLink, setAddMeetLink] = useState(false);

  const utils = trpc.useUtils();
  const inviteMutation = trpc.calendar.quickInvite.useMutation({
    onSuccess: () => { 
      toast.success("Calendar invite sent!"); 
      onClose(); 
      setEmails(""); 
      setTitle("Meeting"); 
      setDate(""); 
      setTime("09:00"); 
      setAddMeetLink(false);
      utils.calendar.listEvents.invalidate();
    },
    onError: () => toast.error("Failed to send invite"),
  });

  if (!open) return null;

  const dateTime = date && time ? new Date(`${date}T${time}`).toISOString() : "";

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-full max-w-md glass-strong rounded-xl shadow-2xl border border-border/50 page-enter">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
          <div className="flex items-center gap-2"><Zap className="w-5 h-5 text-primary" /><h3 className="font-semibold">Quick Invite</h3></div>
          <button onClick={onClose} className="p-1 rounded hover:bg-accent transition-colors"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div><label className="text-xs text-muted-foreground mb-1 block">Attendee Emails (comma separated)</label><input value={emails} onChange={e => setEmails(e.target.value)} placeholder="friend@corsair.dev, team@corsair.dev" className="w-full px-3 py-2.5 bg-muted/50 rounded-lg text-sm border border-border/50 focus:border-primary/30 outline-none" /></div>
          <div><label className="text-xs text-muted-foreground mb-1 block">Meeting Title</label><input value={title} onChange={e => setTitle(e.target.value)} placeholder="Meeting" className="w-full px-3 py-2.5 bg-muted/50 rounded-lg text-sm border border-border/50 focus:border-primary/30 outline-none" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-muted-foreground mb-1 block">Date</label><input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full px-3 py-2.5 bg-muted/50 rounded-lg text-sm border border-border/50 focus:border-primary/30 outline-none" /></div>
            <div><label className="text-xs text-muted-foreground mb-1 block">Time</label><input type="time" value={time} onChange={e => setTime(e.target.value)} className="w-full px-3 py-2.5 bg-muted/50 rounded-lg text-sm border border-border/50 focus:border-primary/30 outline-none" /></div>
          </div>
          <div><label className="text-xs text-muted-foreground mb-1 block">Duration</label>
            <div className="flex gap-2">
              {[30, 60, 90].map(d => (<button key={d} onClick={() => setDuration(d)} className={`px-3 py-2 rounded-lg text-sm border transition-colors ${duration === d ? "bg-primary/20 border-primary/30 text-primary" : "bg-muted/50 border-border/50 text-muted-foreground hover:bg-muted"}`}>{d}m</button>))}
            </div>
          </div>
          
          <div className="pt-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center">
                <input 
                  type="checkbox" 
                  checked={addMeetLink} 
                  onChange={e => setAddMeetLink(e.target.checked)} 
                  className="sr-only" 
                />
                <div className={`w-10 h-5.5 rounded-full transition-colors ${addMeetLink ? "bg-primary" : "bg-muted/80 border border-border/50"}`}>
                  <div className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 bg-white rounded-full transition-transform ${addMeetLink ? "translate-x-4.5" : "translate-x-0"}`} />
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-sm font-medium">
                <Video className={`w-4 h-4 ${addMeetLink ? "text-primary" : "text-muted-foreground"}`} />
                <span className={addMeetLink ? "text-foreground" : "text-muted-foreground"}>Add Google Meet Link</span>
              </div>
            </label>
          </div>
        </div>
        <div className="px-5 py-4 border-t border-border/50 flex justify-end">
          <button onClick={() => dateTime && inviteMutation.mutate({ emails, title, dateTime, duration, addMeetLink })} disabled={!emails || !dateTime || inviteMutation.isPending} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 glow-primary">
            <Calendar className="w-4 h-4" />{inviteMutation.isPending ? "Sending..." : "Send Invite"}
          </button>
        </div>
      </div>
    </div>
  );
}
