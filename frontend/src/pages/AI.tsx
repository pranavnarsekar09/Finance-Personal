import { useMemo, useState } from "react";
import { AlertTriangle, ChevronDown, Sparkles, TrendingDown, TrendingUp, Minus, Brain, ShieldAlert, Target } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { useAiDashboard } from "@/hooks/useApi";
import type { AiAnomaly, AiRecommendation, AiScore } from "@/lib/types";

const trendIconMap = {
  up: TrendingUp,
  down: TrendingDown,
  flat: Minus,
} as const;

export default function AIPage() {
  const { data, isLoading, error } = useAiDashboard();
  const [openRecommendation, setOpenRecommendation] = useState(0);
  const [openScore, setOpenScore] = useState(0);

  const scoreAverage = useMemo(() => {
    if (!data?.scores?.length) return 0;
    return Math.round(data.scores.reduce((sum, score) => sum + score.value, 0) / data.scores.length);
  }, [data]);

  if (isLoading) {
    return <div className="p-10 text-center text-muted-foreground animate-pulse">Loading AI insights...</div>;
  }

  if (error || !data) {
    return (
      <div className="space-y-5">
        <div className="bg-card rounded-[2rem] shadow-soft p-8 text-center">
          <div className="h-14 w-14 rounded-full bg-secondary mx-auto flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-muted-foreground" />
          </div>
          <h1 className="font-display text-3xl font-bold mt-4">AI is warming up</h1>
          <p className="text-sm text-muted-foreground mt-2">
            The AI dashboard couldn&apos;t load right now. Try again once the backend is awake.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">AI Copilot</div>
          <h1 className="font-display text-4xl font-bold tracking-tight mt-2">Ai</h1>
        </div>
        <div className="rounded-full bg-card px-3 py-2 shadow-soft text-[10px] uppercase tracking-widest text-muted-foreground">
          {format(new Date(data.generatedAt), "MMM d")}
        </div>
      </div>

      <div className="bg-gradient-sage rounded-[2rem] shadow-float p-5 text-primary-foreground overflow-hidden relative">
        <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
        <div className="flex items-center justify-between gap-4 relative">
          <div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-primary-foreground/70">Composite Score</div>
            <div className="font-display text-5xl font-bold mt-2">{scoreAverage}</div>
            <p className="text-sm text-primary-foreground/80 mt-2 max-w-[18rem]">
              AI is blending your money, nutrition, and habit signals into one quick weekly snapshot.
            </p>
          </div>
          <div className="h-16 w-16 rounded-[1.5rem] bg-white/10 flex items-center justify-center border border-white/10">
            <Brain className="h-8 w-8" />
          </div>
        </div>
        <div className="mt-5 flex gap-2">
          {data.scores.map((score) => (
            <div key={score.name} className="flex-1 rounded-2xl bg-white/10 px-3 py-2">
              <div className="text-[10px] uppercase tracking-widest text-primary-foreground/60">{shortScoreName(score.name)}</div>
              <div className="font-bold text-lg mt-1">{score.value}</div>
            </div>
          ))}
        </div>
      </div>

      <SectionTitle icon={Sparkles} label="Predictions" />
      <div className="space-y-3">
        {data.predictions.map((prediction, index) => (
          <div key={`${prediction.title}-${index}`} className="bg-card rounded-[1.75rem] shadow-soft p-4 border border-white/60">
            <div className="flex items-start gap-3">
              <div className={predictionToneClasses(prediction.tone)}>
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="font-semibold">{prediction.title}</div>
                <div className="text-sm text-muted-foreground mt-1">{prediction.detail}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <SectionTitle icon={Target} label="Smart Recommendations" />
      <div className="space-y-3">
        {data.recommendations.map((recommendation, index) => (
          <ExpandableRecommendation
            key={`${recommendation.title}-${index}`}
            item={recommendation}
            open={openRecommendation === index}
            onToggle={() => setOpenRecommendation(openRecommendation === index ? -1 : index)}
          />
        ))}
      </div>

      <SectionTitle icon={ShieldAlert} label="Anomaly Alerts" />
      <div className="grid gap-3">
        {data.anomalies.map((anomaly, index) => (
          <AnomalyCard key={`${anomaly.title}-${index}`} anomaly={anomaly} />
        ))}
      </div>

      <SectionTitle icon={AlertTriangle} label="Scores" />
      <div className="space-y-3">
        {data.scores.map((score, index) => (
          <ExpandableScore
            key={score.name}
            score={score}
            open={openScore === index}
            onToggle={() => setOpenScore(openScore === index ? -1 : index)}
          />
        ))}
      </div>
    </div>
  );
}

function SectionTitle({ icon: Icon, label }: { icon: typeof Sparkles; label: string }) {
  return (
    <div className="flex items-center gap-2 px-1">
      <div className="h-8 w-8 rounded-full bg-card shadow-soft flex items-center justify-center">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground font-bold">{label}</div>
    </div>
  );
}

function ExpandableRecommendation({
  item,
  open,
  onToggle,
}: {
  item: AiRecommendation;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="w-full text-left bg-card rounded-[1.75rem] shadow-soft p-4 border border-white/60 transition hover:bg-secondary/20"
    >
      <div className="flex items-start gap-3">
        <div className="h-11 w-11 rounded-2xl bg-mint/30 flex items-center justify-center shrink-0">
          <Target className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold leading-snug">{item.title}</div>
          <div className="text-sm text-muted-foreground mt-1">{item.detail}</div>
          <div className="text-xs text-primary font-medium mt-3">{item.impact}</div>
        </div>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition ${open ? "rotate-180" : ""}`} />
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-4 pt-4 border-t border-border/70 space-y-2">
              {item.breakdown.map((line, index) => (
                <div key={`${line}-${index}`} className="rounded-2xl bg-secondary/70 px-3 py-2 text-sm text-foreground/90">
                  {line}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}

function AnomalyCard({ anomaly }: { anomaly: AiAnomaly }) {
  return (
    <div className="bg-card rounded-[1.75rem] shadow-soft p-4 border border-white/60">
      <div className="flex items-start gap-3">
        <div className={anomalySeverityClasses(anomaly.severity)}>
          <AlertTriangle className="h-4 w-4" />
        </div>
        <div>
          <div className="font-semibold">{anomaly.title}</div>
          <div className="text-sm text-muted-foreground mt-1">{anomaly.detail}</div>
        </div>
      </div>
    </div>
  );
}

function ExpandableScore({
  score,
  open,
  onToggle,
}: {
  score: AiScore;
  open: boolean;
  onToggle: () => void;
}) {
  const TrendIcon = trendIconMap[(score.trend as keyof typeof trendIconMap) ?? "flat"] || Minus;
  const breakdown = getScoreBreakdown(score);

  return (
    <button
      onClick={onToggle}
      className="w-full text-left bg-card rounded-[1.9rem] shadow-soft p-4 border border-white/60"
    >
      <div className="flex items-center gap-4">
        <div className="relative h-16 w-16 shrink-0">
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `conic-gradient(hsl(var(--mint)) ${score.value * 3.6}deg, hsl(var(--secondary)) 0deg)`,
            }}
          />
          <div className="absolute inset-[6px] rounded-full bg-card flex items-center justify-center font-display text-xl font-bold">
            {score.value}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3">
            <div className="font-semibold">{score.name}</div>
            <div className="flex items-center gap-1 text-xs font-medium text-primary">
              <TrendIcon className="h-3.5 w-3.5" />
              {score.trend}
            </div>
          </div>
          <div className="text-sm text-muted-foreground mt-1">{score.explanation}</div>
        </div>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition ${open ? "rotate-180" : ""}`} />
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-4 pt-4 border-t border-border/70">
              <div className="mt-4 space-y-2">
                {breakdown.map((line, index) => (
                  <div key={`${score.name}-${index}`} className="rounded-2xl bg-secondary/70 px-3 py-2 text-sm text-foreground/90">
                    {line}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}

function shortScoreName(name: string) {
  if (name.startsWith("Financial")) return "Money";
  if (name.startsWith("Nutrition")) return "Food";
  return "Habits";
}

function predictionToneClasses(tone: string) {
  if (tone === "warning") return "h-10 w-10 rounded-2xl bg-coral/20 text-coral flex items-center justify-center shrink-0";
  if (tone === "positive") return "h-10 w-10 rounded-2xl bg-mint/30 text-primary flex items-center justify-center shrink-0";
  return "h-10 w-10 rounded-2xl bg-secondary text-primary flex items-center justify-center shrink-0";
}

function anomalySeverityClasses(severity: string) {
  if (severity === "high") return "h-10 w-10 rounded-2xl bg-coral/20 text-coral flex items-center justify-center shrink-0";
  if (severity === "low") return "h-10 w-10 rounded-2xl bg-mint/30 text-primary flex items-center justify-center shrink-0";
  return "h-10 w-10 rounded-2xl bg-sun/25 text-primary flex items-center justify-center shrink-0";
}

function getScoreBreakdown(score: AiScore) {
  if (score.breakdown.length > 0) return score.breakdown;

  if (score.name.startsWith("Financial")) {
    return [
      "Tracks budget headroom, recurring costs, and spending spikes.",
      "Higher scores mean your month still has breathing room.",
      "Fresh transactions will update this score the next time AI refreshes.",
    ];
  }

  if (score.name.startsWith("Nutrition")) {
    return [
      "Tracks meal logging consistency and calorie balance.",
      "Stable nutrition patterns keep this score higher.",
      "New food logs will refresh the detail on the next AI update.",
    ];
  }

  return [
    "Tracks habit consistency across logging and budget control.",
    "Steadier daily behavior improves this score fastest.",
    "This view is using a fallback detail because the cached AI breakdown was empty.",
  ];
}
