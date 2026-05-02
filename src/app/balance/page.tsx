"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id, Doc } from "../../../convex/_generated/dataModel";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Plus, Trash2, Edit3, Landmark, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import Modal from "@/components/ui/Modal";
import BankBalanceForm from "@/components/balance/BankBalanceForm";
import Header from "@/components/layout/Header";

export default function BalancePage() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingId, setEditingId] = useState<Id<"bankBalance"> | null>(null);

  const balanceInfo = useQuery(api.bankBalance.getCurrentBalance);
  const history = useQuery(api.bankBalance.list);
  const removeBalance = useMutation(api.bankBalance.remove);

  const editingEntry = useMemo(() => {
    if (!editingId || !history) return null;
    return history.find((h: Doc<"bankBalance">) => h._id === editingId) ?? null;
  }, [editingId, history]);

  return (
    <div className="animate-fade-in">
      <Header
        title="Bank Balance"
        subtitle="Manage your actual bank funds"
        action={
          <button
            onClick={() => setIsAddOpen(true)}
            className="w-10 h-10 rounded-xl bg-accent-primary text-white flex items-center justify-center hover:brightness-110 transition-all active:scale-95"
          >
            <Plus size={20} />
          </button>
        }
      />

      {/* Hero Balance Card */}
      <div className="mb-8 p-6 rounded-2xl bg-linear-to-br from-accent-primary via-accent-primary/80 to-accent-secondary border border-accent-primary/20 text-white relative overflow-hidden shadow-lg shadow-accent-primary/20">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Landmark size={80} />
        </div>
        
        <p className="text-xs font-medium uppercase tracking-wider opacity-80 mb-1">Live Bank Balance</p>
        <h2 className="text-4xl font-bold mb-4 tabular-nums">
          {balanceInfo ? formatCurrency(balanceInfo.currentBalance) : "₹0"}
        </h2>

        {balanceInfo?.lastEntry && (
          <div className="flex flex-wrap gap-4 pt-4 border-t border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <Landmark size={14} />
              </div>
              <div>
                <p className="text-[10px] opacity-70 uppercase">Opening</p>
                <p className="text-xs font-semibold">{formatCurrency(balanceInfo.lastEntry.amount)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-accent-success/20 flex items-center justify-center">
                <ArrowUpCircle size={14} className="text-accent-success" />
              </div>
              <div>
                <p className="text-[10px] opacity-70 uppercase">Income (+)</p>
                <p className="text-xs font-semibold">+{formatCurrency(balanceInfo.incomeSince)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-accent-danger/20 flex items-center justify-center">
                <ArrowDownCircle size={14} className="text-accent-danger" />
              </div>
              <div>
                <p className="text-[10px] opacity-70 uppercase">Expenses (-)</p>
                <p className="text-xs font-semibold">-{formatCurrency(balanceInfo.expensesSince)}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* History */}
      <div className="space-y-4 pb-24">
        <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider px-1">
          Balance History
        </h3>

        {!history ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-16 bg-bg-secondary rounded-xl animate-pulse" />
            ))}
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-16 bg-bg-secondary rounded-2xl border border-dashed border-border">
            <div className="text-4xl mb-3">🏦</div>
            <p className="text-text-secondary text-sm">
              No balance entries found.
            </p>
            <button
              onClick={() => setIsAddOpen(true)}
              className="mt-4 text-xs font-semibold text-accent-primary hover:underline"
            >
              Add your first balance entry
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {history.map((entry: Doc<"bankBalance">) => (
              <div
                key={entry._id}
                className="flex items-center gap-3 p-4 bg-bg-secondary rounded-xl border border-border hover:border-border-light transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-accent-primary/10 flex items-center justify-center text-accent-primary shrink-0">
                  <Landmark size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">
                    {formatCurrency(entry.amount)}
                  </p>
                  <p className="text-xs text-text-muted">
                    {entry.note || "Opening Balance"} • {formatDate(entry.date)}
                  </p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setEditingId(entry._id)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-bg-tertiary text-text-muted hover:text-text-primary transition-colors"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    onClick={() => removeBalance({ id: entry._id })}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent-danger/10 text-text-muted hover:text-accent-danger transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="New Balance Entry">
        <BankBalanceForm onClose={() => setIsAddOpen(false)} />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingId}
        onClose={() => setEditingId(null)}
        title="Edit Balance Entry"
      >
        {editingEntry && (
          <BankBalanceForm
            onClose={() => setEditingId(null)}
            initialData={{
              id: editingEntry._id,
              amount: editingEntry.amount,
              date: editingEntry.date,
              note: editingEntry.note,
            }}
          />
        )}
      </Modal>
    </div>
  );
}
