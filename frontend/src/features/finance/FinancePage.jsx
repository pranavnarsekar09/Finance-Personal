import { useEffect, useMemo, useState } from "react";
import jsPDF from "jspdf";
import { useAsync } from "../../hooks/useAsync";
import { usePersistentState } from "../../hooks/usePersistentState";
import { api } from "../../lib/api";
import { USER_ID } from "../../lib/constants";
import { currency, emitDataRefresh, monthKey, shortDate, todayKey } from "../../lib/utils";
import { PageHeader } from "../../components/layout/PageHeader";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { ProgressBar } from "../../components/ui/ProgressBar";

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

  const { data: expenses, loading, setData, execute } = useAsync(() => api.getExpenses(USER_ID, month), [month], {
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

  const submit = async (event) => {
    event.preventDefault();
    setStatus("");
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
      <PageHeader
        eyebrow="Finance"
        title="Stay sharp on spending."
        description="Log expenses fast, keep category budgets honest, and export your month when you need it."
        actions={<Button onClick={exportPdf}>Export PDF</Button>}
      />

      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <h2 className="font-display text-2xl font-bold text-white">Add Expense</h2>
          <form className="mt-5 space-y-4" onSubmit={submit}>
            <div>
              <label className="label">Amount</label>
              <input className="text-input" type="number" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} />
            </div>
            <div>
              <label className="label">Category</label>
              <select className="select-input" value={form.categoryName} onChange={(event) => setForm({ ...form, categoryName: event.target.value })}>
                {categories.map((category) => (
                  <option key={category.name} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="label">Payment Method</label>
                <select className="select-input" value={form.paymentMethod} onChange={(event) => setForm({ ...form, paymentMethod: event.target.value })}>
                  <option value="UPI">UPI</option>
                  <option value="CASH">Cash</option>
                  <option value="CARD">Card</option>
                </select>
              </div>
              <div>
                <label className="label">Date</label>
                <input className="text-input" type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} />
              </div>
            </div>
            <div>
              <label className="label">Note</label>
              <textarea className="textarea-input" rows="3" value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} />
            </div>
            <label className="flex items-center gap-3 text-sm text-slate-300">
              <input type="checkbox" checked={form.isRecurring} onChange={(event) => setForm({ ...form, isRecurring: event.target.checked })} />
              Mark as recurring
            </label>
            <Button className="w-full" type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Expense"}
            </Button>
            {status ? <p className="text-sm text-cyan-100">{status}</p> : null}
          </form>
        </Card>

        <div className="space-y-4">
          <Card>
            <h2 className="font-display text-2xl font-bold text-white">Category Breakdown</h2>
            <div className="mt-5 space-y-4">
              {!categories.length ? <p className="text-sm text-slate-500">Add at least one category in Profile to log expenses.</p> : null}
              {totals.map((category) => (
                <div key={category.name}>
                  <div className="mb-2 flex items-center justify-between">
                    <span>{category.name}</span>
                    <span className="text-sm text-slate-400">{currency(category.spent)} / {currency(category.budget)}</span>
                  </div>
                  <ProgressBar value={category.spent} total={category.budget} />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
