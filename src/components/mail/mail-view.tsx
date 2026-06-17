"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useAppStore } from "@/stores/app-store";
import { trpc } from "@/lib/trpc";
import { cn, formatDate, truncate } from "@/lib/utils";
import { isToday, isYesterday, differenceInDays } from "date-fns";
import {
  Search,
  Archive,
  Trash2,
  Star,
  MoreHorizontal,
  Paperclip,
  Reply,
  Forward,
  ArrowLeft,
  Pen,
  Mail,
  Users,
  Tag,
  Info,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

export function MailView() {
  const { data: session } = useSession();
  const user = session?.user;
  const initial = (user?.name?.charAt(0) || user?.email?.charAt(0) || "?").toUpperCase();

  const FOLDER_TO_LABEL: Record<string, string[]> = {
    inbox: ["INBOX"],
    starred: ["STARRED"],
    important: ["IMPORTANT"],
    sent: ["SENT"],
    drafts: ["DRAFTS"],
    trash: ["TRASH"],
    spam: ["SPAM"],
  };
  const CATEGORY_TO_LABEL: Record<string, string> = {
    primary: "CATEGORY_PERSONAL",
    promotions: "CATEGORY_PROMOTIONS",
    social: "CATEGORY_SOCIAL",
    updates: "CATEGORY_UPDATES",
  };
  const {
    activeFolder,
    selectedEmailId,
    setSelectedEmailId,
    searchQuery,
    setSearchQuery,
    setSearchFocused,
    activeCategory,
    setActiveCategory,
    setComposeOpen,
    setComposeReplyTo,
    setQuickInviteOpen,
  } = useAppStore();

  const currentLabelIds = FOLDER_TO_LABEL[activeFolder] || ["INBOX"];

  const { data: emailsData, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = trpc.mail.list.useInfiniteQuery({
    query: searchQuery || undefined,
    maxResults: 10,
    labelIds: currentLabelIds,
  }, {
    getNextPageParam: (lastPage) => lastPage.nextPageToken,
  });

  const utils = trpc.useUtils();

  const markReadMutation = trpc.mail.markRead.useMutation({
    onMutate: async ({ id }) => {
      await utils.mail.list.cancel();
      const previous = utils.mail.list.getInfiniteData({ query: searchQuery || undefined, maxResults: 10, labelIds: currentLabelIds });
      if (previous) {
        utils.mail.list.setInfiniteData(
          { query: searchQuery || undefined, maxResults: 10, labelIds: currentLabelIds },
          {
            ...previous,
            pages: previous.pages.map(page => ({
              ...page,
              messages: page.messages.map((m: any) => m.id === id ? { ...m, isUnread: false } : m)
            }))
          }
        );
      }
      return { previous };
    },
    onError: (err, variables, context) => {
      if (context?.previous) {
        utils.mail.list.setInfiniteData({ query: searchQuery || undefined, maxResults: 10, labelIds: currentLabelIds }, context.previous);
      }
    },
    onSettled: () => {
      utils.mail.list.invalidate();
    }
  });

  const markUnreadMutation = trpc.mail.markUnread.useMutation({
    onMutate: async ({ id }) => {
      await utils.mail.list.cancel();
      const previous = utils.mail.list.getInfiniteData({ query: searchQuery || undefined, maxResults: 10, labelIds: currentLabelIds });
      if (previous) {
        utils.mail.list.setInfiniteData(
          { query: searchQuery || undefined, maxResults: 10, labelIds: currentLabelIds },
          {
            ...previous,
            pages: previous.pages.map(page => ({
              ...page,
              messages: page.messages.map((m: any) => m.id === id ? { ...m, isUnread: true } : m)
            }))
          }
        );
      }
      return { previous };
    },
    onError: (err, variables, context) => {
      if (context?.previous) {
        utils.mail.list.setInfiniteData({ query: searchQuery || undefined, maxResults: 10, labelIds: currentLabelIds }, context.previous);
      }
    },
    onSettled: () => {
      utils.mail.list.invalidate();
    }
  });

  const archiveMutation = trpc.mail.archive.useMutation({
    onSettled: () => utils.mail.list.invalidate()
  });

  const trashMutation = trpc.mail.trash.useMutation({
    onSettled: () => utils.mail.list.invalidate()
  });

  const toggleStarMutation = trpc.mail.toggleStar.useMutation({
    onMutate: async ({ id, starred }) => {
      await utils.mail.list.cancel();
      const previous = utils.mail.list.getInfiniteData({ query: searchQuery || undefined, maxResults: 10, labelIds: currentLabelIds });
      if (previous) {
        utils.mail.list.setInfiniteData(
          { query: searchQuery || undefined, maxResults: 10, labelIds: currentLabelIds },
          {
            ...previous,
            pages: previous.pages.map(page => ({
              ...page,
              messages: page.messages.map((m: any) => m.id === id ? { ...m, isStarred: starred } : m)
            }))
          }
        );
      }
      return { previous };
    },
    onError: (err, variables, context) => {
      if (context?.previous) {
        utils.mail.list.setInfiniteData({ query: searchQuery || undefined, maxResults: 10, labelIds: currentLabelIds }, context.previous);
      }
    },
    onSettled: () => utils.mail.list.invalidate()
  });

  const emails: any[] = emailsData?.pages.flatMap((p: any) => p.messages) || [];

  const selectedEmail: any = emails.find((e: any) => e.id === selectedEmailId);

  const groupedEmails = () => {
    const groups: Record<string, any[]> = {};
    emails.forEach(email => {
      const date = new Date(email.date || new Date());
      let label = "Older";
      if (isToday(date)) label = "Today";
      else if (isYesterday(date)) label = "Yesterday";
      else if (differenceInDays(new Date(), date) < 7) label = "Previous 7 Days";
      else if (differenceInDays(new Date(), date) < 30) label = "Previous 30 Days";
      
      if (!groups[label]) groups[label] = [];
      groups[label].push(email);
    });
    return [
      { label: "Today", items: groups["Today"] || [] },
      { label: "Yesterday", items: groups["Yesterday"] || [] },
      { label: "Previous 7 Days", items: groups["Previous 7 Days"] || [] },
      { label: "Previous 30 Days", items: groups["Previous 30 Days"] || [] },
      { label: "Older", items: groups["Older"] || [] },
    ].filter(g => g.items.length > 0);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight * 1.5 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  useEffect(() => {
    if (selectedEmailId && selectedEmail?.isUnread) {
      markReadMutation.mutate({ id: selectedEmailId });
    }
  }, [selectedEmailId, selectedEmail?.isUnread]);

  return (
    <div className="flex h-full">
      {/* Email list */}
      <div
        className={cn(
          "flex flex-col border-r border-border h-full transition-all duration-200 bg-background",
          selectedEmailId ? "hidden md:flex md:w-[380px]" : "flex-1 w-full md:max-w-3xl"
        )}
      >
        {/* Top actions bar */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-border/30 bg-card/40 backdrop-blur-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-black/20 border border-border/50 rounded-xl text-sm outline-none focus:border-primary/50 transition-colors"
            />
          </div>
          <button
            onClick={() => setComposeOpen(true)}
            className="flex-shrink-0 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-all shadow-[0_0_15px_rgba(var(--color-primary),0.3)] hover:-translate-y-0.5"
          >
            <Pen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Compose</span>
          </button>
        </div>

        {/* Email list */}
        <div className="flex-1 overflow-y-auto" onScroll={handleScroll}>
          {isLoading && emails.length === 0 ? (
            <div className="space-y-1 p-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-20 rounded-lg bg-muted/30 animate-pulse" />
              ))}
            </div>
          ) : emails.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <Search className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm">No emails found</p>
            </div>
          ) : (
            <div className="space-y-4 p-1 pb-10">
              {groupedEmails().map(group => (
                <div key={group.label} className="mb-6">
                  <h3 className="px-6 py-2.5 text-xs font-semibold text-foreground tracking-wider bg-card/60 backdrop-blur-xl border-y border-border/30 sticky top-0 z-10">{group.label}</h3>
                  <div className="space-y-1 mt-2 px-3">
                    {group.items.map((email: any) => {
                      const isSelected = selectedEmailId === email.id;
                      const initial = email.from?.charAt(0)?.toUpperCase() || "U";
                      return (
                        <button
                          key={email.id}
                          onClick={() => setSelectedEmailId(email.id)}
                          className={cn(
                            "w-full text-left p-3 rounded-xl transition-all duration-200 border border-transparent group relative flex gap-3",
                            isSelected ? "bg-primary/10 border-primary/20 shadow-sm" : "hover:bg-white/5",
                          )}
                        >
                          <div className="flex-shrink-0 relative">
                            {email.isUnread && (
                              <div className="absolute -left-1 -top-1 w-3 h-3 bg-primary rounded-full border-2 border-background z-10 shadow-[0_0_8px_rgba(var(--color-primary),0.6)]" />
                            )}
                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium border border-primary/20">
                              {initial}
                            </div>
                          </div>
                          
                          <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
                            <div className="flex items-center justify-between">
                              <span className={cn("text-[15px] truncate", email.isUnread ? "font-semibold text-foreground" : "font-medium text-foreground/80")}>
                                {email.from?.split("<")[0]?.trim() || "Unknown"}
                              </span>
                              <span className="text-xs text-muted-foreground flex-shrink-0 ml-2 font-medium">
                                {formatDate(email.date)}
                              </span>
                            </div>
                            <p className={cn("text-sm truncate", email.isUnread ? "font-medium text-foreground/90" : "text-muted-foreground")}>
                              {email.subject}
                            </p>
                            <p className="text-[13px] text-muted-foreground/60 truncate">
                              {truncate(email.snippet || "", 100)}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
              {isFetchingNextPage && (
                <div className="flex justify-center p-4">
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              {!isFetchingNextPage && hasNextPage && (
                <div className="flex justify-center p-4">
                  <button 
                    onClick={() => fetchNextPage()}
                    className="text-xs text-muted-foreground hover:text-foreground hover:underline transition-colors"
                  >
                    Load more emails
                  </button>
                </div>
              )}
              {!hasNextPage && emails.length > 0 && (
                <div className="flex justify-center p-4 text-xs text-muted-foreground/30">
                  End of inbox
                </div>
              )}
            </div>
          )}
        </div>

        {/* Keyboard hints */}
        <div className="px-4 py-2 border-t border-border/30 flex items-center gap-4 text-xs text-muted-foreground/50">
          <span><kbd>c</kbd> compose</span>
          <span><kbd>/</kbd> search</span>
          <span><kbd>e</kbd> archive</span>
        </div>
      </div>

      {/* Email preview */}
      {selectedEmailId && selectedEmail ? (
        <div className="flex-1 flex flex-col h-full bg-background page-enter z-10 w-full absolute inset-0 md:static">
          {/* Preview header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border/30 bg-card/40 backdrop-blur-md">
            <div className="flex items-center gap-3 w-full md:w-auto overflow-hidden">
              <button
                onClick={() => setSelectedEmailId(null)}
                className="p-1.5 md:hidden rounded-md hover:bg-white/5 transition-colors flex-shrink-0"
              >
                <ArrowLeft className="w-5 h-5 text-foreground" />
              </button>
              <h2 className="text-lg font-semibold text-foreground/90 truncate">{selectedEmail.subject}</h2>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => markUnreadMutation.mutate({ id: selectedEmail.id })} className="p-2 rounded-lg hover:bg-white/5 transition-colors text-muted-foreground hover:text-foreground" title="Mark as unread">
                <Mail className="w-4 h-4" />
              </button>
              <button onClick={() => { archiveMutation.mutate({ id: selectedEmail.id }); setSelectedEmailId(null); }} className="p-2 rounded-lg hover:bg-white/5 transition-colors text-muted-foreground hover:text-foreground" title="Archive">
                <Archive className="w-4 h-4" />
              </button>
              <button onClick={() => { trashMutation.mutate({ id: selectedEmail.id }); setSelectedEmailId(null); }} className="p-2 rounded-lg hover:bg-white/5 transition-colors text-muted-foreground hover:text-foreground" title="Delete">
                <Trash2 className="w-4 h-4" />
              </button>
              <button onClick={() => toggleStarMutation.mutate({ id: selectedEmail.id, starred: true })} className="p-2 rounded-lg hover:bg-white/5 transition-colors text-muted-foreground hover:text-foreground" title="Star">
                <Star className="w-4 h-4" />
              </button>
              <button onClick={() => toast.success("More options clicked")} className="p-2 rounded-lg hover:bg-white/5 transition-colors text-muted-foreground hover:text-foreground" title="More options">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Email content area with Sidebar */}
          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 overflow-y-auto px-8 py-6">
              <div className="max-w-3xl">
                {/* Sender info */}
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-lg font-medium text-primary border border-primary/20 shadow-lg shadow-primary/10">
                    {(selectedEmail.from?.charAt(0) || "?").toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground text-base">{selectedEmail.from?.split("<")[0]?.trim()}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedEmail.from?.match(/<(.+)>/)?.[1] || selectedEmail.from}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-muted-foreground block">{formatDate(selectedEmail.date)}</span>
                    <span className="text-xs text-muted-foreground/60">to me</span>
                  </div>
                </div>

                {/* Body */}
                <div className="prose prose-invert max-w-none text-foreground/80 bg-black/10 rounded-2xl p-6 border border-border/30 shadow-inner">
                  <p className="leading-relaxed whitespace-pre-wrap text-[15px]">
                    {selectedEmail.snippet}
                  </p>
                  <br />
                  <p className="leading-relaxed text-[15px]">
                    Let me know your thoughts on this. I think we should schedule a quick call to discuss the next steps and ensure we align on the roadmap.
                  </p>
                  <br />
                  <p className="leading-relaxed text-[15px]">
                    Best regards,
                    <br />
                    <span className="font-medium text-foreground/90">{selectedEmail.from?.split("<")[0]?.trim()}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Smart Context Sidebar */}
            <div className="w-72 border-l border-border/30 bg-card/20 p-6 flex flex-col gap-6 overflow-y-auto hidden lg:flex">
              <div className="bg-black/20 backdrop-blur-md rounded-xl p-4 flex items-center gap-3 border border-border/20">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-primary font-medium text-lg">{initial}</span>
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-medium truncate">{user?.name || "User"}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email || "Unknown"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Reply bar */}
          <div className="px-8 py-4 border-t border-border/30 flex items-center gap-3 bg-card/20 backdrop-blur-md">
            <button 
              onClick={() => {
                setComposeReplyTo({
                  messageId: selectedEmail.id,
                  threadId: selectedEmail.threadId,
                  subject: `Re: ${selectedEmail.subject}`,
                  to: selectedEmail.from || ""
                });
                setComposeOpen(true);
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-black/20 border border-border/50 rounded-xl text-sm font-medium hover:bg-black/40 transition-colors shadow-sm"
            >
              <Reply className="w-4 h-4" /> Reply <kbd className="ml-2 opacity-50">r</kbd>
            </button>
            <button 
              onClick={() => {
                setComposeReplyTo({
                  messageId: selectedEmail.id,
                  threadId: selectedEmail.threadId,
                  subject: `Fwd: ${selectedEmail.subject}`,
                  to: ""
                });
                setComposeOpen(true);
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-black/20 border border-border/50 rounded-xl text-sm font-medium hover:bg-black/40 transition-colors shadow-sm"
            >
              <Forward className="w-4 h-4" /> Forward <kbd className="ml-2 opacity-50">f</kbd>
            </button>
          </div>
        </div>
      ) : !selectedEmailId ? (
        <div className="hidden md:flex flex-1 items-center justify-center text-muted-foreground/30">
          <div className="text-center">
            <Mail className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">Select an email to read</p>
            <p className="text-sm mt-1">Or press <kbd>c</kbd> to compose a new one</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

