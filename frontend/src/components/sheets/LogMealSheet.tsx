import { useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { BottomSheet } from "./BottomSheet";
import { useSaveFoodLog, useAddExpense } from "@/hooks/useApi";
import { DEFAULT_USER_ID } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LogMealSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const saveFoodLog = useSaveFoodLog();
  const addExpense = useAddExpense();

  const [foodName, setFoodName] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [cost, setCost] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));

  const submit = async () => {
    if (!foodName) return toast.error("Enter food name");
    
    try {
      const costVal = parseFloat(cost) || 0;
      const mealPayload = {
        userId: DEFAULT_USER_ID,
        foodName,
        calories: parseFloat(calories) || 0,
        protein: parseFloat(protein) || 0,
        carbs: parseFloat(carbs) || 0,
        fat: parseFloat(fat) || 0,
        date,
        estimatedCost: costVal,
      };

      await saveFoodLog.mutateAsync(mealPayload);

      // If cost is provided, also log as expense
      if (costVal > 0) {
        await addExpense.mutateAsync({
          userId: DEFAULT_USER_ID,
          amount: costVal,
          categoryName: "Dining",
          paymentMethod: "UPI",
          date,
          note: `Meal: ${foodName}`,
          isRecurring: false,
        }).catch(err => console.error("Linked expense log failed:", err));
      }

      toast.success(costVal > 0 ? "Meal logged & added to expenses" : "Meal logged successfully");
      reset();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to log meal");
    }
  };

  const reset = () => {
    setFoodName("");
    setCalories("");
    setProtein("");
    setCarbs("");
    setFat("");
    setCost("");
    setDate(format(new Date(), "yyyy-MM-dd"));
  };

  return (
    <BottomSheet open={open} onClose={onClose} title="Log Meal">
      <div className="space-y-4">
        <div>
          <Label className="text-xs uppercase tracking-widest text-muted-foreground">What did you eat?</Label>
          <Input 
            value={foodName} 
            onChange={(e) => setFoodName(e.target.value)} 
            placeholder="e.g. Chicken Salad" 
            className="rounded-2xl h-12 mt-1"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">Calories (kcal)</Label>
            <Input 
              type="number"
              value={calories} 
              onChange={(e) => setCalories(e.target.value)} 
              placeholder="0" 
              className="rounded-2xl h-12 mt-1"
            />
          </div>
          <div>
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">Estimated Cost (₹)</Label>
            <Input 
              type="number"
              value={cost} 
              onChange={(e) => setCost(e.target.value)} 
              placeholder="0.00" 
              className="rounded-2xl h-12 mt-1 text-primary font-bold"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div>
            <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Protein (g)</Label>
            <Input type="number" value={protein} onChange={(e) => setProtein(e.target.value)} placeholder="0" className="rounded-xl h-10 mt-1" />
          </div>
          <div>
            <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Carbs (g)</Label>
            <Input type="number" value={carbs} onChange={(e) => setCarbs(e.target.value)} placeholder="0" className="rounded-xl h-10 mt-1" />
          </div>
          <div>
            <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Fat (g)</Label>
            <Input type="number" value={fat} onChange={(e) => setFat(e.target.value)} placeholder="0" className="rounded-xl h-10 mt-1" />
          </div>
        </div>

        <div>
          <Label className="text-xs uppercase tracking-widest text-muted-foreground">Date</Label>
          <Input 
            type="date" 
            value={date} 
            onChange={(e) => setDate(e.target.value)} 
            className="rounded-2xl h-12 mt-1"
          />
        </div>

        <button
          onClick={submit}
          disabled={saveFoodLog.isPending}
          className="w-full bg-surface-dark text-primary-foreground rounded-full py-4 font-semibold disabled:opacity-50 mt-2"
        >
          {saveFoodLog.isPending ? "Logging..." : "Save Meal"}
        </button>
      </div>
    </BottomSheet>
  );
}
