"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useChat } from "@ai-sdk/react";
import { trpc } from "@/lib/trpc";
import { format, isSameDay, startOfDay } from "date-fns";
import { cn } from "@/lib/utils";
import { Send, Bot, User, Sparkles, Loader2, Trash2, Mail, Calendar, Clock, Menu, X } from "lucide-react";

const SUGGESTIONS = [
  "Send a calendar invite to friend@corsair.dev at 9 AM next Thursday",
  "Draft an email to team@acme.co about the Q3 planning meeting",
  "What meetings do I have today?",
  "Summarize my unread emails",
  "Send an email to sarah@acme.co saying I'll be 10 minutes late",
];

export function AgentChat() {
  const { data: history } = trpc.ai.chatHistory.useQuery({});
  
  const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(new Date()));
  const [isMobileHistoryOpen, setIsMobileHistoryOpen] = useState(false);

  const allHistoryMessages = useMemo(() => {
    if (!history) return [];
    return history.map(msg => ({
      id: msg.id,
      role: msg.role as "system" | "user" | "assistant" | "data",
      content: msg.content,
      createdAt: msg.createdAt,
    } as any));
  }, [history]);

  const historyDays = useMemo(() => {
    const days: Date[] = [];
    allHistoryMessages.forEach(msg => {
      if (!msg.createdAt) return;
      const d = startOfDay(new Date(msg.createdAt));
      if (!days.find(existing => isSameDay(existing, d))) {
        days.push(d);
      }
    });
    days.sort((a, b) => b.getTime() - a.getTime());
    
    // Ensure today is always in the list
    const today = startOfDay(new Date());
    if (!days.find(d => isSameDay(d, today))) {
      days.unshift(today);
    }
    return days;
  }, [allHistoryMessages]);

  const initialMessages = useMemo(() => {
    return allHistoryMessages.filter(msg => {
      if (!msg.createdAt) return isSameDay(selectedDate, new Date());
      return isSameDay(new Date(msg.createdAt), selectedDate);
    });
  }, [allHistoryMessages, selectedDate]);

  const { messages, sendMessage, status, setMessages } = useChat({
    messages: initialMessages as any,
    id: selectedDate.getTime().toString(),
  });

  // Re-sync if history updates or selected date changes
  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages, setMessages]);

  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isLoading = status === "streaming" || status === "submitted";

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;
    
    if (!isSameDay(selectedDate, new Date())) {
      setSelectedDate(startOfDay(new Date()));
      // Allow react to update the state so useChat resets context to today
      setTimeout(() => {
        sendMessage({ text: input });
      }, 0);
    } else {
      sendMessage({ text: input });
    }
    setInput("");
  };

  const clearHistoryMutation = trpc.ai.clearHistory.useMutation({
    onSuccess: () => setMessages([])
  });

  return (
    <div className="flex h-full w-full relative">
      {/* Mobile History Backdrop */}
      {isMobileHistoryOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden" 
          onClick={() => setIsMobileHistoryOpen(false)}
        />
      )}

      {/* History Sidebar */}
      <div className={cn(
        "absolute md:static inset-y-0 left-0 z-50 w-64 border-r border-border/50 flex flex-col bg-card md:bg-muted/10 transition-transform duration-300 md:translate-x-0 h-full",
        isMobileHistoryOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="px-4 py-4 border-b border-border/50 flex items-center justify-between">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            Chat History
          </h3>
          <button className="md:hidden p-1 hover:bg-muted rounded-md" onClick={() => setIsMobileHistoryOpen(false)}>
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {historyDays.map(date => {
            const isSelected = isSameDay(date, selectedDate);
            const isToday = isSameDay(date, new Date());
            return (
              <button
                key={date.getTime()}
                onClick={() => {
                  setSelectedDate(date);
                  setIsMobileHistoryOpen(false);
                }}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                  isSelected 
                    ? "bg-primary/10 text-primary font-medium" 
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                {isToday ? "Today" : format(date, "MMM d, yyyy")}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full relative min-w-0">
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-border/50 flex items-center gap-3">
          <button 
            className="md:hidden p-2 -ml-2 rounded-lg hover:bg-accent text-muted-foreground"
            onClick={() => setIsMobileHistoryOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center glow-primary shrink-0">
            <Bot className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold truncate">Orbit AI Agent</h2>
            <p className="text-xs text-muted-foreground truncate">Powered by Corsair MCP</p>
          </div>
          {messages.length > 0 && isSameDay(selectedDate, new Date()) && (
            <button 
              onClick={() => clearHistoryMutation.mutate()} 
              className="p-2 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors shrink-0" 
              title="Clear today's chat"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 border-gradient">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 gradient-text">
                {isSameDay(selectedDate, new Date()) ? "What can I help you with?" : "No messages on this day"}
              </h3>
              {isSameDay(selectedDate, new Date()) && (
                <>
                  <p className="text-sm text-muted-foreground text-center max-w-md mb-8">
                    I can send emails, create calendar invites, search your inbox, and manage your schedule.
                  </p>
                  <div className="grid gap-2 w-full max-w-lg">
                    {SUGGESTIONS.map((s, i) => (
                      <button key={i} onClick={() => { sendMessage({ text: s }); }} className="flex items-center gap-3 px-4 py-3 rounded-lg bg-muted/30 border border-border/30 text-sm text-left hover:bg-muted/50 hover:border-border/50 transition-all group">
                        {s.includes("email") || s.includes("Email") ? <Mail className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" /> : s.includes("calendar") || s.includes("meeting") ? <Calendar className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" /> : <Sparkles className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />}
                        <span className="text-muted-foreground group-hover:text-foreground transition-colors">{s}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            messages.map((message) => {
              return (
                <div key={message.id}>
                  <div className={cn("flex gap-3 page-enter", message.role === "user" && "flex-row-reverse")}>
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0", message.role === "user" ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground")}>
                      {message.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                    <div className={cn("max-w-[80%] rounded-xl px-4 py-3 text-sm leading-relaxed", message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted/50 border border-border/30")}>
                      <div className="whitespace-pre-wrap">{(message as any).content || (message as any).parts?.map((p: any, i: number) => p.type === "text" ? <span key={i}>{p.text}</span> : null)}</div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center"><Bot className="w-4 h-4 text-muted-foreground" /></div>
              <div className="bg-muted/50 border border-border/30 rounded-xl px-4 py-3"><Loader2 className="w-4 h-4 animate-spin text-muted-foreground" /></div>
            </div>
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="px-6 py-4 border-t border-border/50">
          <div className="flex items-center gap-2 max-w-3xl mx-auto w-full">
            <input 
              ref={inputRef} 
              type="text" 
              value={input} 
              onChange={e => setInput(e.target.value)} 
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder={isSameDay(selectedDate, new Date()) ? "Send an email, create an invite, or ask anything..." : "Send a message... (Will jump to Today)"}
              className="flex-1 px-4 py-3 bg-muted/50 rounded-xl text-sm placeholder:text-muted-foreground/50 border border-transparent focus:border-primary/30 focus:bg-muted outline-none transition-all" 
            />
            <button type="submit" disabled={!input.trim() || isLoading} className="p-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed glow-primary">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
