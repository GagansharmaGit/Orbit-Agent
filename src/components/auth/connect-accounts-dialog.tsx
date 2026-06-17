"use client";

import { useState, useEffect } from "react";
import { ArrowRight, Mail, Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { connectGmail, connectGoogleCalendar } from "@/app/actions/connect-actions";

export function ConnectAccountsDialog({ 
  open, 
  onOpenChange 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void 
}) {
  const [isConnectingGmail, setIsConnectingGmail] = useState(false);
  const [isConnectingCalendar, setIsConnectingCalendar] = useState(false);

  const handleConnectGmail = async () => {
    setIsConnectingGmail(true);
    try {
      const url = await connectGmail();
      if (url) window.location.href = url;
    } catch (e) {
      console.error(e);
      setIsConnectingGmail(false);
    }
  };

  const handleConnectCalendar = async () => {
    setIsConnectingCalendar(true);
    try {
      const url = await connectGoogleCalendar();
      if (url) window.location.href = url;
    } catch (e) {
      console.error(e);
      setIsConnectingCalendar(false);
    }
  };

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => onOpenChange(false)}>
      <div 
        className="w-full max-w-[425px] p-6 bg-[#111111] border border-[#222] rounded-xl shadow-2xl text-white transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-2 mb-6">
          <h2 className="text-2xl font-bold tracking-tight">Connect your accounts</h2>
          <p className="text-muted-foreground text-sm leading-relaxed text-[#888]">
            Orbit uses Corsair to securely access your Gmail and Calendar. Your credentials are stored encrypted and never leave your control.
          </p>
        </div>

        <div className="flex flex-col gap-3 pb-6 border-b border-[#222]">
          <button
            onClick={handleConnectGmail}
            disabled={isConnectingGmail}
            className="flex items-center justify-center gap-2 w-full py-3.5 px-4 bg-[#F59E0B] hover:bg-[#D97706] text-black font-medium rounded-lg transition-colors disabled:opacity-70"
          >
            {isConnectingGmail ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mail className="w-5 h-5" />}
            Connect Gmail <ArrowRight className="w-4 h-4 ml-1" />
          </button>

          <button
            onClick={handleConnectCalendar}
            disabled={isConnectingCalendar}
            className="flex items-center justify-center gap-2 w-full py-3.5 px-4 bg-[#1A1A1A] hover:bg-[#2A2A2A] text-white font-medium rounded-lg border border-[#333] transition-colors disabled:opacity-70"
          >
            {isConnectingCalendar ? <Loader2 className="w-5 h-5 animate-spin" /> : <CalendarIcon className="w-5 h-5" />}
            Connect Google Calendar <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>

        <p className="mt-6 text-center text-xs text-[#666]">
          You'll be redirected to a secure Google OAuth page to authorize access.
        </p>
      </div>
    </div>
  );
}
