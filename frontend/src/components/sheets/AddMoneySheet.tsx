import { useState } from "react";
import { toast } from "sonner";
import { Plus, Minus, Info, Calendar, RefreshCw } from "lucide-react";
import { BottomSheet } from "./BottomSheet";
import { useAddIncome, useProfile } from "@/hooks/useApi";
import { formatRupees, getIncomeSources } from "@/lib/utils";
import { DEFAULT_USER_ID } from "@/lib/constants";

export function AddMoneySheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data: profile } = useProfile();
  const addIncome = useAddIncome();
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"add" | "withdraw">("add");
  const [source, setSource] = useState("Pocket Money");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [isRecurring, setIsRecurring] = useState(false);

  const currentBalance = profile?.availableBalance ?? 0;
  const currentBudget = profile?.monthlyBudget ?? 0;

  const submit = async () => {
    const rawValue = parseFloat(amount);
    if (!rawValue || rawValue <= 0) {
      return toast.error("Enter a valid amount greater than 0");
    }

    const value = type === "add" ? rawValue : -rawValue;

    try {
      await addIncome.mutateAsync({
        userId: DEFAULT_USER_ID,
        amount: value,
        source: type === "add" ? source : "Withdrawal",
        note: note,
        date: date,
        isRecurring: isRecurring,
      });
      
      toast.success(
        type === "add" 
          ? `₹${rawValue.toLocaleString("en-IN")} received from ${source}` 
          : `₹${rawValue.toLocaleString("en-IN")} withdrawn successfully`
      );
      setAmount("");
      setNote("");
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to adjust balance.");
    }
  };

  const previewValue = parseFloat(amount) || 0;
  const signedPreview = type === "add" ? previewValue : -previewValue;

  return (
    <BottomSheet open={open} onClose={onClose} title={type === "add" ? "Add Money" : "Withdraw Money"}>
      {/* Type Toggle */}
      <div className="flex bg-secondary/50 p-1 rounded-full mb-6">
        <button
          onClick={() => setType("add")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-full text-sm font-medium transition-all ${
            type === "add" ? "bg-emerald-600 text-white shadow-soft" : "text-muted-foreground"
          }`}
        >
          <Plus className="h-4 w-4" /> Add
        </button>
        <button
          onClick={() => setType("withdraw")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-full text-sm font-medium transition-all ${
            type === "withdraw" ? "bg-coral text-white shadow-soft" : "text-muted-foreground"
          }`}
        >
          <Minus className="h-4 w-4" /> Withdraw
        </button>
      </div>

      {/* Amount Input */}
      <div className="text-center my-4">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">
          Amount to {type === "add" ? "Add" : "Withdraw"}
        </div>
        <div className="flex items-baseline justify-center gap-1 mt-2">
          <span className="font-display text-3xl text-muted-foreground">₹</span>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
            placeholder="0.00"
            inputMode="decimal"
            autoFocus
            className={`font-display text-6xl font-bold bg-transparent outline-none text-center w-56 ${
              type === "add" ? "text-emerald-600" : "text-coral"
            }`}
          />
        </div>
      </div>

      {/* Source Selector (Only for Add) */}
      {type === "add" && (
        <div className="mt-6">
          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3 px-1 font-bold">Source</div>
          <div className="flex overflow-x-auto pb-2 gap-2 no-scrollbar">
            {getIncomeSources().map((s) => (
              <button
                key={s}
                onClick={() => setSource(s)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                  source === s
                    ? "bg-emerald-600 border-emerald-600 text-white shadow-soft"
                    : "bg-secondary/50 border-transparent text-muted-foreground hover:bg-secondary"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Note Input */}
      <div className="mt-6">
        <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2 px-1 font-bold">Note (Optional)</div>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="What's this for?"
          className="w-full bg-secondary/50 rounded-2xl p-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
        />
      </div>

      {/* Date & Recurring */}
      <div className="grid grid-cols-2 gap-3 mt-6">
        <div className="bg-secondary/30 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-transparent text-xs font-medium outline-none text-muted-foreground w-full"
            />
          </div>
        </div>
        <button
          onClick={() => setIsRecurring(!isRecurring)}
          className={`rounded-2xl p-4 flex items-center justify-between transition-all ${
            isRecurring ? "bg-primary/10 border border-primary/20" : "bg-secondary/30 border border-transparent"
          }`}
        >
          <div className="flex items-center gap-2">
            <RefreshCw className={`h-4 w-4 ${isRecurring ? "text-primary animate-spin-slow" : "text-muted-foreground"}`} />
            <span className={`text-xs font-medium ${isRecurring ? "text-primary" : "text-muted-foreground"}`}>Recurring</span>
          </div>
          <div className={`h-2 w-2 rounded-full ${isRecurring ? "bg-primary" : "bg-muted-foreground/30"}`} />
        </button>
      </div>

      {/* Quick amount buttons */}
      <div className="mt-6">
        <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3 px-1 font-bold">Quick {type === "add" ? "Add" : "Withdraw"}</div>
        <div className="grid grid-cols-4 gap-2">
          {[500, 1000, 2000, 5000].map((preset) => (
            <button
              key={preset}
              onClick={() => setAmount(String(preset))}
              className={`py-3 rounded-2xl text-sm font-medium transition-all ${
                amount === String(preset)
                  ? type === "add" ? "bg-emerald-600 text-white scale-95 shadow-inner" : "bg-coral text-white scale-95 shadow-inner"
                  : "bg-secondary hover:bg-secondary/80"
              }`}
            >
              ₹{preset.toLocaleString("en-IN")}
            </button>
          ))}
        </div>
      </div>

      {/* Previews */}
      {previewValue > 0 && (
        <div className="mt-8 space-y-3">
          <div className="flex items-start gap-2 bg-secondary/30 rounded-2xl p-4 text-[10px] text-muted-foreground leading-relaxed">
            <Info className="h-3.5 w-3.5 shrink-0 text-primary mt-0.5" />
            <p>
              Your monthly budget will be adjusted to {formatRupees(currentBudget + signedPreview)} to stay in sync with your balance.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-emerald-500/5 rounded-2xl p-4 border border-emerald-500/10">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">
                New Balance
              </div>
              <div className={`font-display text-lg font-bold ${type === "add" ? "text-emerald-600" : "text-coral"}`}>
                {formatRupees(currentBalance + signedPreview)}
              </div>
            </div>
            <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">
                New Budget
              </div>
              <div className="font-display text-lg font-bold text-primary">
                {formatRupees(currentBudget + signedPreview)}
              </div>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={submit}
        disabled={addIncome.isPending}
        className={`mt-8 w-full text-white rounded-full py-4 font-semibold disabled:opacity-50 active:scale-[0.98] transition-all ${
          type === "add" ? "bg-emerald-600 shadow-emerald-500/20 shadow-lg" : "bg-coral shadow-coral/20 shadow-lg"
        }`}
      >
        {addIncome.isPending ? "Processing..." : type === "add" ? "Confirm Add" : "Confirm Withdrawal"}
      </button>
    </BottomSheet>
  );
}
