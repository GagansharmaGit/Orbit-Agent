import { create } from "zustand";

export type View = "mail" | "calendar" | "agent";
export type MailFolder = "inbox" | "sent" | "drafts" | "trash" | "starred" | "important" | "spam";
export type MailCategory = "primary" | "promotions" | "social" | "updates";

interface AppState {
  // Mail
  activeFolder: MailFolder;
  setActiveFolder: (folder: MailFolder) => void;
  activeCategory: MailCategory;
  setActiveCategory: (category: MailCategory) => void;
  selectedEmailId: string | null;
  setSelectedEmailId: (id: string | null) => void;
  isComposeOpen: boolean;
  setComposeOpen: (open: boolean) => void;
  composeReplyTo: { messageId: string; threadId: string; subject: string; to: string } | null;
  setComposeReplyTo: (data: { messageId: string; threadId: string; subject: string; to: string } | null) => void;

  // Calendar
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  isEventCreateOpen: boolean;
  setEventCreateOpen: (open: boolean) => void;
  isQuickInviteOpen: boolean;
  setQuickInviteOpen: (open: boolean) => void;

  // Command palette
  isCommandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSearchFocused: boolean;
  setSearchFocused: (focused: boolean) => void;

  // Sidebar
  isSidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  isMobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Mail
  activeFolder: "inbox",
  setActiveFolder: (folder) => set({ activeFolder: folder }),
  activeCategory: "primary",
  setActiveCategory: (category) => set({ activeCategory: category }),
  selectedEmailId: null,
  setSelectedEmailId: (id) => set({ selectedEmailId: id }),
  isComposeOpen: false,
  setComposeOpen: (open) => set({ isComposeOpen: open }),
  composeReplyTo: null,
  setComposeReplyTo: (data) => set({ composeReplyTo: data }),

  // Calendar
  selectedDate: new Date(),
  setSelectedDate: (date) => set({ selectedDate: date }),
  isEventCreateOpen: false,
  setEventCreateOpen: (open) => set({ isEventCreateOpen: open }),
  isQuickInviteOpen: false,
  setQuickInviteOpen: (open) => set({ isQuickInviteOpen: open }),

  // Command palette
  isCommandPaletteOpen: false,
  setCommandPaletteOpen: (open) => set({ isCommandPaletteOpen: open }),

  // Search
  searchQuery: "",
  setSearchQuery: (query) => set({ searchQuery: query }),
  isSearchFocused: false,
  setSearchFocused: (focused) => set({ isSearchFocused: focused }),

  // Sidebar
  isSidebarCollapsed: false,
  setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),
  isMobileSidebarOpen: false,
  setMobileSidebarOpen: (open) => set({ isMobileSidebarOpen: open }),
}));
