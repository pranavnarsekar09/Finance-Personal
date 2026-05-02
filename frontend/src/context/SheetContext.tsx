import { createContext } from "react";

export const SheetContext = createContext<{
  setMealOpen: (open: boolean) => void;
  setAddOpen: (open: boolean) => void;
  setChatOpen: (open: boolean) => void;
  setAnalyzeOpen: (open: boolean) => void;
}>({
  setMealOpen: () => {},
  setAddOpen: () => {},
  setChatOpen: () => {},
  setAnalyzeOpen: () => {},
});
