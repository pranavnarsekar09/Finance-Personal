import { useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Camera, Loader2, Upload } from "lucide-react";
import { BottomSheet } from "./BottomSheet";
import { useAnalyzeFood, useSaveFoodLog } from "@/hooks/useApi";
import { DEFAULT_USER_ID } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AnalyzeFoodSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const analyzeFood = useAnalyzeFood();
  const saveFoodLog = useSaveFoodLog();

  const [image, setImage] = useState<string | null>(null);
  const [foodName, setFoodName] = useState("");
  const [cost, setCost] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return toast.error("Please select or take a photo first");
    
    setIsAnalyzing(true);
    try {
      const result = await analyzeFood.mutateAsync({
        imageUrl: image, // This is base64
        note: foodName || "Analyze this food",
      });
      setAnalysisResult(result);
      if (result.foodName && !foodName) setFoodName(result.foodName);
      toast.success("AI Analysis complete!");
    } catch (error: any) {
      toast.error("AI analysis failed. Please try again.");
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = async () => {
    if (!analysisResult) return toast.error("Please analyze the photo first");

    try {
      const costVal = parseFloat(cost) || analysisResult.estimatedCost || 0;
      await saveFoodLog.mutateAsync({
        userId: DEFAULT_USER_ID,
        foodName: foodName || analysisResult.foodName,
        calories: analysisResult.calories,
        protein: analysisResult.protein,
        carbs: analysisResult.carbs,
        fat: analysisResult.fat,
        date: format(new Date(), "yyyy-MM-dd"),
        estimatedCost: costVal,
        imageUrl: image || "",
      });

      toast.success("AI Meal Logged successfully!");
      reset();
      onClose();
    } catch (error: any) {
      toast.error("Failed to save meal log.");
    }
  };

  const reset = () => {
    setImage(null);
    setFoodName("");
    setCost("");
    setAnalysisResult(null);
    setIsAnalyzing(false);
  };

  return (
    <BottomSheet open={open} onClose={onClose} title="AI Food Analysis">
      <div className="space-y-5">
        <div className="relative aspect-video w-full rounded-[1.5rem] bg-secondary overflow-hidden flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/20 group">
          {image ? (
            <>
              <img src={image} alt="Food" className="w-full h-full object-cover" />
              <button 
                onClick={() => setImage(null)}
                className="absolute top-3 right-3 bg-black/50 text-white p-2 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Upload className="h-4 w-4" />
              </button>
            </>
          ) : (
            <label className="flex flex-col items-center justify-center cursor-pointer w-full h-full">
              <Camera className="h-10 w-10 text-muted-foreground mb-2" />
              <span className="text-sm text-muted-foreground font-medium">Take a photo or Upload</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </label>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">What is this? (Optional)</Label>
            <Input 
              value={foodName} 
              onChange={(e) => setFoodName(e.target.value)} 
              placeholder="e.g. Avocado Toast" 
              className="rounded-2xl h-12 mt-1"
            />
          </div>

          {!analysisResult ? (
            <button
              onClick={handleAnalyze}
              disabled={!image || isAnalyzing}
              className="w-full bg-surface-dark text-primary-foreground rounded-full py-4 font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition-all active:scale-[0.98]"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>AI analyzing plate...</span>
                </>
              ) : (
                <>
                  <SparklesIcon className="h-5 w-5" />
                  <span>Analyze with Gemini</span>
                </>
              )}
            </button>
          ) : (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
              <div className="bg-secondary/50 rounded-2xl p-4 grid grid-cols-4 gap-2 text-center">
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase font-bold">Kcal</div>
                  <div className="text-sm font-bold text-primary">{Math.round(analysisResult.calories)}</div>
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase font-bold">Prot</div>
                  <div className="text-sm font-bold text-coral">{Math.round(analysisResult.protein)}g</div>
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase font-bold">Carb</div>
                  <div className="text-sm font-bold text-sun">{Math.round(analysisResult.carbs)}g</div>
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase font-bold">Fat</div>
                  <div className="text-sm font-bold text-sky">{Math.round(analysisResult.fat)}g</div>
                </div>
              </div>

              <div>
                <Label className="text-xs uppercase tracking-widest text-muted-foreground">Cost (₹)</Label>
                <Input 
                  type="number"
                  value={cost} 
                  onChange={(e) => setCost(e.target.value)} 
                  placeholder={analysisResult.estimatedCost?.toString() || "0.00"} 
                  className="rounded-2xl h-12 mt-1 text-primary font-bold text-lg"
                />
              </div>

              <button
                onClick={handleSave}
                className="w-full bg-mint text-primary rounded-full py-4 font-bold shadow-soft transition-all active:scale-[0.98]"
              >
                Log Meal & Expense
              </button>
            </div>
          )}
        </div>
      </div>
    </BottomSheet>
  );
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1-8.313-12.454z" />
      <path d="M12 10V6" />
      <path d="M12 18v-4" />
      <path d="M10 14h4" />
      <path d="m19 12-2-2m0 0-2 2m2-2v6" />
    </svg>
  );
}
