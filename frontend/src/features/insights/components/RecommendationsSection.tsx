import { motion } from "framer-motion";
import { 
  AlertCircle, 
  AlertTriangle, 
  Lightbulb, 
  Trophy,
  Target
} from "lucide-react";
import type { Recommendation } from "../types";

interface RecommendationsSectionProps {
  recommendations: Recommendation[];
}

const categoryConfig = {
  critical: {
    icon: AlertCircle,
    bg: "bg-destructive/10",
    border: "border-destructive/20",
    iconBg: "bg-destructive/20",
    iconColor: "text-destructive",
    label: "Critical",
  },
  important: {
    icon: AlertTriangle,
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    iconBg: "bg-amber-500/20",
    iconColor: "text-amber-600",
    label: "Important",
  },
  suggestion: {
    icon: Lightbulb,
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    iconBg: "bg-blue-500/20",
    iconColor: "text-blue-500",
    label: "Suggestion",
  },
  win: {
    icon: Trophy,
    bg: "bg-mint/10",
    border: "border-mint/20",
    iconBg: "bg-mint/20",
    iconColor: "text-mint",
    label: "Win",
  },
};

export function RecommendationsSection({ recommendations }: RecommendationsSectionProps) {
  const critical = recommendations.filter(r => r.category === "critical");
  const important = recommendations.filter(r => r.category === "important");
  const wins = recommendations.filter(r => r.category === "win");
  const suggestions = recommendations.filter(r => r.category === "suggestion");

  const sections = [
    ...(critical.length > 0 ? [{ title: "Critical", items: critical, config: categoryConfig.critical }] : []),
    ...(important.length > 0 ? [{ title: "Important", items: important, config: categoryConfig.important }] : []),
    ...(wins.length > 0 ? [{ title: "Wins", items: wins, config: categoryConfig.win }] : []),
    ...(suggestions.length > 0 ? [{ title: "Suggestions", items: suggestions, config: categoryConfig.suggestion }] : []),
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 px-1">
        <Target className="h-4 w-4 text-primary" />
        <span className="text-xs uppercase tracking-[0.22em] text-muted-foreground font-bold">Recommendations</span>
      </div>

      <div className="space-y-4">
        {sections.map((section, sectionIndex) => {
          const { icon: Icon, bg, border, iconBg, iconColor, label } = section.config;
          
          return (
            <div key={section.title} className="space-y-2">
              <div className="flex items-center gap-2 px-1">
                <div className={`h-5 w-5 rounded-full ${iconBg} flex items-center justify-center`}>
                  <Icon className={`h-3 w-3 ${iconColor}`} />
                </div>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{label}</span>
              </div>
              
              <div className="space-y-2">
                {section.items.map((rec, index) => (
                  <motion.div
                    key={rec.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: sectionIndex * 0.1 + index * 0.05 }}
                    className={`${bg} rounded-[1.25rem] p-4 border ${border}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm">{rec.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{rec.description}</p>
                        {rec.impact && (
                          <p className="text-[10px] font-medium mt-2 px-2 py-1 rounded-full bg-background/50 inline-block">
                            {rec.impact}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}