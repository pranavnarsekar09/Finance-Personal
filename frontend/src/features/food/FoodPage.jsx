import { useEffect, useMemo, useState } from "react";
import { Camera, Salad } from "lucide-react";
import { useAsync } from "../../hooks/useAsync";
import { usePersistentState } from "../../hooks/usePersistentState";
import { api } from "../../lib/api";
import { USER_ID } from "../../lib/constants";
import { currency, emitDataRefresh, fileToDataUrl, monthKey, todayKey } from "../../lib/utils";
import { Button } from "../../components/ui/Button";
import { MacroChart } from "../../components/charts/MacroChart";
import { AppCard, SectionHeader, TransactionItem } from "../../ui/fintech";

export function FoodPage({ profile }) {
  const categories = profile?.categories || [];
  const [month] = useState(monthKey());
  const [imageUrl, setImageUrl] = usePersistentState("fintrack-food-image", "");
  const [note, setNote] = usePersistentState("fintrack-food-note", "");
  const [manualFoodName, setManualFoodName] = usePersistentState("fintrack-food-name", "");
  const [manualPrice, setManualPrice] = usePersistentState("fintrack-food-price", "");
  const [logDate, setLogDate] = usePersistentState("fintrack-food-date", todayKey());
  const [preferredCategory, setPreferredCategory] = usePersistentState("fintrack-food-category", "");
  const [analysis, setAnalysis] = useState(null);
  const [status, setStatus] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { data: logs, setData, execute } = useAsync(() => api.getFoodLogs(USER_ID, month), [month], { initialData: [] });

  useEffect(() => {
    if (!preferredCategory && categories.length) {
      const matched = categories.find((category) => /food|meal|grocery/i.test(category.name));
      if (matched) {
        setPreferredCategory(matched.name);
      }
    }
  }, [categories, preferredCategory, setPreferredCategory]);

  useEffect(() => {
    const handleRefresh = () => {
      execute().catch(() => undefined);
    };
    window.addEventListener("fintrack:data-updated", handleRefresh);
    return () => window.removeEventListener("fintrack:data-updated", handleRefresh);
  }, [execute]);

  const monthlyFoodCost = useMemo(
    () => (logs || []).reduce((sum, entry) => sum + entry.estimatedCost, 0),
    [logs],
  );

  const analyze = async () => {
    setStatus("");
    if (!imageUrl && !note && !manualFoodName) {
      setStatus("Add a photo, URL, note, or food name before running analysis.");
      return;
    }
    setIsAnalyzing(true);
    try {
      const result = await api.analyzeFood({ imageUrl, note });
      setAnalysis(result);
      setStatus("Analysis ready.");
    } catch (error) {
      setStatus(error.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    const dataUrl = await fileToDataUrl(file);
    setImageUrl(dataUrl);
  };

  const confirmLog = async () => {
    setStatus("");
    setIsSaving(true);
    try {
      const saved = await api.saveFoodLog({
        userId: USER_ID,
        imageUrl: analysis.imageUrl || imageUrl,
        foodName: manualFoodName || analysis.foodName,
        calories: analysis.calories,
        protein: analysis.protein,
        carbs: analysis.carbs,
        fat: analysis.fat,
        estimatedCost: manualPrice ? Number(manualPrice) : analysis.estimatedCost,
        date: logDate,
        note,
        expenseCategoryName: preferredCategory,
      });

      setData([saved, ...(logs || [])]);
      setAnalysis(null);
      setImageUrl("");
      setNote("");
      setManualFoodName("");
      setManualPrice("");
      setStatus("Meal saved.");
      emitDataRefresh();
    } catch (error) {
      setStatus(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const logManually = async () => {
    setStatus("");
    if (!manualFoodName) {
      setStatus("Food Name is required to log manually.");
      return;
    }
    setIsSaving(true);
    try {
      const saved = await api.saveFoodLog({
        userId: USER_ID,
        imageUrl,
        foodName: manualFoodName,
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        estimatedCost: manualPrice ? Number(manualPrice) : 0,
        date: logDate,
        note,
        expenseCategoryName: preferredCategory,
      });

      setData([saved, ...(logs || [])]);
      setImageUrl("");
      setNote("");
      setManualFoodName("");
      setManualPrice("");
      setStatus("Meal saved manually.");
      emitDataRefresh();
    } catch (error) {
      setStatus(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-500">Food</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Turn meals into clear signals</h1>
        <p className="mt-2 text-sm text-slate-500">
          Analyze a meal from a photo, log it manually, and review the nutrition with a lighter UI.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <AppCard>
          <SectionHeader
            eyebrow="Add Food"
            title="Meal details"
            description="A cleaner invoice-like structure for meal logging."
            actions={<Camera className="h-5 w-5 text-sky-500" />}
          />
          <div className="mt-5 space-y-5">
            <div className="space-y-4 rounded-[26px] border border-slate-100 bg-slate-50/80 p-4">
              <div>
                <label className="label">Meal Image URL</label>
                <input className="text-input" value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} placeholder="https://..." />
              </div>
              <div>
                <label className="label">Or Upload Photo</label>
                <input className="text-input" type="file" accept="image/*" onChange={handleFile} />
              </div>
              <div>
                <label className="label">Note</label>
                <textarea className="textarea-input" rows="3" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Lunch at home, post-gym meal..." />
              </div>
            </div>

            <div className="space-y-4 rounded-[26px] border border-slate-100 bg-white p-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="label">Food Name</label>
                  <input className="text-input" value={manualFoodName} onChange={(event) => setManualFoodName(event.target.value)} placeholder="Chicken salad" />
                </div>
                <div>
                  <label className="label">Price</label>
                  <input className="text-input" type="number" value={manualPrice} onChange={(event) => setManualPrice(event.target.value)} placeholder="0" />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="label">Log Date</label>
                  <input className="text-input" type="date" value={logDate} onChange={(event) => setLogDate(event.target.value)} />
                </div>
                <div>
                  <label className="label">Expense Category</label>
                  <select className="select-input" value={preferredCategory} onChange={(event) => setPreferredCategory(event.target.value)}>
                    <option value="">No linked expense</option>
                    {categories.map((category) => (
                      <option key={category.name} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="rounded-[26px] border border-slate-100 bg-slate-900 p-4 text-white">
              <div className="flex items-center justify-between text-sm text-slate-300">
                <span>Monthly food cost</span>
                <span className="text-xl font-bold text-white">{currency(monthlyFoodCost)}</span>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Button variant="secondary" onClick={logManually} disabled={!manualFoodName || isSaving}>
                {isSaving && !analysis ? "Saving..." : "Log Directly"}
              </Button>
              <Button onClick={analyze} disabled={isAnalyzing}>
                {isAnalyzing ? "Analyzing..." : "Analyze Meal"}
              </Button>
            </div>
            {status ? <p className="text-sm text-sky-600">{status}</p> : null}
          </div>
        </AppCard>

        <div className="space-y-4">
          <AppCard>
            <SectionHeader
              eyebrow="Analysis"
              title={analysis ? analysis.foodName : "Nutrition preview"}
              description="Macros and cost from the current analysis."
              actions={analysis ? <Button onClick={confirmLog} disabled={isSaving}>{isSaving ? "Saving..." : "Confirm & Log"}</Button> : null}
            />
            {analysis ? (
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="rounded-[26px] border border-slate-100 bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Estimated cost</p>
                  <p className="mt-2 text-xl font-bold text-slate-900">{currency(analysis.estimatedCost)}</p>
                  <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-slate-500">Calories</span><p className="mt-1 font-semibold text-slate-900">{analysis.calories}</p></div>
                    <div><span className="text-slate-500">Protein</span><p className="mt-1 font-semibold text-slate-900">{analysis.protein} g</p></div>
                    <div><span className="text-slate-500">Carbs</span><p className="mt-1 font-semibold text-slate-900">{analysis.carbs} g</p></div>
                    <div><span className="text-slate-500">Fat</span><p className="mt-1 font-semibold text-slate-900">{analysis.fat} g</p></div>
                  </div>
                </div>
                <MacroChart protein={analysis.protein} carbs={analysis.carbs} fat={analysis.fat} />
              </div>
            ) : (
              <p className="mt-5 text-sm text-slate-500">Run an analysis to see calories, macros, and estimated cost.</p>
            )}
          </AppCard>

          <AppCard>
            <SectionHeader eyebrow="History" title="Recent meals" description="Latest food logs this month." actions={<Salad className="h-5 w-5 text-sky-500" />} />
            <div className="mt-5 space-y-3">
              {logs?.length ? logs.slice(0, 5).map((entry) => (
                <TransactionItem
                  key={entry.id}
                  title={entry.foodName}
                  subtitle={`${entry.date} • ${entry.calories} kcal`}
                  amount={entry.estimatedCost}
                  icon="food"
                  rightDetail={entry.note || "No note"}
                />
              )) : (
                <p className="text-sm text-slate-500">Your meal log will appear here once you start tracking food.</p>
              )}
            </div>
          </AppCard>
        </div>
      </div>
    </div>
  );
}
