"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  Wallet,
  Target,
  BarChart3,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: LayoutDashboard },
  { href: "/expenses", label: "Expenses", icon: Receipt },
  { href: "/income", label: "Income", icon: Wallet },
  { href: "/budgets", label: "Budgets", icon: Target },
  { href: "/insights", label: "Insights", icon: BarChart3 },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-bg-secondary/80 backdrop-blur-xl md:hidden">
      <div className="flex items-center justify-around px-2 py-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all duration-200 ${
                isActive
                  ? "text-accent-primary"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <div className="relative">
                {isActive && (
                  <div className="absolute -inset-1.5 rounded-lg bg-accent-primary/10" />
                )}
                <Icon size={20} className="relative" />
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
