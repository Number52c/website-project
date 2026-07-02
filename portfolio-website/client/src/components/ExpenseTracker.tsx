import { useState } from "react";
import { Plus, Trash2, CreditCard as Edit2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const EXPENSE_CATEGORIES = [
  { value: "cell_phone", label: "Cell Phone" },
  { value: "leads", label: "Leads" },
  { value: "crm", label: "CRM" },
  { value: "wavv_dialer", label: "WAVV Dialer" },
  { value: "miscellaneous", label: "Miscellaneous" },
];

interface ExpenseTrackerProps {
  month: number;
  year: number;
}

export function ExpenseTracker({ month, year }: ExpenseTrackerProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const utils = trpc.useUtils();

  const { data: expenses = [] } = trpc.admin.listExpensesByMonth.useQuery({
    month,
    year,
  });

  const { data: totalExpenses = 0 } = trpc.admin.getTotalExpensesByMonth.useQuery({
    month,
    year,
  });

  const createMutation = trpc.admin.createExpense.useMutation({
    onSuccess: () => {
      toast.success("Expense added!");
      utils.admin.listExpensesByMonth.invalidate({ month, year });
      utils.admin.getTotalExpensesByMonth.invalidate({ month, year });
      resetForm();
      setShowForm(false);
    },
    onError: (err) => toast.error(err.message),
  });

  const updateMutation = trpc.admin.updateExpense.useMutation({
    onSuccess: () => {
      toast.success("Expense updated!");
      utils.admin.listExpensesByMonth.invalidate({ month, year });
      utils.admin.getTotalExpensesByMonth.invalidate({ month, year });
      resetForm();
      setEditingId(null);
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = trpc.admin.deleteExpense.useMutation({
    onSuccess: () => {
      toast.success("Expense deleted!");
      utils.admin.listExpensesByMonth.invalidate({ month, year });
      utils.admin.getTotalExpensesByMonth.invalidate({ month, year });
    },
    onError: (err) => toast.error(err.message),
  });

  function resetForm() {
    setCategory("");
    setAmount("");
    setDescription("");
    setEditingId(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!category || !amount) {
      toast.error("Category and amount are required");
      return;
    }

    if (editingId !== null) {
      updateMutation.mutate({
        id: editingId,
        category: category as any,
        amount: parseFloat(amount),
        description: description || undefined,
      });
    } else {
      createMutation.mutate({
        category: category as any,
        amount: parseFloat(amount),
        description: description || undefined,
        expenseMonth: month,
        expenseYear: year,
      });
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Monthly Expenses</h3>
        <button
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
          className="flex items-center gap-2 bg-[#c9a84c] text-black px-3 py-2 rounded-lg font-semibold text-sm hover:bg-[#d4af37] transition"
        >
          {showForm ? "Cancel" : <Plus size={16} />}
          {showForm ? "Cancel" : "Add Expense"}
        </button>
      </div>

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
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                required
              >
                <option value="" className="bg-[#0a1628]">
                  Select category...
                </option>
                {EXPENSE_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value} className="bg-[#0a1628]">
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider block mb-1">
                Amount *
              </label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
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
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-emerald-600 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-emerald-700 transition"
          >
            {editingId !== null ? "Update Expense" : "Add Expense"}
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
                <p className="text-white font-medium">
                  {EXPENSE_CATEGORIES.find((c) => c.value === expense.category)?.label}
                </p>
                {expense.description && (
                  <p className="text-xs text-gray-400">{expense.description}</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <p className="text-[#c9a84c] font-semibold">
                  ${parseFloat(expense.amount).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
                <button
                  onClick={() => deleteMutation.mutate({ id: expense.id })}
                  className="text-red-400 hover:text-red-300 transition"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400 text-sm">No expenses added yet</p>
      )}

      {/* Total Expenses KPI */}
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mt-4">
        <p className="text-xs text-red-400 uppercase tracking-wider mb-1">
          Total Monthly Expenses
        </p>
        <p className="text-2xl font-bold text-red-400">
          $
          {totalExpenses.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>
      </div>
    </div>
  );
}
