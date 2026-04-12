"use client";

import { Sparkles } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export default function Header({ title, subtitle, action }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-4 py-4 md:px-0 md:py-6">
      <div className="flex items-center gap-3">
        {/* Mobile logo (only shows on mobile, sidebar handles desktop) */}
        <div className="md:hidden w-8 h-8 rounded-lg bg-linear-to-br from-accent-primary to-accent-secondary flex items-center justify-center">
          <Sparkles size={14} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-text-secondary mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      {action && <div>{action}</div>}
    </header>
  );
}
