"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { CATEGORY_CONFIG, EXPENSE_CATEGORIES } from "@/lib/constants";
import { formatCurrency, getMonthRange } from "@/lib/utils";
import { Plus, Trash2, AlertTriangle } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Header from "@/components/layout/Header";

export default function BudgetsPage() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const { startDate, endDate } = getMonthRange();

  const budgets = useQuery(api.budgets.getWithSpending, { startDate, endDate });
  const removeBudget = useMutation(api.budgets.remove);

  const totalBudget = budgets?.reduce((s, b) => s + b.amount, 0) ?? 0;
  const totalSpent = budgets?.reduce((s, b) => s + b.spent, 0) ?? 0;
  const overallPercentage = totalBudget > 0 ? Math.min(100, Math.round((totalSpent / totalBudget) * 100)) : 0;

  return (
    <div className="animate-fade-in">
      <Header
        title="Budgets"
        subtitle={new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
        action={
          <button
            onClick={() => setIsAddOpen(true)}
            className="w-10 h-10 rounded-xl bg-accent-primary text-white flex items-center justify-center hover:brightness-110 transition-all active:scale-95"
          >
            <Plus size={20} />
          </button>
        }
      />

      {/* Overall Budget Card */}
      <div className="mb-6 p-5 rounded-2xl bg-linear-to-br from-accent-primary/20 to-accent-secondary/10 border border-accent-primary/20">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-text-secondary font-medium">Total Budget</p>
            <p className="text-2xl font-bold">{formatCurrency(totalBudget)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-text-secondary font-medium">Spent</p>
            <p className={`text-2xl font-bold ${totalSpent > totalBudget ? "text-accent-danger" : "text-accent-primary"}`}>
              {formatCurrency(totalSpent)}
            </p>
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-3 bg-bg-primary/40 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ease-out animate-fill-bar ${
              overallPercentage > 90
                ? "bg-accent-danger"
                : overallPercentage > 70
                  ? "bg-accent-warning"
                  : "bg-accent-primary"
            }`}
            style={{ width: `${overallPercentage}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-text-muted">{overallPercentage}% used</p>
          <p className="text-xs text-text-muted">
            {formatCurrency(Math.max(0, totalBudget - totalSpent))} remaining
          </p>
        </div>
      </div>

      {/* Budget Cards */}
      <div className="space-y-3 pb-24">
        {!budgets ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-bg-secondary rounded-xl animate-pulse" />
            ))}
          </div>
        ) : budgets.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">🎯</div>
            <p className="text-text-secondary text-sm">
              No budgets set. Create your first budget!
            </p>
          </div>
        ) : (
          budgets.map((budget) => {
            const cat = CATEGORY_CONFIG[budget.category] ?? CATEGORY_CONFIG["Other"];
            const isOverBudget = budget.spent > budget.amount;
            return (
              <div
                key={budget._id}
                className={`p-4 bg-bg-secondary rounded-xl border transition-all hover-lift group ${
                  isOverBudget
                    ? "border-accent-danger/40 animate-shake"
                    : "border-border"
                }`}
                style={isOverBudget ? { boxShadow: "var(--shadow-glow-red)" } : undefined}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                      style={{ backgroundColor: cat.color + "15" }}
                    >
                      {cat.icon}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{budget.category}</p>
                      <p className="text-xs text-text-muted">
                        {formatCurrency(budget.spent)} of {formatCurrency(budget.amount)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isOverBudget && (
                      <AlertTriangle size={16} className="text-accent-danger" />
                    )}
                    <span
                      className={`text-sm font-semibold ${
                        isOverBudget
                          ? "text-accent-danger"
                          : budget.percentage > 70
                            ? "text-accent-warning"
                            : "text-accent-success"
                      }`}
                    >
                      {budget.percentage}%
                    </span>
                    <button
                      onClick={() => removeBudget({ id: budget._id })}
                      className="w-7 h-7 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 hover:bg-accent-danger/10 text-text-muted hover:text-accent-danger transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="h-2 bg-bg-primary/40 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ease-out animate-fill-bar ${
                      isOverBudget
                        ? "bg-accent-danger"
                        : budget.percentage > 70
                          ? "bg-accent-warning"
                          : "bg-accent-success"
                    }`}
                    style={{ width: `${Math.min(100, budget.percentage)}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1.5">
                  <p className="text-[10px] text-text-muted">
                    {isOverBudget
                      ? `Over by ${formatCurrency(budget.spent - budget.amount)}`
                      : `${formatCurrency(budget.remaining)} left`}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Budget Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add Budget">
        <BudgetForm onClose={() => setIsAddOpen(false)} />
      </Modal>
    </div>
  );
}

function BudgetForm({ onClose }: { onClose: () => void }) {
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const addBudget = useMutation(api.budgets.add);
  const { startDate, endDate } = getMonthRange();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !amount) return;

    setLoading(true);
    try {
      await addBudget({
        category,
        amount: parseFloat(amount),
        period: "monthly",
        startDate,
        endDate,
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-xs font-medium text-text-secondary mb-2">
          Budget Amount (₹)
        </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0"
          className="w-full text-3xl font-bold bg-transparent border-b-2 border-border focus:border-accent-primary pb-2 outline-none transition-colors placeholder:text-text-muted/30"
          autoFocus
          required
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-text-secondary mb-2">
          Category
        </label>
        <div className="grid grid-cols-3 gap-2">
          {EXPENSE_CATEGORIES.map((cat) => {
            const config = CATEGORY_CONFIG[cat] ?? CATEGORY_CONFIG["Other"];
            const isSelected = category === cat;
            return (
              <button
                type="button"
                key={cat}
                onClick={() => setCategory(cat)}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all ${
                  isSelected
                    ? "border-accent-primary bg-accent-primary/10"
                    : "border-border bg-bg-tertiary hover:border-border-light"
                }`}
              >
                <span className="text-xl">{config.icon}</span>
                <span className="text-[11px] font-medium text-center leading-tight">
                  {cat}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <button
        type="submit"
        disabled={!category || !amount || loading}
        className="w-full py-3 rounded-xl bg-accent-primary text-white font-semibold text-sm hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
      >
        {loading ? "Creating..." : "Create Budget"}
      </button>
    </form>
  );
}
