"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { CATEGORY_CONFIG, CHART_COLORS } from "@/lib/constants";
import { formatCurrency, getMonthRange, getPreviousMonthRange, formatRelative } from "@/lib/utils";
import Header from "@/components/layout/Header";
import Modal from "@/components/ui/Modal";
import ExpenseForm from "@/components/expenses/ExpenseForm";
import IncomeForm from "@/components/income/IncomeForm";
import {
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Plus,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

export default function DashboardPage() {
  const [addType, setAddType] = useState<"expense" | "income" | null>(null);

  const { startDate, endDate } = getMonthRange();
  const { startDate: prevStart, endDate: prevEnd } = getPreviousMonthRange();

  const summary = useQuery(api.insights.getMonthSummary, { startDate, endDate });
  const breakdown = useQuery(api.insights.getCategoryBreakdown, { startDate, endDate });
  const comparison = useQuery(api.insights.getMonthComparison, {
    currentStart: startDate,
    currentEnd: endDate,
    previousStart: prevStart,
    previousEnd: prevEnd,
  });
  const recentExpenses = useQuery(api.expenses.list, { sortBy: "newest", limit: 5 });
  const recentIncome = useQuery(api.income.list, { limit: 3 });
  const quickAdds = useQuery(api.quickAdds.list);
  const budgets = useQuery(api.budgets.getWithSpending, { startDate, endDate });

  const triggerQuickAdd = useMutation(api.quickAdds.useQuickAdd);

  const budgetUsage = useMemo(() => {
    if (!budgets) return 0;
    const totalBudget = budgets.reduce((s, b) => s + b.amount, 0);
    const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);
    return totalBudget > 0 ? Math.min(100, Math.round((totalSpent / totalBudget) * 100)) : 0;
  }, [budgets]);

  return (
    <div className="animate-fade-in">
      <Header
        title="SpendWise"
        subtitle={new Date().toLocaleDateString("en-IN", {
          weekday: "long",
          month: "long",
          day: "numeric",
        })}
      />

      {/* Hero Cash Flow Card */}
      {summary && (
        <div className="mb-6 p-5 rounded-2xl bg-linear-to-br from-accent-primary/20 via-bg-secondary to-accent-secondary/10 border border-accent-primary/20 relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-accent-primary/5" />
          <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-accent-secondary/5" />

          <p className="text-xs text-text-secondary font-medium mb-1 relative">
            Net Cash Flow — This Month
          </p>
          <p
            className={`text-3xl font-bold animate-count-up relative ${
              summary.netCashFlow >= 0 ? "text-accent-success" : "text-accent-danger"
            }`}
          >
            {summary.netCashFlow >= 0 ? "+" : ""}
            {formatCurrency(summary.netCashFlow)}
          </p>

          <div className="grid grid-cols-3 gap-3 mt-4 relative">
            <div>
              <p className="text-[10px] text-text-muted uppercase tracking-wide">Income</p>
              <p className="text-sm font-semibold text-accent-success">
                {formatCurrency(summary.totalIncome)}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-text-muted uppercase tracking-wide">Expenses</p>
              <p className="text-sm font-semibold text-accent-danger">
                {formatCurrency(summary.totalExpenses)}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-text-muted uppercase tracking-wide">Savings</p>
              <p className="text-sm font-semibold text-accent-primary">
                {summary.savingsRate}%
              </p>
            </div>
          </div>

          {/* Month comparison badge */}
          {comparison && comparison.percentageChange !== 0 && (
            <div
              className={`inline-flex items-center gap-1 mt-3 px-2.5 py-1 rounded-lg text-[11px] font-medium ${
                comparison.delta > 0
                  ? "bg-accent-danger/10 text-accent-danger"
                  : "bg-accent-success/10 text-accent-success"
              }`}
            >
              {comparison.delta > 0 ? (
                <ArrowUpRight size={12} />
              ) : (
                <ArrowDownRight size={12} />
              )}
              {Math.abs(comparison.percentageChange)}% vs last month
            </div>
          )}
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="p-4 bg-bg-secondary rounded-xl border border-border hover-lift">
          <div className="w-8 h-8 rounded-lg bg-accent-success/10 flex items-center justify-center mb-2">
            <TrendingUp size={16} className="text-accent-success" />
          </div>
          <p className="text-lg font-bold text-accent-success animate-count-up">
            {formatCurrency(summary?.totalIncome ?? 0)}
          </p>
          <p className="text-[11px] text-text-muted">Total Income</p>
        </div>
        <div className="p-4 bg-bg-secondary rounded-xl border border-border hover-lift">
          <div className="w-8 h-8 rounded-lg bg-accent-danger/10 flex items-center justify-center mb-2">
            <TrendingDown size={16} className="text-accent-danger" />
          </div>
          <p className="text-lg font-bold text-accent-danger animate-count-up">
            {formatCurrency(summary?.totalExpenses ?? 0)}
          </p>
          <p className="text-[11px] text-text-muted">Total Expenses</p>
        </div>
        <div className="p-4 bg-bg-secondary rounded-xl border border-border hover-lift">
          <div className="w-8 h-8 rounded-lg bg-accent-primary/10 flex items-center justify-center mb-2">
            <PiggyBank size={16} className="text-accent-primary" />
          </div>
          <p className="text-lg font-bold text-accent-primary animate-count-up">
            {summary?.savingsRate ?? 0}%
          </p>
          <p className="text-[11px] text-text-muted">Savings Rate</p>
        </div>
        <div className="p-4 bg-bg-secondary rounded-xl border border-border hover-lift">
          <div className="w-8 h-8 rounded-lg bg-accent-warning/10 flex items-center justify-center mb-2">
            <Wallet size={16} className="text-accent-warning" />
          </div>
          <p className="text-lg font-bold text-accent-warning animate-count-up">
            {formatCurrency(summary?.avgDailySpending ?? 0)}
          </p>
          <p className="text-[11px] text-text-muted">Avg Daily Spend</p>
        </div>
      </div>

      {/* Quick Add */}
      {quickAdds && quickAdds.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
            Quick Add
          </h3>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {quickAdds.map((qa) => (
              <button
                key={qa._id}
                onClick={() => triggerQuickAdd({ id: qa._id })}
                className="shrink-0 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-bg-secondary border border-border hover:border-accent-primary/40 transition-all active:scale-95"
              >
                <span className="text-base">{qa.icon}</span>
                <div className="text-left">
                  <p className="text-xs font-medium">{qa.label}</p>
                  <p className="text-[10px] text-text-muted">{formatCurrency(qa.amount)}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Budget Overview + Category Chart side by side on desktop */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {/* Budget Ring */}
        {budgets && budgets.length > 0 && (
          <div className="p-5 bg-bg-secondary rounded-2xl border border-border">
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
              Budget Usage
            </h3>
            <div className="flex items-center gap-4">
              {/* Circular progress */}
              <div className="relative w-20 h-20 shrink-0">
                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="hsl(230, 15%, 20%)"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke={
                      budgetUsage > 90
                        ? "hsl(0, 80%, 60%)"
                        : budgetUsage > 70
                          ? "hsl(40, 90%, 55%)"
                          : "hsl(265, 90%, 65%)"
                    }
                    strokeWidth="3"
                    strokeDasharray={`${budgetUsage}, 100`}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold">{budgetUsage}%</span>
                </div>
              </div>
              <div className="space-y-1">
                {budgets.slice(0, 3).map((b) => {
                  const cat = CATEGORY_CONFIG[b.category];
                  return (
                    <div key={b._id} className="flex items-center gap-2">
                      <span className="text-xs">{cat?.icon ?? "📌"}</span>
                      <div className="flex-1">
                        <div className="h-1.5 bg-bg-primary/40 rounded-full w-20 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              b.percentage > 90
                                ? "bg-accent-danger"
                                : b.percentage > 70
                                  ? "bg-accent-warning"
                                  : "bg-accent-primary"
                            }`}
                            style={{ width: `${Math.min(100, b.percentage)}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-[10px] text-text-muted">{b.percentage}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Category Donut */}
        {breakdown && breakdown.length > 0 && (
          <div className="p-5 bg-bg-secondary rounded-2xl border border-border">
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
              Top Categories
            </h3>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={breakdown.slice(0, 5)}
                      cx="50%"
                      cy="50%"
                      innerRadius={22}
                      outerRadius={38}
                      paddingAngle={3}
                      dataKey="amount"
                      strokeWidth={0}
                    >
                      {breakdown.slice(0, 5).map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1.5 flex-1">
                {breakdown.slice(0, 4).map((item, i) => {
                  const cat = CATEGORY_CONFIG[item.category];
                  return (
                    <div key={item.category} className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: CHART_COLORS[i] }}
                      />
                      <span className="text-[11px] text-text-secondary flex-1 truncate">
                        {cat?.icon} {item.category}
                      </span>
                      <span className="text-[11px] font-medium">
                        {item.percentage}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recent Transactions */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">
            Recent Transactions
          </h3>
          <div className="flex gap-1">
            <button
              onClick={() => setAddType("expense")}
              className="w-7 h-7 rounded-lg bg-accent-danger/10 flex items-center justify-center hover:bg-accent-danger/20 transition-colors"
              title="Add Expense"
            >
              <Plus size={14} className="text-accent-danger" />
            </button>
            <button
              onClick={() => setAddType("income")}
              className="w-7 h-7 rounded-lg bg-accent-success/10 flex items-center justify-center hover:bg-accent-success/20 transition-colors"
              title="Add Income"
            >
              <Plus size={14} className="text-accent-success" />
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {/* Mix recent income + expenses and sort by date */}
          {(() => {
            type TransactionItem = {
              _id: string;
              amount: number;
              date: number;
              itemType: "expense" | "income";
              label: string;
              categoryKey: string;
            };

            const allItems: TransactionItem[] = [
              ...(recentExpenses ?? []).map((e) => ({
                _id: e._id,
                amount: e.amount,
                date: e.date,
                itemType: "expense" as const,
                label: e.note || e.category,
                categoryKey: e.category,
              })),
              ...(recentIncome ?? []).map((i) => ({
                _id: i._id,
                amount: i.amount,
                date: i.date,
                itemType: "income" as const,
                label: i.source,
                categoryKey: i.category ?? "Other",
              })),
            ]
              .sort((a, b) => b.date - a.date)
              .slice(0, 6);

            if (allItems.length === 0) {
              return (
                <div className="text-center py-8">
                  <p className="text-text-muted text-sm">No transactions yet</p>
                </div>
              );
            }

            return allItems.map((item) => {
              const isExpense = item.itemType === "expense";
              const cat = CATEGORY_CONFIG[item.categoryKey] ?? CATEGORY_CONFIG["Other"];

              return (
                <div
                  key={item._id}
                  className="flex items-center gap-3 p-3 bg-bg-secondary rounded-xl border border-border hover:border-border-light transition-all"
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-base shrink-0"
                    style={{ backgroundColor: cat.color + "15" }}
                  >
                    {cat.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {item.label}
                    </p>
                    <p className="text-[11px] text-text-muted">
                      {formatRelative(item.date)}
                    </p>
                  </div>
                  <p
                    className={`text-sm font-semibold ${
                      isExpense ? "text-accent-danger" : "text-accent-success"
                    }`}
                  >
                    {isExpense ? "-" : "+"}
                    {formatCurrency(item.amount)}
                  </p>
                </div>
              );
            });
          })()}
        </div>
      </div>

      <div className="pb-24" />

      {/* Add Modals */}
      <Modal
        isOpen={addType === "expense"}
        onClose={() => setAddType(null)}
        title="Add Expense"
      >
        <ExpenseForm onClose={() => setAddType(null)} />
      </Modal>
      <Modal
        isOpen={addType === "income"}
        onClose={() => setAddType(null)}
        title="Add Income"
      >
        <IncomeForm onClose={() => setAddType(null)} />
      </Modal>
    </div>
  );
}
