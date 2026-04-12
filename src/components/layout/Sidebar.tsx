"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  Wallet,
  Target,
  BarChart3,
  Sparkles,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/expenses", label: "Expenses", icon: Receipt },
  { href: "/income", label: "Income", icon: Wallet },
  { href: "/budgets", label: "Budgets", icon: Target },
  { href: "/insights", label: "Insights", icon: BarChart3 },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 bg-bg-secondary border-r border-border">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-border">
        <div className="w-9 h-9 rounded-xl bg-linear-to-br from-accent-primary to-accent-secondary flex items-center justify-center">
          <Sparkles size={18} className="text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight gradient-text">
            SpendWise
          </h1>
          <p className="text-[10px] text-text-muted font-medium uppercase tracking-widest">
            Finance Tracker
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive
                  ? "bg-accent-primary/10 text-accent-primary"
                  : "text-text-secondary hover:bg-bg-tertiary hover:text-text-primary"
              }`}
            >
              <Icon
                size={20}
                className={`transition-transform duration-200 ${
                  isActive ? "scale-110" : "group-hover:scale-105"
                }`}
              />
              <span className="font-medium text-sm">{item.label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-accent-primary" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-border">
        <div className="glass-card px-4 py-3">
          <p className="text-xs text-text-secondary">
            Track smarter. Save better.
          </p>
        </div>
      </div>
    </aside>
  );
}
