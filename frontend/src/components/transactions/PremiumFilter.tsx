import { motion } from "framer-motion";
import { Search, X } from "lucide-react";

interface PremiumSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function PremiumSearchBar({ value, onChange, placeholder = "Search transactions..." }: PremiumSearchBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      <div className={`flex items-center gap-3 px-5 py-3.5 rounded-full border transition-all duration-200 ${
        value 
          ? "bg-surface-dark border-surface-dark/50" 
          : "bg-card border-border/30 hover:border-border/50"
      }`}>
        <motion.div
          animate={{ scale: value ? 1.1 : 1 }}
          transition={{ duration: 0.2 }}
        >
          <Search className={`h-4 w-4 transition-colors duration-200 ${value ? "text-primary-foreground" : "text-muted-foreground"}`} />
        </motion.div>
        
        <input
          type="text"
          className={`flex-1 bg-transparent outline-none text-sm transition-colors duration-200 ${
            value ? "text-primary-foreground placeholder:text-primary-foreground/40" : "text-foreground placeholder:text-muted-foreground/50"
          }`}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />

        {value && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onChange("")}
            className="p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="h-3.5 w-3.5 text-primary-foreground/60" />
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

interface PremiumCategoryFilterProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const categoryAccents: Record<string, string> = {
  All: "bg-gradient-to-r from-surface-dark to-surface-dark/80",
  Groceries: "bg-gradient-to-r from-emerald-600 to-emerald-700",
  Dining: "bg-gradient-to-r from-amber-500 to-amber-600",
  Transport: "bg-gradient-to-r from-sky-500 to-sky-600",
  Bills: "bg-gradient-to-r from-violet-500 to-violet-600",
  Entertainment: "bg-gradient-to-r from-pink-500 to-pink-600",
};

export function PremiumCategoryFilter({ categories, activeCategory, onCategoryChange }: PremiumCategoryFilterProps) {
  return (
    <div className="overflow-x-auto -mx-5 px-5 pb-1 no-scrollbar">
      <div className="flex gap-2">
        {categories.map((category, index) => {
          const isActive = category === activeCategory;
          const accentClass = categoryAccents[category] || categoryAccents.All;
          
          return (
            <motion.button
              key={category}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onCategoryChange(category)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`relative px-4 py-2.5 rounded-full text-sm font-medium capitalize whitespace-nowrap transition-all duration-200 ${
                isActive
                  ? `${accentClass} text-primary-foreground shadow-lg shadow-black/20`
                  : "bg-card text-muted-foreground shadow-soft hover:text-foreground border border-transparent hover:border-border/30"
              }`}
            >
              {category}
              
              {isActive && (
                <motion.div
                  layoutId="categoryIndicator"
                  className="absolute inset-0 rounded-full"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}