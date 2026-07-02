import { useState } from "react";
import { Plus, Trash2, TrendingDown, TrendingUp } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const EXPENSE_CATEGORIES = [
  { value: "cell_phone", label: "Cell Phone" },
  { value: "leads", label: "Leads" },
  { value: "crm", label: "CRM" },
  { value: "wavv_dialer", label: "WAVV Dialer" },
  { value: "miscellaneous", label: "Miscellaneous" },
];

interface AgentExpenseTrackerProps {
  month: number;
  year: number;
  monthlyCommission: number;
}

export function AgentExpenseTracker({ month, year, monthlyCommission }: AgentExpenseTrackerProps) {
  const [showForm, setShowForm] = useState(false);
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const utils = trpc.useUtils();

  const { data: expenses = [] } = trpc.agent.listExpensesByMonth.useQuery({ month, year });
  const { data: totalExpenses = 0 } = trpc.agent.totalExpensesByMonth.useQuery({ month, year });

  const createMutation = trpc.agent.createExpense.useMutation({
    onSuccess: () => {
      toast.success("Expense added!");
      utils.agent.listExpensesByMonth.invalidate({ month, year });
      utils.agent.totalExpensesByMonth.invalidate({ month, year });
      resetForm();
      setShowForm(false);
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = trpc.agent.deleteExpense.useMutation({
    onSuccess: () => {
      toast.success("Expense deleted.");
      utils.agent.listExpensesByMonth.invalidate({ month, year });
      utils.agent.totalExpensesByMonth.invalidate({ month, year });
    },
    onError: (err) => toast.error(err.message),
  });

  function resetForm() {
    setCategory("");
    setAmount("");
    setDescription("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!category || !amount) {
      toast.error("Category and amount are required");
      return;
    }
    createMutation.mutate({
      category: category as any,
      amount: parseFloat(amount),
      description: description || undefined,
      expenseMonth: month,
      expenseYear: year,
    });
  }

  const netRevenue = monthlyCommission - totalExpenses;

  return (
    <div className="space-y-5">
      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Total Expenses KPI */}
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="w-4 h-4 text-red-400" />
            <p className="text-xs text-red-400 uppercase tracking-wider font-semibold">
              Total Monthly Expenses
            </p>
          </div>
          <p className="text-2xl font-bold text-red-400">
            ${totalExpenses.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        {/* Net Revenue KPI */}
        <div className={`border rounded-xl p-4 ${netRevenue >= 0 ? "bg-emerald-500/10 border-emerald-500/30" : "bg-orange-500/10 border-orange-500/30"}`}>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className={`w-4 h-4 ${netRevenue >= 0 ? "text-emerald-400" : "text-orange-400"}`} />
            <p className={`text-xs uppercase tracking-wider font-semibold ${netRevenue >= 0 ? "text-emerald-400" : "text-orange-400"}`}>
              Net Revenue (Commission − Expenses)
            </p>
          </div>
          <p className={`text-2xl font-bold ${netRevenue >= 0 ? "text-emerald-400" : "text-orange-400"}`}>
            ${netRevenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            ${monthlyCommission.toLocaleString("en-US", { minimumFractionDigits: 2 })} commission − ${totalExpenses.toLocaleString("en-US", { minimumFractionDigits: 2 })} expenses
          </p>
        </div>
      </div>

      {/* Expense List Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-white">Monthly Expenses</h3>
        <button
          onClick={() => { resetForm(); setShowForm(!showForm); }}
          className="flex items-center gap-2 bg-[#c9a84c] text-black px-3 py-2 rounded-lg font-semibold text-sm hover:bg-[#d4af37] transition"
        >
          {showForm ? "Cancel" : <><Plus size={16} /> Add Expense</>}
        </button>
      </div>

      {/* Add Expense Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider block mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:border-[#c9a84c] focus:outline-none"
                required
              >
                <option value="" className="bg-slate-800">Select category...</option>
                {EXPENSE_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value} className="bg-slate-800">
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider block mb-1">
                Amount ($) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:border-[#c9a84c] focus:outline-none"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-gray-400 uppercase tracking-wider block mb-1">
                Description (Optional)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Monthly subscription"
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:border-[#c9a84c] focus:outline-none"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="w-full bg-emerald-600 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-emerald-700 transition disabled:opacity-50"
          >
            {createMutation.isPending ? "Saving..." : "Add Expense"}
          </button>
        </form>
      )}

      {/* Expense List */}
      {expenses.length > 0 ? (
        <div className="space-y-2">
          {expenses.map((expense: any) => (
            <div
              key={expense.id}
              className="bg-white/5 border border-white/10 rounded-lg p-3 flex items-center justify-between"
            >
              <div className="flex-1">
                <p className="text-white font-medium text-sm">
                  {EXPENSE_CATEGORIES.find((c) => c.value === expense.category)?.label ?? expense.category}
                </p>
                {expense.description && (
                  <p className="text-xs text-gray-400 mt-0.5">{expense.description}</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <p className="text-red-400 font-semibold text-sm">
                  −${parseFloat(expense.amount).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
                <button
                  onClick={() => deleteMutation.mutate({ id: expense.id })}
                  disabled={deleteMutation.isPending}
                  className="text-red-400 hover:text-red-300 transition disabled:opacity-40"
                  title="Delete expense"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400 text-sm">No expenses logged for this month yet.</p>
      )}
    </div>
  );
}
