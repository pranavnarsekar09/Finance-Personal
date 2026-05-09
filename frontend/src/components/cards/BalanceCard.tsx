import { useEffect, useState } from "react";
import { motion } from "framer-motion";
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
      className="bg-card rounded-[2rem] shadow-soft p-2 pb-3"
    >
      <div className="flex justify-between items-center px-4 py-3">
        <span className="text-sm font-medium">{userName} Pass</span>
        <span className="text-xs text-muted-foreground">Swipe Cards</span>
      </div>

      <Carousel setApi={setApi} opts={{ align: "start" }} className="bg-surface-dark rounded-[1.5rem] relative overflow-hidden">
        <div className="absolute inset-0 opacity-30 grain pointer-events-none" />
        <div className="absolute top-4 right-4 z-10 bg-gradient-mint rounded-full px-2.5 py-1 text-xs font-bold text-primary italic font-display">
          zeni
        </div>
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
                  <div className="mt-4 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(0, Math.min(slide.progress, 100))}%` }}
                      transition={{ duration: 1.1, ease: "easeOut" }}
                      className="h-full bg-mint rounded-full"
                    />
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div className="flex gap-1">
                      {slides.map((_, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => api?.scrollTo(index)}
                          aria-label={`Go to card ${index + 1}`}
                          className={`h-1.5 rounded-full transition-all ${activeIndex === index ? "w-5 bg-mint" : "w-1.5 bg-white/20"}`}
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
        <div className="rounded-[1.35rem] bg-secondary/70 px-4 py-3.5">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Latest Expense</div>
              <div className="mt-1 truncate text-sm font-semibold">
                {latestExpense?.note?.trim() || latestExpense?.categoryName || "No recent expense"}
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
