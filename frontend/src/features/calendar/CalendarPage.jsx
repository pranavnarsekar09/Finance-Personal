import { useEffect, useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAsync } from "../../hooks/useAsync";
import { api } from "../../lib/api";
import { USER_ID } from "../../lib/constants";
import { buildCalendarGrid, currency, emitDataRefresh, monthKey, monthLabel, shiftMonth } from "../../lib/utils";
import { PageHeader } from "../../components/layout/PageHeader";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";

export function CalendarPage() {
  const [month, setMonth] = useState(monthKey());
  const [selectedDate, setSelectedDate] = useState(null);
  const { data: entries, setData, execute } = useAsync(() => api.getCalendar(USER_ID, month), [month], { initialData: [] });

  useEffect(() => {
    const handleRefresh = () => {
      execute().catch(() => undefined);
    };
    window.addEventListener("fintrack:data-updated", handleRefresh);
    return () => window.removeEventListener("fintrack:data-updated", handleRefresh);
  }, [execute]);

  useEffect(() => {
    if (entries?.length && (!selectedDate || !entries.some((entry) => entry.date === selectedDate))) {
      setSelectedDate(entries[0].date);
    }
  }, [entries, selectedDate]);

  const selected = useMemo(() => entries?.find((entry) => entry.date === selectedDate), [entries, selectedDate]);
  const entryMap = useMemo(() => new Map((entries || []).map((entry) => [entry.date, entry])), [entries]);
  const calendarCells = useMemo(() => buildCalendarGrid(month), [month]);

  const removeExpense = async (id) => {
    await api.deleteExpense(id);
    setData(entries.map((entry) => (entry.date === selectedDate ? { ...entry, expenses: entry.expenses.filter((expense) => expense.id !== id), hasExpenses: entry.expenses.length > 1 } : entry)));
    emitDataRefresh();
  };

  const removeMeal = async (id) => {
    await api.deleteFoodLog(id);
    setData(entries.map((entry) => (entry.date === selectedDate ? { ...entry, meals: entry.meals.filter((meal) => meal.id !== id), hasMeals: entry.meals.length > 1 } : entry)));
    emitDataRefresh();
  };

  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="History"
        title="See the month as a story."
        description="Click any date on the calendar to inspect the expenses and meals logged that day."
      />

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <Button variant="secondary" onClick={() => setMonth((current) => shiftMonth(current, -1))}>Prev</Button>
            <h2 className="text-2xl font-semibold text-slate-900">{monthLabel(month)}</h2>
            <Button variant="secondary" onClick={() => setMonth((current) => shiftMonth(current, 1))}>Next</Button>
          </div>
          <div className="mb-3 grid grid-cols-7 gap-3 text-center text-[10px] uppercase tracking-[0.2em] text-slate-500 sm:text-xs">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>
          <div className="calendar-grid">
            {calendarCells.map((date, index) => {
              const entry = date ? entryMap.get(date) : null;
              return (
                <button
                  key={date || `empty-${index}`}
                  type="button"
                  disabled={!date}
                  onClick={() => date && setSelectedDate(date)}
                  className={`calendar-day ${selectedDate === date ? "is-selected" : ""} ${!date ? "pointer-events-none opacity-0" : ""}`}
                >
                  {date ? (
                    <>
                      <p className="text-sm font-bold text-slate-900 sm:text-base">{Number(date.slice(-2))}</p>
                      <div className="mt-1 flex gap-0.5 sm:mt-2 sm:gap-1">
                        {entry?.hasExpenses ? <span className="h-1 w-1 rounded-full bg-sky-400 sm:h-1.5 sm:w-1.5" /> : null}
                        {entry?.hasMeals ? <span className="h-1 w-1 rounded-full bg-emerald-400 sm:h-1.5 sm:w-1.5" /> : null}
                      </div>
                      <p className="mt-1 hidden text-[10px] text-slate-500 sm:block">
                        {entry?.expenses?.length || 0} exp • {entry?.meals?.length || 0} meals
                      </p>
                    </>
                  ) : null}
                </button>
              );
            })}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">{selectedDate || "Pick a date"}</h2>
              <p className="text-sm text-slate-500">Daily transactions and meals.</p>
            </div>
          </div>

          {selected ? (
            <div className="mt-5 space-y-5">
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-semibold text-slate-900">Expenses</h3>
                </div>
                <div className="flex flex-col space-y-2">
                  <AnimatePresence>
                    {selected.expenses.length ? selected.expenses.map((entry) => (
                      <motion.div
                        layout
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0, overflow: "hidden" }}
                        transition={{ duration: 0.2 }}
                        key={entry.id}
                        className="group flex w-full items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-3 text-sm transition hover:bg-slate-100"
                      >
                        <div>
                          {entry.categoryName} • {currency(entry.amount)} • {entry.paymentMethod}
                        </div>
                        <button onClick={() => removeExpense(entry.id)} className="opacity-0 transition group-hover:opacity-100 text-slate-400 hover:text-red-400">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </motion.div>
                    )) : <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm text-slate-500">No expenses logged.</motion.p>}
                  </AnimatePresence>
                </div>
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-semibold text-slate-900">Meals</h3>
                </div>
                <div className="flex flex-col space-y-2">
                  <AnimatePresence>
                    {selected.meals.length ? selected.meals.map((entry) => (
                      <motion.div
                        layout
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0, overflow: "hidden" }}
                        transition={{ duration: 0.2 }}
                        key={entry.id}
                        className="group flex w-full items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-3 text-sm transition hover:bg-slate-100"
                      >
                        <div>
                          {entry.foodName} • {entry.calories} kcal • {currency(entry.estimatedCost)}
                        </div>
                        <button onClick={() => removeMeal(entry.id)} className="opacity-0 transition group-hover:opacity-100 text-slate-400 hover:text-red-400">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </motion.div>
                    )) : <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm text-slate-500">No meals logged.</motion.p>}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          ) : (
            <p className="mt-5 text-sm text-slate-500">Select a date to inspect that day.</p>
          )}
        </Card>
      </div>
    </div>
  );
}
