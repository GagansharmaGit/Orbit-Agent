"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useAppStore } from "@/stores/app-store";
import { cn, formatTime } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  Users,
  Zap,
  Mail,
  Video,
  ExternalLink,
  Edit2,
  Trash2,
  MoreVertical,
  X,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import {
  format,
  startOfWeek,
  addDays,
  addWeeks,
  subWeeks,
  isSameDay,
  isToday,
  setHours,
} from "date-fns";

const HOURS = Array.from({ length: 24 }, (_, i) => i); // 12 AM to 11 PM
const EVENT_STYLES = [
  { border: "border-emerald-500", bg: "bg-emerald-500/10", text: "text-emerald-500", light: "bg-emerald-500/20 text-emerald-400" },
  { border: "border-blue-500", bg: "bg-blue-500/10", text: "text-blue-500", light: "bg-blue-500/20 text-blue-400" },
  { border: "border-amber-500", bg: "bg-amber-500/10", text: "text-amber-500", light: "bg-amber-500/20 text-amber-400" },
  { border: "border-rose-500", bg: "bg-rose-500/10", text: "text-rose-500", light: "bg-rose-500/20 text-rose-400" },
  { border: "border-purple-500", bg: "bg-purple-500/10", text: "text-purple-500", light: "bg-purple-500/20 text-purple-400" },
];

export function CalendarView() {
  const { selectedDate, setSelectedDate, setEventCreateOpen, setQuickInviteOpen } = useAppStore();
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const utils = trpc.useUtils();

  // Auto-scroll to roughly the current time when viewing today
  useEffect(() => {
    if (scrollRef.current && isToday(viewDate)) {
      const currentHour = new Date().getHours();
      scrollRef.current.scrollTop = Math.max((currentHour - 2) * 60, 0);
    }
  }, [viewDate]);

  const deleteEventMutation = trpc.calendar.deleteEvent.useMutation({
    onMutate: () => {
      // Optimistically close the modal to show immediate feedback
      setSelectedEvent(null);
    },
    onSuccess: (res) => {
      if (res && res.success === false) {
        toast.error("Failed to delete event. You may not have permission to delete it.");
      } else {
        toast.success("Event deleted successfully");
      }
      utils.calendar.listEvents.invalidate();
    },
    onError: (error) => {
      toast.error("Error deleting event: " + error.message);
    }
  });

  const handleDelete = () => {
    if (!selectedEvent?.id) {
      toast.error("Cannot delete this event (missing ID).");
      return;
    }
    deleteEventMutation.mutate({ eventId: selectedEvent.id });
  };

  const handleCopyLink = () => {
    if (selectedEvent?.hangoutLink) {
      navigator.clipboard.writeText(selectedEvent.hangoutLink);
      toast.success("Meet link copied to clipboard");
    }
  };

  const weekStart = startOfWeek(viewDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const { data: eventsData } = trpc.calendar.listEvents.useQuery({
    timeMin: weekStart.toISOString(),
    timeMax: addDays(weekStart, 7).toISOString(),
  });

  const events = eventsData?.items || [];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Calendar header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between px-6 py-4 border-b border-border/50 gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">
            {format(viewDate, "MMMM yyyy")}
          </h2>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setViewDate(new Date())}
              className="px-3 py-1.5 text-sm rounded-md hover:bg-accent transition-colors font-medium border border-border/50 mr-2"
            >
              Today
            </button>
            <button
              onClick={() => setViewDate(subWeeks(viewDate, 1))}
              className="p-1.5 rounded-md hover:bg-accent transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewDate(addWeeks(viewDate, 1))}
              className="p-1.5 rounded-md hover:bg-accent transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => setQuickInviteOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors glow-primary"
          >
            <Zap className="w-4 h-4" />
            Quick Invite
            <kbd>i</kbd>
          </button>
        </div>
      </div>

      {/* Week grid container */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex flex-col h-full min-w-[700px] bg-background">
          {/* Day headers */}
          <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-border/50 flex-shrink-0">
            <div className="p-3 text-xs text-muted-foreground font-medium flex items-center justify-center border-r border-border/30">
              GMT
            </div>
            {weekDays.map((day, i) => (
              <div
                key={i}
                className={cn(
                  "p-3 text-center border-r border-border/30 flex items-center justify-center gap-2",
                  isToday(day) ? "bg-primary/5 text-primary" : "text-muted-foreground"
                )}
              >
                <span className="text-sm font-medium uppercase">
                  {format(day, "EEE")}
                </span>
                <span className={cn("text-sm font-bold", isToday(day) ? "text-primary" : "text-foreground")}>
                  {format(day, "dd")}
                </span>
              </div>
            ))}
          </div>

          {/* Time grid */}
          <div className="flex-1 overflow-y-auto custom-scrollbar scroll-smooth bg-card/30" ref={scrollRef}>
            <div className="grid grid-cols-[60px_repeat(7,1fr)] min-h-[840px]">
            {/* Time labels */}
            <div className="relative">
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  className="h-[60px] pr-2 flex items-start justify-end"
                >
                  <span className="text-xs text-muted-foreground -mt-2">
                    {format(setHours(new Date(), hour), "h a")}
                  </span>
                </div>
              ))}
            </div>

            {/* Day columns */}
            {weekDays.map((day, dayIndex) => (
              <div
                key={dayIndex}
                className={cn(
                  "relative border-r border-border/30",
                  isToday(day) && "bg-primary/[0.02]"
                )}
              >
                {/* Hour lines */}
                {HOURS.map((hour) => (
                  <div
                    key={hour}
                    className="h-[60px] border-b border-border/10"
                  />
                ))}

                {/* Events */}
                {events
                  .filter((evt: any) => {
                    const evtDate = new Date(evt.start?.dateTime || evt.start?.date);
                    return isSameDay(evtDate, day);
                  })
                  .map((evt: any, evtIndex: number) => {
                    const start = new Date(evt.start?.dateTime);
                    const end = new Date(evt.end?.dateTime);
                    const startHour = start.getHours() + start.getMinutes() / 60;
                    const endHour = end.getHours() + end.getMinutes() / 60;
                    const top = startHour * 60;
                    const height = Math.max((endHour - startHour) * 60, 30);
                    const style = EVENT_STYLES[evtIndex % EVENT_STYLES.length];

                    return (
                      <div
                        key={evt.id}
                        onClick={() => setSelectedEvent(evt)}
                        className={cn(
                          "absolute left-1.5 right-1.5 rounded-md px-3 py-2 cursor-pointer transition-all hover:shadow-md hover:z-20 border border-white/5 flex flex-col border-l-[3px]",
                          style.bg,
                          style.border
                        )}
                        style={{ top: `${top + 1}px`, height: `${height - 2}px` }}
                      >
                        {height >= 40 && (
                          <p className="text-[10px] font-semibold tracking-wider uppercase mb-0.5 opacity-80">
                            {formatTime(start)} - {formatTime(end)}
                          </p>
                        )}
                        <p className="text-sm font-semibold truncate text-foreground leading-tight">{evt.summary}</p>
                        
                        {height >= 60 && evt.location && (
                          <div className="flex items-center gap-1 mt-1.5">
                            <MapPin className="w-3 h-3 opacity-50" />
                            <p className="text-xs opacity-70 truncate">{evt.location}</p>
                          </div>
                        )}

                        {height >= 80 && (
                          <div className={cn("inline-flex items-center gap-1.5 mt-auto self-start px-2 py-1 rounded-md text-[10px] font-medium", style.light)}>
                            <Clock className="w-3 h-3" />
                            Scheduled
                          </div>
                        )}
                      </div>
                    );
                  })}

                {/* Current time indicator */}
                {isToday(day) && (
                  <div
                    className="absolute left-0 right-0 flex items-center z-10 pointer-events-none"
                    style={{
                      top: `${(new Date().getHours() + new Date().getMinutes() / 60) * 60}px`,
                    }}
                  >
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)] z-20 -ml-[5px]" />
                    <div className="flex-1 h-[2px] bg-red-500/80 shadow-[0_0_4px_rgba(239,68,68,0.4)]" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>

      {/* Today's agenda sidebar */}
      <div className="border-t border-border/50 px-6 py-3">
        <div className="flex items-center gap-4 text-xs text-muted-foreground/50">
          <span><kbd>i</kbd> quick invite</span>
          <span><kbd>←→</kbd> navigate weeks</span>
          <span><kbd>t</kbd> jump to today</span>
        </div>
      </div>

      {/* Event Details Dialog */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedEvent(null)} />
          <div className="relative w-full max-w-[440px] bg-background rounded-2xl shadow-2xl border border-border/50 flex flex-col z-10 page-enter overflow-hidden">
            {/* Header Actions */}
            <div className="flex items-center justify-end gap-1 p-3 pb-0 bg-muted/20">
              <button 
                onClick={handleDelete}
                disabled={deleteEventMutation.isPending}
                className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-full transition-colors text-muted-foreground disabled:opacity-50"
                title="Delete event"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button onClick={() => setSelectedEvent(null)} className="p-2 hover:bg-muted rounded-full transition-colors ml-1 bg-muted/50 text-foreground"><X className="w-4 h-4" /></button>
            </div>

            <div className="px-6 pb-6 pt-2 overflow-y-auto max-h-[80vh]">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-4 h-4 rounded bg-primary mt-1.5 shrink-0" />
                <div>
                  <h3 className="text-2xl font-normal leading-tight mb-1.5">{selectedEvent.summary}</h3>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(selectedEvent.start?.dateTime || selectedEvent.start?.date), "EEEE, MMMM d")} • {formatTime(new Date(selectedEvent.start?.dateTime || selectedEvent.start?.date))} – {formatTime(new Date(selectedEvent.end?.dateTime || selectedEvent.end?.date))}
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Meet Link */}
                {selectedEvent.hangoutLink && (
                  <div className="flex items-start gap-4">
                    <Video className="w-5 h-5 text-muted-foreground shrink-0 mt-2" />
                    <div className="flex-1">
                      <a href={selectedEvent.hangoutLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-full text-sm font-medium transition-colors mb-1">
                        Join with Google Meet
                      </a>
                      <p className="text-xs text-muted-foreground">{selectedEvent.hangoutLink.replace("https://", "")}</p>
                    </div>
                    <button onClick={handleCopyLink} className="p-2 hover:bg-muted rounded-full mt-1 text-muted-foreground" title="Copy link">
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Location */}
                {selectedEvent.location && (
                  <div className="flex items-start gap-4">
                    <MapPin className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                    <span className="text-sm">{selectedEvent.location}</span>
                  </div>
                )}

                {/* Description */}
                {selectedEvent.description && (
                  <div className="flex items-start gap-4">
                    <div className="w-5 h-5 shrink-0" />
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedEvent.description}</p>
                  </div>
                )}

                {/* Attendees */}
                {selectedEvent.attendees?.length > 0 && (
                  <div className="flex items-start gap-4">
                    <Users className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium">{selectedEvent.attendees.length} guests</span>
                      </div>
                      <div className="space-y-3">
                        {selectedEvent.attendees.map((a: any) => (
                          <div key={a.email} className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-medium shrink-0 relative">
                              {a.email[0].toUpperCase()}
                              {a.responseStatus === "accepted" && (
                                <div className="absolute -bottom-1 -right-1 bg-background rounded-full">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm truncate leading-tight">{a.displayName || a.email}</p>
                              {a.organizer && <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Organizer</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
