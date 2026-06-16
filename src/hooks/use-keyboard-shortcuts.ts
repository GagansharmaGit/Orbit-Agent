"use client";

import { useEffect, useCallback } from "react";
import { useAppStore } from "@/stores/app-store";
import { useRouter } from "next/navigation";

export function useKeyboardShortcuts() {
  const router = useRouter();
  const {
    setComposeOpen,
    setCommandPaletteOpen,
    setActiveFolder,
    selectedEmailId,
    setSelectedEmailId,
    isComposeOpen,
    isCommandPaletteOpen,
    isSearchFocused,
    setQuickInviteOpen,
  } = useAppStore();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable ||
        isComposeOpen ||
        isSearchFocused
      ) {
        // Only allow Escape and Meta+K in input fields
        if (e.key === "Escape") {
          setComposeOpen(false);
          setCommandPaletteOpen(false);
          setQuickInviteOpen(false);
          (target as HTMLInputElement).blur?.();
          return;
        }
        if ((e.metaKey || e.ctrlKey) && e.key === "k") {
          e.preventDefault();
          setCommandPaletteOpen(true);
          return;
        }
        return;
      }

      // Meta+K — Command palette
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen(!isCommandPaletteOpen);
        return;
      }

      // Escape — Close overlays
      if (e.key === "Escape") {
        setComposeOpen(false);
        setCommandPaletteOpen(false);
        setQuickInviteOpen(false);
        setSelectedEmailId(null);
        return;
      }

      // c — Compose new email
      if (e.key === "c" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setComposeOpen(true);
        return;
      }

      // / — Focus search
      if (e.key === "/" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        const searchInput = document.getElementById("orbit-search-input");
        searchInput?.focus();
        return;
      }

      // i — Quick invite
      if (e.key === "i" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setQuickInviteOpen(true);
        return;
      }

      // Navigation: g then...
      if (e.key === "g") {
        // Set up a listener for the next key
        const nextKeyHandler = (e2: KeyboardEvent) => {
          switch (e2.key) {
            case "i":
              router.push("/mail");
              setActiveFolder("inbox");
              break;
            case "s":
              router.push("/mail");
              setActiveFolder("sent");
              break;
            case "d":
              router.push("/mail");
              setActiveFolder("drafts");
              break;
            case "c":
              router.push("/calendar");
              break;
            case "a":
              router.push("/agent");
              break;
          }
          document.removeEventListener("keydown", nextKeyHandler);
        };
        document.addEventListener("keydown", nextKeyHandler, { once: true });
        setTimeout(() => document.removeEventListener("keydown", nextKeyHandler), 1000);
        return;
      }

      // 1/2/3 — Switch views
      if (e.key === "1") { router.push("/mail"); return; }
      if (e.key === "2") { router.push("/calendar"); return; }
      if (e.key === "3") { router.push("/agent"); return; }
    },
    [
      isComposeOpen,
      isCommandPaletteOpen,
      isSearchFocused,
      setComposeOpen,
      setCommandPaletteOpen,
      setActiveFolder,
      setSelectedEmailId,
      setQuickInviteOpen,
    ]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}
