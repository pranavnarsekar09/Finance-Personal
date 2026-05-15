import { motion } from "framer-motion";
import { Sparkles, Brain } from "lucide-react";
import { format } from "date-fns";
import { HeroSection } from "./HeroSection";
import { WeeklySummaryBanner } from "./WeeklySummaryBanner";
import { CompositeScoreSection } from "./CompositeScoreSection";
import { FinancialIntelligenceSection } from "./FinancialIntelligenceSection";
import { HealthIntelligenceSection } from "./HealthIntelligenceSection";
import { BehavioralPatternsSection } from "./BehavioralPatternsSection";
import { PredictionsSection } from "./PredictionsSection";
import { RecommendationsSection } from "./RecommendationsSection";
import { AICoachFeed } from "./AICoachFeed";
import { useInsightsData } from "../hooks/useInsights";

export function InsightsPage() {
  const { data, isLoading, isError } = useInsightsData();

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-48 bg-secondary rounded-[2rem]" />
          <div className="h-24 bg-secondary rounded-[1.5rem]" />
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map(i => <div key={i} className="h-28 bg-secondary rounded-[1.5rem]" />)}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-secondary rounded-[1.5rem]" />)}
          </div>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-6">
        <div className="bg-card rounded-[2rem] shadow-soft p-8 text-center border border-border/30">
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
    <div className="space-y-6 pb-8">
      {/* 1. Hero Section */}
      <HeroSection 
        compositeScore={data.compositeScore}
        scores={data.scores}
        systemStatus={data.systemStatus}
      />

      {/* 2. Weekly Summary Banner */}
      <WeeklySummaryBanner summaries={data.weeklySummaries} />

      {/* 3. Composite Score Section */}
      <CompositeScoreSection scores={data.scores} />

      {/* 4. Financial Intelligence Section */}
      <FinancialIntelligenceSection insights={data.financialInsights} />

      {/* 5. Health Intelligence Section */}
      <HealthIntelligenceSection insights={data.healthInsights} />

      {/* 6. Behavioral Patterns Section */}
      <BehavioralPatternsSection 
        dayPatterns={data.dayPatterns}
        behavioralPatterns={data.behavioralPatterns}
      />

      {/* 7. Predictions Section */}
      <PredictionsSection predictions={data.predictions} />

      {/* 8. Recommendations Section */}
      <RecommendationsSection recommendations={data.recommendations} />

      {/* 9. AI Coach Feed */}
      <AICoachFeed messages={data.coachMessages} />
    </div>
  );
}