import { motion } from "framer-motion";
import { 
  Bot, 
  AlertCircle, 
  CheckCircle2, 
  Lightbulb, 
  Sparkles,
  AlertTriangle,
  DollarSign,
  Utensils,
  Heart
} from "lucide-react";
import type { CoachMessage } from "../types";
import { formatDistanceToNow } from "date-fns";

interface AICoachFeedProps {
  messages: CoachMessage[];
}

const typeConfig = {
  alert: {
    icon: AlertCircle,
    bg: "bg-coral/10",
    border: "border-coral/20",
    iconBg: "bg-coral/20",
    iconColor: "text-coral",
  },
  success: {
    icon: CheckCircle2,
    bg: "bg-mint/10",
    border: "border-mint/20",
    iconBg: "bg-mint/20",
    iconColor: "text-mint",
  },
  insight: {
    icon: Sparkles,
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
    iconBg: "bg-violet-500/20",
    iconColor: "text-violet-500",
  },
  tip: {
    icon: Lightbulb,
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    iconBg: "bg-blue-500/20",
    iconColor: "text-blue-500",
  },
  warning: {
    icon: AlertTriangle,
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    iconBg: "bg-amber-500/20",
    iconColor: "text-amber-600",
  },
};

const categoryIcons = {
  financial: DollarSign,
  nutrition: Utensils,
  habits: Heart,
};

export function AICoachFeed({ messages }: AICoachFeedProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 px-1">
        <Bot className="h-4 w-4 text-primary" />
        <span className="text-xs uppercase tracking-[0.22em] text-muted-foreground font-bold">AI Coach Feed</span>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-4 bottom-4 w-px bg-gradient-to-b from-mint/50 via-violet-500/50 to-coral/50" />

        <div className="space-y-3">
          {messages.length === 0 ? (
            <div className="bg-card rounded-[1.5rem] shadow-soft p-5 border border-border/30 text-center">
              <Bot className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">AI Coach is listening...</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Keep logging to get personalized coaching</p>
            </div>
          ) : (
            messages.map((message, index) => {
              const config = typeConfig[message.type];
              const Icon = config.icon;
              const CategoryIcon = categoryIcons[message.category];
              const timeAgo = formatDistanceToNow(new Date(message.timestamp), { addSuffix: true });
              
              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className="relative pl-10"
                >
                  {/* Timeline dot */}
                  <div className={`absolute left-4 top-4 h-4 w-4 rounded-full ${config.iconBg} flex items-center justify-center z-10`}>
                    <Icon className={`h-2 w-2 ${config.iconColor}`} />
                  </div>

                  <div className={`${config.bg} rounded-[1.25rem] p-4 border ${config.border}`}>
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium leading-snug">{message.message}</p>
                      {CategoryIcon && (
                        <div className="shrink-0 h-6 w-6 rounded-full bg-background/50 flex items-center justify-center">
                          <CategoryIcon className="h-3 w-3 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[9px] text-muted-foreground">{timeAgo}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-background/50 text-muted-foreground capitalize">
                        {message.category}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* Premium footer */}
      <div className="bg-gradient-to-r from-violet-500/10 via-mint/10 to-coral/10 rounded-[1.5rem] p-4 border border-white/5 text-center">
        <p className="text-xs text-muted-foreground">
          AI Coach continuously learns from your patterns
        </p>
        <p className="text-[10px] text-muted-foreground/70 mt-1">
          More data = smarter insights
        </p>
      </div>
    </div>
  );
}