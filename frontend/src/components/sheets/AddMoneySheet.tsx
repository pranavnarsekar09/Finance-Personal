import { useState } from "react";
import { toast } from "sonner";
import { Plus, Minus, Info } from "lucide-react";
import { BottomSheet } from "./BottomSheet";
import { useAddMoney, useProfile } from "@/hooks/useApi";
import { formatRupees } from "@/lib/utils";

export function AddMoneySheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data: profile } = useProfile();
  const addMoney = useAddMoney();
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"add" | "withdraw">("add");

  const currentBalance = profile?.availableBalance ?? 0;
  const currentBudget = profile?.monthlyBudget ?? 0;

  const submit = async () => {
    const rawValue = parseFloat(amount);
    if (!rawValue || rawValue <= 0) {
      return toast.error("Enter a valid amount greater than 0");
    }

    const value = type === "add" ? rawValue : -rawValue;

    try {
      await addMoney.mutateAsync(value);
      toast.success(
        type === "add" 
          ? `₹${rawValue.toLocaleString("en-IN")} added successfully` 
          : `₹${rawValue.toLocaleString("en-IN")} withdrawn successfully`
      );
      setAmount("");
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

      {/* Current State Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-emerald-500/10 rounded-3xl p-4 border border-emerald-500/20">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">
            Current Balance
          </div>
          <div className="font-display text-xl font-bold text-emerald-600">
            {formatRupees(currentBalance)}
          </div>
        </div>
        <div className="bg-primary/10 rounded-3xl p-4 border border-primary/20">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">
            Monthly Budget
          </div>
          <div className="font-display text-xl font-bold text-primary">
            {formatRupees(currentBudget)}
          </div>
        </div>
      </div>

      {/* Amount Input */}
      <div className="text-center my-2">
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

      {/* Quick amount buttons */}
      <div className="mt-6">
        <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2 px-1">Quick {type === "add" ? "Add" : "Withdraw"}</div>
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

      {/* Logic explanation & previews */}
      {previewValue > 0 && (
        <div className="mt-6 space-y-3">
          <div className="flex items-start gap-2 bg-secondary/30 rounded-2xl p-4 text-xs text-muted-foreground leading-relaxed">
            <Info className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            <p>
              Your monthly budget will be adjusted by {formatRupees(previewValue)} to maintain the balance relationship (Balance = Budget - Spent).
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-secondary/50 rounded-2xl p-4">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">
                New Balance
              </div>
              <div className={`font-display text-lg font-bold ${type === "add" ? "text-emerald-600" : "text-coral"}`}>
                {formatRupees(currentBalance + signedPreview)}
              </div>
            </div>
            <div className="bg-secondary/50 rounded-2xl p-4">
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
        disabled={addMoney.isPending}
        className={`mt-6 w-full text-white rounded-full py-4 font-semibold disabled:opacity-50 active:scale-[0.98] transition-all ${
          type === "add" ? "bg-emerald-600 shadow-emerald-500/20 shadow-lg" : "bg-coral shadow-coral/20 shadow-lg"
        }`}
      >
        {addMoney.isPending ? "Processing..." : type === "add" ? "Confirm Add" : "Confirm Withdrawal"}
      </button>
    </BottomSheet>
  );
}
