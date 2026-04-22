import { useEffect, useMemo, useState } from "react";
import { useAsync } from "../../hooks/useAsync";
import { usePersistentState } from "../../hooks/usePersistentState";
import { api } from "../../lib/api";
import { USER_ID } from "../../lib/constants";
import { currency, emitDataRefresh, fileToDataUrl, monthKey, todayKey } from "../../lib/utils";
import { PageHeader } from "../../components/layout/PageHeader";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { MacroChart } from "../../components/charts/MacroChart";

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
        imageUrl: imageUrl,
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
      <PageHeader
        eyebrow="Food"
        title="Turn meals into signals."
        description="Analyze a meal from a photo or URL, confirm the nutrition, and log it into your calorie diary."
      />

      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <h2 className="font-display text-2xl font-bold text-white">Analyze Meal</h2>
          <div className="mt-5 space-y-4">
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
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="label">Food Name (Optional if Analyzing)</label>
                <input className="text-input" value={manualFoodName} onChange={(event) => setManualFoodName(event.target.value)} placeholder="e.g. Chicken Salad" />
              </div>
              <div>
                <label className="label">Price</label>
                <input className="text-input" type="number" value={manualPrice} onChange={(event) => setManualPrice(event.target.value)} placeholder="e.g. 15.00" />
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
            <div className="grid gap-4 md:grid-cols-2">
              <Button variant="secondary" onClick={logManually} disabled={!manualFoodName || isSaving}>
                {isSaving && !analysis ? "Saving..." : "Log Directly"}
              </Button>
              <Button onClick={analyze} disabled={isAnalyzing}>
                {isAnalyzing ? "Analyzing..." : "Analyze Meal"}
              </Button>
            </div>
            {status ? <p className="text-sm text-cyan-100">{status}</p> : null}
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-2xl font-bold text-white">Analysis Result</h2>
                <p className="text-sm text-muted">Gemini-powered estimate with a safe fallback if the API key is missing.</p>
              </div>
              {analysis ? (
                <Button onClick={confirmLog} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Confirm & Log"}
                </Button>
              ) : null}
            </div>
            {analysis ? (
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-slate-400">Meal</p>
                  <h3 className="mt-2 font-display text-2xl font-bold text-white">{analysis.foodName}</h3>
                  <p className="mt-3 text-sm text-slate-300">{analysis.note || "No note"}</p>
                  <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-slate-500">Calories</span><p>{analysis.calories}</p></div>
                    <div><span className="text-slate-500">Protein</span><p>{analysis.protein} g</p></div>
                    <div><span className="text-slate-500">Carbs</span><p>{analysis.carbs} g</p></div>
                    <div><span className="text-slate-500">Fat</span><p>{analysis.fat} g</p></div>
                  </div>
                  <p className="mt-4 font-semibold text-cyan-100">{currency(analysis.estimatedCost)}</p>
                </div>
                <MacroChart protein={analysis.protein} carbs={analysis.carbs} fat={analysis.fat} />
              </div>
            ) : (
              <p className="mt-5 text-sm text-slate-400">Run an analysis to see calories, macros, and estimated cost.</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
