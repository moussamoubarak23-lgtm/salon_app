import React from "react";

interface MockupProps {
  children: React.ReactNode;
}

import { Globe, RotateCcw, ShieldCheck } from "lucide-react";

interface MockupProps {
  children: React.ReactNode;
}

export function PhoneFrame({ children }: MockupProps) {
  return (
    <div className="relative mx-auto bg-[#1a1a1a] p-3 rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.6)] border border-white/5 w-[364px] flex-shrink-0">
      {/* Browser Shell (Mobile) */}
      <div className="bg-[#f3f4f6] dark:bg-[#080c14] rounded-[2.2rem] overflow-hidden w-full h-[720px] flex flex-col border border-white/10">
        {/* Status Bar Sim */}
        <div className="h-10 px-6 flex items-center justify-between text-[11px] font-bold text-foreground/40">
          <span>9:41</span>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-2 border border-current rounded-[2px]" />
            <div className="w-3 h-3 bg-current rounded-full opacity-20" />
          </div>
        </div>

        {/* URL Bar Sim */}
        <div className="px-3 pb-3">
          <div className="bg-muted/50 rounded-xl h-10 flex items-center px-4 gap-3 border border-border/40">
            <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
            <span className="text-[11px] font-medium text-foreground/50 flex-1 truncate">zara-beaute.com</span>
            <RotateCcw className="w-3.5 h-3.5 text-foreground/30" />
          </div>
        </div>

        {/* Site Content */}
        <div className="flex-1 overflow-y-auto scrollbar-none bg-background">
          {children}
        </div>

        {/* Browser Bottom Bar */}
        <div className="h-14 bg-muted/30 border-t border-border/40 flex items-center justify-around px-4">
           <div className="w-5 h-5 border-2 border-foreground/10 rounded-sm" />
           <Globe className="w-5 h-5 text-foreground/10" />
           <div className="w-5 h-5 border-2 border-foreground/10 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function LaptopFrame({ children }: MockupProps) {
  return (
    <div className="relative mx-auto w-[1100px] flex-shrink-0 group">
      {/* Screen Part */}
      <div className="relative border-[#1a1a1a] bg-[#1a1a1a] border-[8px] rounded-t-2xl overflow-hidden shadow-2xl h-[580px]">
        {/* Browser Tabs/URL bar */}
        <div className="h-10 bg-muted/50 border-b border-border/40 flex items-center px-4 gap-4">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400/50" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400/50" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-400/50" />
          </div>
          <div className="bg-background/50 rounded-md h-6 px-4 flex items-center gap-2 border border-border/20 flex-1 max-w-sm">
            <ShieldCheck className="w-3 h-3 text-green-500" />
            <span className="text-[10px] text-foreground/40 font-medium">https://zara-beaute.com</span>
          </div>
        </div>

        <div className="flex-1 w-full h-[calc(100%-40px)] bg-white dark:bg-[#04080f] overflow-y-auto scrollbar-none">
          {children}
        </div>
      </div>

      {/* Base Part */}
      <div className="relative h-[22px] bg-[#121212] rounded-b-2xl w-[calc(100%+80px)] -left-[40px] border-t border-white/5 shadow-2xl">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 rounded-b-2xl w-[100px] h-[8px] bg-[#080808]" />
      </div>
    </div>
  );
}
