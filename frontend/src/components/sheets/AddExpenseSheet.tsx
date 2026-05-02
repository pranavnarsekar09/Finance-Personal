import { useEffect, useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { BottomSheet } from "./BottomSheet";
import { useAddExpense, useProfile, useSaveFoodLog } from "@/hooks/useApi";
import { DEFAULT_USER_ID } from "@/lib/constants";
import type { PaymentMethod, UserCategory } from "@/lib/types";

const methods: PaymentMethod[] = ["CARD", "UPI", "CASH"];
const fallbackCategories: UserCategory[] = [
  { name: "Groceries", budget: 600 },
  { name: "Dining", budget: 400 },
  { name: "Transport", budget: 200 },
  { name: "Shopping", budget: 500 },
  { name: "Bills", budget: 1500 },
];

export function AddExpenseSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data: profile } = useProfile();
  const addExpense = useAddExpense();
  const saveFoodLog = useSaveFoodLog();

  const categories = profile?.categories?.length ? profile.categories : fallbackCategories;
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [cat, setCat] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("CARD");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));

  useEffect(() => {
    if (!cat && categories.length > 0) {
      setCat(categories[0].name);
    }
  }, [categories, cat]);

  const submit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      return toast.error("Enter a valid amount greater than 0");
    }

    const selectedCat = cat || (categories[0]?.name ?? "Groceries");

    try {
      const amountVal = parseFloat(amount);
      const isFoodRelated = ["dining", "groceries", "food", "meal", "snacks", "drinks"].includes(selectedCat.toLowerCase());

      // 1. Add the expense
      await addExpense.mutateAsync({
        userId: DEFAULT_USER_ID,
        amount: amountVal,
        categoryName: selectedCat,
        paymentMethod: method,
        date: date,
        note: note || selectedCat,
        isRecurring: false,
      });

      // 2. If it's food related, also log as meal
      if (isFoodRelated) {
        await saveFoodLog.mutateAsync({
          userId: DEFAULT_USER_ID,
          foodName: note || selectedCat,
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          date: date,
          estimatedCost: amountVal,
        }).catch(err => console.error("Linked meal log failed:", err));
      }

      toast.success(isFoodRelated ? "Expense logged & added to health meals" : "Expense logged successfully");
      
      // Reset and close
      setAmount("");
      setNote("");
      setDate(format(new Date(), "yyyy-MM-dd"));
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to save expense.");
    }
  };

  return (
    <BottomSheet open={open} onClose={onClose} title="Add Expense">
      <div className="text-center my-2">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">Amount</div>
        <div className="flex items-baseline justify-center gap-1 mt-2">
          <span className="font-display text-3xl text-muted-foreground">₹</span>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
            placeholder="0.00"
            inputMode="decimal"
            autoFocus
            className="font-display text-6xl font-bold bg-transparent outline-none text-center w-48"
          />
        </div>
      </div>

      <div className="mt-4">
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="What was it for?"
          className="w-full bg-secondary rounded-2xl px-5 py-3.5 text-sm outline-none focus:ring-1 ring-primary/20"
        />
      </div>

      <div className="mt-4">
        <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2 px-1">Date</div>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full bg-secondary rounded-2xl px-5 py-3.5 text-sm outline-none focus:ring-1 ring-primary/20"
        />
      </div>

      <div className="mt-6">
        <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2 px-1">Category</div>
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar -mx-1 px-1">
          {categories.map((c) => (
            <button
              key={c.name}
              onClick={() => setCat(c.name)}
              className={`min-w-[80px] px-3 py-4 rounded-2xl flex flex-col items-center justify-center text-xs gap-2 transition-all ${ (cat || categories[0]?.name) === c.name ? "bg-surface-dark text-primary-foreground scale-95 shadow-inner" : "bg-secondary"}`}
            >
              <span className="text-xl">{c.name.toLowerCase().includes('food') || c.name.toLowerCase().includes('dining') ? '🍱' : c.name.toLowerCase().includes('grocer') ? '🛒' : c.name.toLowerCase().includes('transp') ? '🚗' : '💰'}</span>
              <span className="truncate w-full px-1 text-center font-medium">{c.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5">
        <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2 px-1">Method</div>
        <div className="bg-secondary rounded-full p-1 flex">
          {methods.map((m) => (
            <button
              key={m}
              onClick={() => setMethod(m)}
              className={`flex-1 py-2 rounded-full text-sm font-medium transition-all ${method === m ? "bg-card shadow-soft text-primary" : "text-muted-foreground"}`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={submit}
        disabled={addExpense.isPending}
        className="mt-6 w-full bg-surface-dark text-primary-foreground rounded-full py-4 font-semibold disabled:opacity-50 active:scale-[0.98] transition-transform"
      >
        {addExpense.isPending ? "Saving..." : "Save Expense"}
      </button>
    </BottomSheet>
  );
}
