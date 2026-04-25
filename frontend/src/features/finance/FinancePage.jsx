import { useEffect, useMemo, useState } from "react";
import jsPDF from "jspdf";
import { Landmark, Receipt, Wallet } from "lucide-react";
import { Link } from "react-router-dom";
import { useAsync } from "../../hooks/useAsync";
import { usePersistentState } from "../../hooks/usePersistentState";
import { api } from "../../lib/api";
import { USER_ID } from "../../lib/constants";
import { currency, emitDataRefresh, monthKey, shortDate, todayKey } from "../../lib/utils";
import { Button } from "../../components/ui/Button";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { AppCard, SectionHeader, TransactionItem } from "../../ui/fintech";

export function FinancePage({ profile }) {
  const categories = profile?.categories || [];
  const [month] = useState(monthKey());
  const [status, setStatus] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = usePersistentState("fintrack-expense-draft", {
    amount: "",
    categoryName: categories[0]?.name || "",
    paymentMethod: "UPI",
    date: todayKey(),
    note: "",
    isRecurring: false,
  });

  const { data: expenses, setData, execute } = useAsync(() => api.getExpenses(USER_ID, month), [month], {
    initialData: [],
  });

  useEffect(() => {
    if (!form.categoryName && categories[0]?.name) {
      setForm((current) => ({ ...current, categoryName: categories[0].name }));
    }
  }, [categories, form.categoryName, setForm]);

  useEffect(() => {
    const handleRefresh = () => {
      execute().catch(() => undefined);
    };
    window.addEventListener("fintrack:data-updated", handleRefresh);
    return () => window.removeEventListener("fintrack:data-updated", handleRefresh);
  }, [execute]);

  const totals = useMemo(() => {
    const map = new Map();
    (expenses || []).forEach((entry) => {
      map.set(entry.categoryName, (map.get(entry.categoryName) || 0) + entry.amount);
    });
    return categories.map((category) => ({
      ...category,
      spent: map.get(category.name) || 0,
    }));
  }, [expenses, categories]);

  const totalSpent = useMemo(
    () => (expenses || []).reduce((sum, entry) => sum + Number(entry.amount || 0), 0),
    [expenses],
  );

  const submit = async (event) => {
    event.preventDefault();
    setStatus("");
    if (!form.amount || Number(form.amount) <= 0) {
      setStatus("Enter an amount greater than zero.");
      return;
    }
    if (!form.categoryName) {
      setStatus("Add at least one category in Profile before saving an expense.");
      return;
    }
    setIsSaving(true);

    try {
      const created = await api.addExpense({
        userId: USER_ID,
        amount: Number(form.amount),
        categoryName: form.categoryName,
        paymentMethod: form.paymentMethod,
        date: form.date,
        note: form.note,
        isRecurring: form.isRecurring,
      });

      setData([created, ...(expenses || [])]);
      setForm((current) => ({ ...current, amount: "", note: "", isRecurring: false }));
      setStatus("Expense saved.");
      emitDataRefresh();
    } catch (error) {
      setStatus(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const exportPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("FinTrack Expense Report", 16, 18);
    doc.setFontSize(11);
    (expenses || []).slice(0, 18).forEach((entry, index) => {
      doc.text(
        `${entry.date} | ${entry.categoryName} | ${entry.paymentMethod} | INR ${entry.amount}`,
        16,
        32 + index * 8,
      );
    });
    doc.save("fintrack-expenses.pdf");
  };

  return (
    <div className="page-shell">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-500">Finance</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Stay sharp on spending</h1>
          <p className="mt-2 text-sm text-slate-500">
            A cleaner expense entry flow, budget progress, and your latest transactions in one place.
          </p>
        </div>
        <Button onClick={exportPdf}>Export PDF</Button>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <AppCard>
          <SectionHeader
            eyebrow="New Expense"
            title="Invoice-style entry"
            description="Fill the details below without changing any of the expense logic."
            actions={<Receipt className="h-5 w-5 text-sky-500" />}
          />
          <form className="mt-5 space-y-5" onSubmit={submit}>
            <div className="space-y-4 rounded-[26px] border border-slate-100 bg-slate-50/80 p-4">
              <div>
                <label className="label">Amount</label>
                <input
                  className="text-input"
                  type="number"
                  value={form.amount}
                  onChange={(event) => setForm({ ...form, amount: event.target.value })}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="label">Category</label>
                <select
                  className="select-input"
                  value={form.categoryName}
                  onChange={(event) => setForm({ ...form, categoryName: event.target.value })}
                >
                  {categories.map((category) => (
                    <option key={category.name} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-4 rounded-[26px] border border-slate-100 bg-white p-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="label">Payment Method</label>
                  <select
                    className="select-input"
                    value={form.paymentMethod}
                    onChange={(event) => setForm({ ...form, paymentMethod: event.target.value })}
                  >
                    <option value="UPI">UPI</option>
                    <option value="CASH">Cash</option>
                    <option value="CARD">Card</option>
                  </select>
                </div>
                <div>
                  <label className="label">Date</label>
                  <input
                    className="text-input"
                    type="date"
                    value={form.date}
                    onChange={(event) => setForm({ ...form, date: event.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="label">Note</label>
                <textarea
                  className="textarea-input"
                  rows="3"
                  value={form.note}
                  onChange={(event) => setForm({ ...form, note: event.target.value })}
                  placeholder="Groceries, coffee run, subscriptions..."
                />
              </div>
              <label className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                <input
                  type="checkbox"
                  checked={form.isRecurring}
                  onChange={(event) => setForm({ ...form, isRecurring: event.target.checked })}
                />
                Mark as recurring
              </label>
            </div>

            <div className="rounded-[26px] border border-slate-100 bg-slate-900 p-4 text-white">
              <div className="flex items-center justify-between text-sm text-slate-300">
                <span>Total</span>
                <span className="text-xl font-bold text-white">{currency(Number(form.amount || 0))}</span>
              </div>
            </div>

            <Button className="w-full" type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Expense"}
            </Button>
            {status ? <p className="text-sm text-sky-600">{status}</p> : null}
          </form>
        </AppCard>

        <div className="space-y-4">
          <AppCard>
            <SectionHeader
              eyebrow="Month Snapshot"
              title="Category breakdown"
              description={`${currency(totalSpent)} tracked so far this month.`}
              actions={<Landmark className="h-5 w-5 text-sky-500" />}
            />
            <div className="mt-5 space-y-4">
              {!categories.length ? (
                <p className="text-sm text-slate-500">
                  Add a category in <Link to="/profile" className="font-semibold text-sky-600 dark:text-sky-400">Profile</Link> to start logging expenses.
                </p>
              ) : null}
              {totals.map((category) => (
                <div key={category.name}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-medium text-slate-700">{category.name}</span>
                    <span className="text-sm text-slate-500">
                      {currency(category.spent)} / {currency(category.budget)}
                    </span>
                  </div>
                  <ProgressBar value={category.spent} total={category.budget} />
                </div>
              ))}
            </div>
          </AppCard>

          <AppCard>
            <SectionHeader
              eyebrow="Transactions"
              title="Recent expenses"
              description="Your latest entries with cleaner visual hierarchy."
              actions={<Wallet className="h-5 w-5 text-sky-500" />}
            />
            <div className="mt-5 space-y-3">
              {expenses?.length ? expenses.slice(0, 7).map((entry) => (
                <TransactionItem
                  key={entry.id}
                  title={entry.categoryName}
                  subtitle={`${shortDate(entry.date)} • ${entry.paymentMethod}`}
                  amount={entry.amount}
                  icon={entry.paymentMethod === "CARD" ? "bank" : entry.isRecurring ? "recurring" : "wallet"}
                  rightDetail={entry.note || "No note"}
                />
              )) : (
                <p className="text-sm text-slate-500">Log an expense to see your transaction feed.</p>
              )}
            </div>
          </AppCard>
        </div>
      </div>
    </div>
  );
}
