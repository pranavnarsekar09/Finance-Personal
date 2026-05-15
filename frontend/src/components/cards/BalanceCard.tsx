import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Carousel, CarouselApi, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { formatRupees } from "@/lib/utils";
import type { Expense } from "@/lib/types";

interface BalanceCardProps {
  total: number;
  spent: number;
  todaySpent: number;
  available: number;
  savings: number;
  savingsChange: number;
  dailyLimit: number;
  userName: string;
  monthlySavings: number;
  latestExpense?: Expense | null;
}

export function BalanceCard({ total, spent, todaySpent, available, savings, savingsChange, dailyLimit, userName, monthlySavings, latestExpense }: BalanceCardProps) {
  const navigate = useNavigate();
  const [api, setApi] = useState<CarouselApi>();
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }

    const updateSelection = () => {
      setActiveIndex(api.selectedScrollSnap());
    };

    updateSelection();
    api.on("select", updateSelection);
    api.on("reInit", updateSelection);

    return () => {
      api.off("select", updateSelection);
      api.off("reInit", updateSelection);
    };
  }, [api]);

  const slides = [
    {
      label: "Available Balance",
      amount: available,
      caption: `${formatRupees(total)} monthly budget`,
      progress: total > 0 ? (available / total) * 100 : 0,
    },
    {
      label: "Today's Spend",
      amount: todaySpent,
      caption: `Used ${formatRupees(todaySpent)} today`,
      progress: total > 0 ? (todaySpent / total) * 100 : 0,
    },
    {
      label: "Savings Jar",
      amount: savings,
      caption: savingsChange >= 0 ? `${formatRupees(savingsChange)} added today` : `${formatRupees(Math.abs(savingsChange))} used today`,
      progress: total > 0 ? (savings / total) * 100 : 0,
    },
    {
      label: "Monthly Savings",
      amount: monthlySavings,
      caption: `Saved based on daily limit this month`,
      progress: total > 0 ? (monthlySavings / total) * 100 : 0,
    },
  ];

  return (
    <motion.div
      data-swipe-ignore
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.05, duration: 0.5 }}
      className="bg-card rounded-[2rem] shadow-soft p-2 pb-3 border border-border/30"
    >
      <div className="flex justify-between items-center px-4 py-3">
        <span className="text-sm font-medium">{userName} Pass</span>
        <span className="text-xs text-muted-foreground flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-mint animate-pulse" />
          Swipe Cards
        </span>
      </div>

      <Carousel setApi={setApi} opts={{ align: "start" }} className="bg-gradient-to-br from-surface-dark to-[#1a2f25] rounded-[1.5rem] relative overflow-hidden border border-white/5">
        <div className="absolute inset-0 opacity-20 grain pointer-events-none" />
        <div className="absolute top-4 right-4 z-10 bg-gradient-mint rounded-full px-2.5 py-1 text-xs font-bold text-primary italic font-display shadow-lg shadow-mint/20">
          zeni
        </div>
        <div className="absolute -bottom-10 -left-10 h-32 w-32 bg-mint/10 rounded-full blur-3xl" />
        <div className="absolute -top-10 -right-10 h-24 w-24 bg-coral/10 rounded-full blur-2xl" />
        <CarouselContent className="ml-0">
          {slides.map((slide) => (
            <CarouselItem key={slide.label} className="pl-0">
              <div className="p-5 relative min-h-[236px] flex flex-col justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[0.22em] text-mint/70">{slide.label}</div>
                  <div className="mt-6 font-display text-5xl font-bold text-primary-foreground tracking-tight">
                    {formatRupees(slide.amount)}
                  </div>
                  <div className="text-xs text-mint/70 mt-2">{slide.caption}</div>
                </div>

                <div>
                  <div className="mt-4 h-2 bg-white/10 rounded-full overflow-hidden shadow-inner">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(0, Math.min(slide.progress, 100))}%` }}
                      transition={{ duration: 1.1, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-mint to-emerald-400 rounded-full shadow-[0_0_10px_rgba(145,197,150,0.5)]"
                    />
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div className="flex gap-1.5">
                      {slides.map((_, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => api?.scrollTo(index)}
                          aria-label={`Go to card ${index + 1}`}
                          className={`h-1.5 rounded-full transition-all duration-300 ${activeIndex === index ? "w-6 bg-mint shadow-[0_0_8px_rgba(145,197,150,0.6)]" : "w-1.5 bg-white/20 hover:bg-white/40"}`}
                        />
                      ))}
                    </div>
                    <div className="rounded-full bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-mint shadow-sm">
                      Daily limit {formatRupees(dailyLimit)}
                    </div>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      <div className="px-2 pt-3">
        <div 
          onClick={() => navigate("/money?tab=transactions")}
          className="rounded-[1.35rem] bg-gradient-to-br from-secondary/70 to-secondary/50 px-4 py-3.5 cursor-pointer hover:from-secondary/80 hover:to-secondary/60 transition active:scale-[0.98] border border-border/30"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Latest Expense</div>
              <div className="mt-1 truncate text-sm font-semibold">
                {latestExpense?.note?.split(" | ")[0] || latestExpense?.categoryName || "No recent expense"}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {latestExpense?.categoryName || "Your next expense will show here"}
              </div>
            </div>
            <div className="shrink-0 text-right">
              <div className="font-display text-lg font-bold text-foreground">
                {latestExpense ? formatRupees(latestExpense.amount) : formatRupees(0)}
              </div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                {latestExpense?.paymentMethod || ""}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
