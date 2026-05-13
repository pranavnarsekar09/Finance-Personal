import { useState } from "react";
import { Check, Plus, Sun, Moon, AlertCircle, Edit2, Trash2, Download, FileText, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import { useGoals, useProfile, useSaveProfile, useSaveCategories, useMultipleExpenses, useMultipleFoodLogs, useFinance, useDashboard, useStorageUsage } from "@/hooks/useApi";
import { formatRupees } from "@/lib/utils";
import type { Goal, UserCategory } from "@/lib/types";
import { format, subMonths } from "date-fns";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function You() {
  const { data: profile, isLoading: profileLoading, error: profileError } = useProfile();
  const { data: goals, isLoading: goalsLoading } = useGoals();
  const saveProfile = useSaveProfile();
  const saveCategories = useSaveCategories();
  
  // Get current month and last 11 months for data export
  const currentMonth = format(new Date(), "yyyy-MM");
  const monthsToFetch = Array.from({ length: 12 }, (_, i) => format(subMonths(new Date(), 11 - i), "yyyy-MM"));
  
  const expensesQueries = useMultipleExpenses(profile?.userId || "", monthsToFetch, !!profile);
  const foodLogsQueries = useMultipleFoodLogs(profile?.userId || "", monthsToFetch, !!profile);
  
  const { data: finance } = useFinance(profile?.userId || "");
  const { data: dashboard } = useDashboard(profile?.userId || "", currentMonth);
  const { data: storageUsage, isLoading: storageUsageLoading } = useStorageUsage(!!profile);
  
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Category management state
  const [isCatDialogOpen, setIsCatDialogOpen] = useState(false);
  const [catToEdit, setCatToEdit] = useState<UserCategory | null>(null);
  const [catNameInput, setCatNameInput] = useState("");
  const [catBudgetInput, setCatBudgetInput] = useState("");

  const toggleTheme = (t: "light" | "dark") => {
    setTheme(t);
    document.documentElement.classList.toggle("dark", t === "dark");
    toast.success(`${t === "dark" ? "Dark" : "Light"} mode on`);
  };

  const initializeDemoProfile = async () => {
    try {
      await saveProfile.mutateAsync({
        name: "Demo User",
        email: "demo@example.com",
        monthlyBudget: 4000,
        calorieGoal: 2200,
        categories: [
          { name: "Groceries", budget: 600 },
          { name: "Dining", budget: 400 },
          { name: "Transport", budget: 200 },
          { name: "Shopping", budget: 500 },
          { name: "Bills", budget: 1500 },
        ],
      });
      toast.success("Profile initialized!");
    } catch (err: any) {
      toast.error(`Failed to initialize profile: ${err.message}`);
    }
  };

  const handleOpenAddCategory = () => {
    setCatToEdit(null);
    setCatNameInput("");
    setCatBudgetInput("");
    setIsCatDialogOpen(true);
  };

  const handleOpenEditCategory = (c: UserCategory) => {
    setCatToEdit(c);
    setCatNameInput(c.name);
    setCatBudgetInput(c.budget.toString());
    setIsCatDialogOpen(true);
  };

  const handleSaveCategory = async () => {
    if (!catNameInput || !catBudgetInput) {
      toast.error("Please fill in all fields");
      return;
    }

    const budget = parseFloat(catBudgetInput);
    if (isNaN(budget) || budget < 0) {
      toast.error("Invalid budget amount");
      return;
    }

    const currentCategories = [...(profile?.categories || [])];
    
    if (catToEdit) {
      // Edit existing
      const index = currentCategories.findIndex(c => c.name === catToEdit.name);
      if (index !== -1) {
        currentCategories[index] = { name: catNameInput, budget };
      }
    } else {
      // Add new
      if (currentCategories.some(c => c.name.toLowerCase() === catNameInput.toLowerCase())) {
        toast.error("Category already exists");
        return;
      }
      currentCategories.push({ name: catNameInput, budget });
    }

    try {
      await saveCategories.mutateAsync({ categories: currentCategories });
      toast.success(catToEdit ? "Category updated" : "Category added");
      setIsCatDialogOpen(false);
    } catch (err: any) {
      toast.error(`Failed to save: ${err.message}`);
    }
  };

  const handleDeleteCategory = async (name: string) => {
    const currentCategories = profile?.categories.filter(c => c.name !== name) || [];
    try {
      await saveCategories.mutateAsync({ categories: currentCategories });
      toast.success("Category deleted");
    } catch (err: any) {
      toast.error(`Failed to delete: ${err.message}`);
    }
  };

  const formatBytes = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(2)} MB`;

  const exportDataAsJSON = async () => {
    try {
      // Collect all expenses from the last 12 months
      const allExpenses = expensesQueries
        .flatMap(query => query.data || [])
        .filter((expense, index, self) => 
          self.findIndex(e => e.id === expense.id) === index // Remove duplicates
        );

      // Collect all food logs from the last 12 months
      const allFoodLogs = foodLogsQueries
        .flatMap(query => query.data || [])
        .filter((log, index, self) => 
          self.findIndex(l => l.id === log.id) === index // Remove duplicates
        );

      const dataToExport = {
        profile,
        goals,
        finance,
        dashboard,
        expenses: allExpenses,
        foodLogs: allFoodLogs,
        exportedAt: new Date().toISOString(),
        version: "1.0",
        exportPeriod: {
          months: monthsToFetch,
          totalExpenses: allExpenses.length,
          totalFoodLogs: allFoodLogs.length
        }
      };

      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tracker-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success(`Data exported! ${allExpenses.length} expenses, ${allFoodLogs.length} food logs`);
    } catch (err: any) {
      toast.error(`Failed to export data: ${err.message}`);
    }
  };

  const exportDataAsPDF = async () => {
    try {
      // Collect all expenses from the last 12 months
      const allExpenses = expensesQueries
        .flatMap(query => query.data || [])
        .filter((expense, index, self) => 
          self.findIndex(e => e.id === expense.id) === index // Remove duplicates
        );

      // Collect all food logs from the last 12 months
      const allFoodLogs = foodLogsQueries
        .flatMap(query => query.data || [])
        .filter((log, index, self) => 
          self.findIndex(l => l.id === log.id) === index // Remove duplicates
        );

      // Helper function for PDF formatting (avoid special characters)
      const formatAmountForPDF = (value: number) => `Rs. ${value.toLocaleString('en-IN')}`;

      const doc = new jsPDF();
      
      // Title
      doc.setFontSize(20);
      doc.text('Personal Finance Tracker - Data Export', 20, 20);
      doc.setFontSize(12);
      doc.text(`Exported on: ${new Date().toLocaleDateString()}`, 20, 30);
      doc.text(`User: ${profile?.name || 'N/A'}`, 20, 40);

      let yPosition = 50;

      // Profile Summary
      if (profile) {
        doc.setFontSize(16);
        doc.text('Profile Summary', 20, yPosition);
        yPosition += 10;
        
        const profileData = [
          ['Name', profile.name],
          ['Email', profile.email],
          ['Monthly Budget', formatAmountForPDF(profile.monthlyBudget)],
          ['Daily Calories', profile.calorieGoal.toString()],
        ];
        
        autoTable(doc, {
          startY: yPosition,
          head: [['Field', 'Value']],
          body: profileData,
          margin: { left: 20 },
        });
        
        yPosition = (doc as any).lastAutoTable.finalY + 20;
      }

      // Categories
      if (profile?.categories && profile.categories.length > 0) {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.setFontSize(16);
        doc.text('Categories', 20, yPosition);
        yPosition += 10;
        
        const categoryData = profile.categories.map(cat => [
          cat.name,
          formatAmountForPDF(cat.budget)
        ]);
        
        autoTable(doc, {
          startY: yPosition,
          head: [['Category', 'Budget']],
          body: categoryData,
          margin: { left: 20 },
        });
        
        yPosition = (doc as any).lastAutoTable.finalY + 20;
      }

      // Goals
      if (goals && goals.length > 0) {
        if (yPosition > 200) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.setFontSize(16);
        doc.text('Goals', 20, yPosition);
        yPosition += 10;
        
        const goalData = goals.map(goal => [
          goal.type === 'SAVINGS' ? 'Savings' : 'Calorie',
          goal.targetAmount.toString(),
          goal.currentAmount.toString(),
          new Date(goal.deadline).toLocaleDateString()
        ]);
        
        autoTable(doc, {
          startY: yPosition,
          head: [['Type', 'Target', 'Current', 'Deadline']],
          body: goalData,
          margin: { left: 20 },
        });
        
        yPosition = (doc as any).lastAutoTable.finalY + 20;
      }

      // Recent Expenses (last 50 for PDF)
      if (allExpenses.length > 0) {
        doc.addPage();
        yPosition = 20;
        
        doc.setFontSize(16);
        doc.text('Recent Expenses', 20, yPosition);
        yPosition += 10;
        
        const expenseData = allExpenses.slice(0, 50).map(expense => [
          new Date(expense.date).toLocaleDateString(),
          expense.categoryName,
          formatAmountForPDF(expense.amount),
          expense.paymentMethod,
          expense.note || ''
        ]);
        
        autoTable(doc, {
          startY: yPosition,
          head: [['Date', 'Category', 'Amount', 'Payment', 'Note']],
          body: expenseData,
          margin: { left: 20 },
        });
        
        if (allExpenses.length > 50) {
          yPosition = (doc as any).lastAutoTable.finalY + 10;
          doc.setFontSize(10);
          doc.text(`Showing first 50 of ${allExpenses.length} expenses`, 20, yPosition);
        }
      }

      // Recent Food Logs (last 50 for PDF)
      if (allFoodLogs.length > 0) {
        doc.addPage();
        yPosition = 20;
        
        doc.setFontSize(16);
        doc.text('Recent Food Logs', 20, yPosition);
        yPosition += 10;
        
        const foodData = allFoodLogs.slice(0, 50).map(log => [
          new Date(log.date).toLocaleDateString(),
          log.foodName,
          log.calories.toString(),
          log.protein.toString(),
          log.carbs.toString(),
          log.fat.toString(),
          formatAmountForPDF(log.estimatedCost)
        ]);
        
        autoTable(doc, {
          startY: yPosition,
          head: [['Date', 'Food', 'Calories', 'Protein', 'Carbs', 'Fat', 'Cost']],
          body: foodData,
          margin: { left: 20 },
        });
        
        if (allFoodLogs.length > 50) {
          yPosition = (doc as any).lastAutoTable.finalY + 10;
          doc.setFontSize(10);
          doc.text(`Showing first 50 of ${allFoodLogs.length} food logs`, 20, yPosition);
        }
      }

      // Save the PDF
      doc.save(`tracker-data-${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast.success('PDF exported successfully!');
    } catch (err: any) {
      toast.error(`Failed to export PDF: ${err.message}`);
    }
  };

  const exportDataAsExcel = async () => {
    try {
      // Collect all expenses from the last 12 months
      const allExpenses = expensesQueries
        .flatMap(query => query.data || [])
        .filter((expense, index, self) => 
          self.findIndex(e => e.id === expense.id) === index // Remove duplicates
        );

      // Collect all food logs from the last 12 months
      const allFoodLogs = foodLogsQueries
        .flatMap(query => query.data || [])
        .filter((log, index, self) => 
          self.findIndex(l => l.id === log.id) === index // Remove duplicates
        );

      const workbook = XLSX.utils.book_new();

      // Profile Sheet
      if (profile) {
        const profileData = [
          ['Field', 'Value'],
          ['Name', profile.name],
          ['Email', profile.email],
          ['Monthly Budget', profile.monthlyBudget],
          ['Daily Calories', profile.calorieGoal],
          ['User ID', profile.userId],
          ['Created At', new Date(profile.createdAt).toLocaleString()],
          ['Onboarding Complete', profile.onboardingComplete ? 'Yes' : 'No']
        ];
        const profileSheet = XLSX.utils.aoa_to_sheet(profileData);
        XLSX.utils.book_append_sheet(workbook, profileSheet, 'Profile');
      }

      // Categories Sheet
      if (profile?.categories && profile.categories.length > 0) {
        const categoryData = [
          ['Category Name', 'Budget Amount'],
          ...profile.categories.map(cat => [cat.name, cat.budget])
        ];
        const categorySheet = XLSX.utils.aoa_to_sheet(categoryData);
        XLSX.utils.book_append_sheet(workbook, categorySheet, 'Categories');
      }

      // Goals Sheet
      if (goals && goals.length > 0) {
        const goalData = [
          ['Type', 'Target Amount', 'Current Amount', 'Deadline', 'Progress (%)', 'Created At'],
          ...goals.map(goal => [
            goal.type === 'SAVINGS' ? 'Savings Goal' : 'Calorie Goal',
            goal.targetAmount,
            goal.currentAmount,
            new Date(goal.deadline).toLocaleDateString(),
            goal.progress ? goal.progress.toFixed(1) : '0.0',
            new Date(goal.createdAt).toLocaleString()
          ])
        ];
        const goalSheet = XLSX.utils.aoa_to_sheet(goalData);
        XLSX.utils.book_append_sheet(workbook, goalSheet, 'Goals');
      }

      // Expenses Sheet
      if (allExpenses.length > 0) {
        const expenseData = [
          ['Date', 'Category', 'Amount', 'Payment Method', 'Note', 'Recurring', 'Created At'],
          ...allExpenses.map(expense => [
            new Date(expense.date).toLocaleDateString(),
            expense.categoryName,
            expense.amount,
            expense.paymentMethod,
            expense.note || '',
            expense.isRecurring ? 'Yes' : 'No',
            new Date(expense.createdAt).toLocaleString()
          ])
        ];
        const expenseSheet = XLSX.utils.aoa_to_sheet(expenseData);
        XLSX.utils.book_append_sheet(workbook, expenseSheet, 'Expenses');
      }

      // Food Logs Sheet
      if (allFoodLogs.length > 0) {
        const foodData = [
          ['Date', 'Food Name', 'Calories', 'Protein (g)', 'Carbs (g)', 'Fat (g)', 'Estimated Cost', 'Note', 'Created At'],
          ...allFoodLogs.map(log => [
            new Date(log.date).toLocaleDateString(),
            log.foodName,
            log.calories,
            log.protein,
            log.carbs,
            log.fat,
            log.estimatedCost,
            log.note || '',
            new Date(log.createdAt).toLocaleString()
          ])
        ];
        const foodSheet = XLSX.utils.aoa_to_sheet(foodData);
        XLSX.utils.book_append_sheet(workbook, foodSheet, 'Food Logs');
      }

      // Finance Sheet
      if (finance) {
        const financeData = [
          ['Field', 'Value'],
          ['Daily Budget', finance.dailyBudget || 'N/A'],
          ['Weekly Budget', finance.weeklyBudget || 'N/A'],
          ['Monthly Budget', finance.monthlyBudget || 'N/A'],
          ['Savings Goal', finance.savingsGoal || 'N/A'],
          ['Current Savings', finance.currentSavings || 'N/A']
        ];
        const financeSheet = XLSX.utils.aoa_to_sheet(financeData);
        XLSX.utils.book_append_sheet(workbook, financeSheet, 'Finance');
      }

      // Dashboard Summary Sheet
      if (dashboard) {
        const dashboardData = [
          ['Field', 'Value'],
          ['Monthly Budget', dashboard.monthlyBudget],
          ['Total Spent', dashboard.totalSpent],
          ['Remaining Budget', dashboard.remainingBudget],
          ['Daily Calories Goal', dashboard.calorieGoal],
          ['Calories Today', dashboard.caloriesToday],
          ['Monthly Food Cost', dashboard.monthlyFoodCost],
          ['Streak', dashboard.streak]
        ];
        const dashboardSheet = XLSX.utils.aoa_to_sheet(dashboardData);
        XLSX.utils.book_append_sheet(workbook, dashboardSheet, 'Dashboard');

        // Category Spending Sheet
        if (dashboard.categorySpending && dashboard.categorySpending.length > 0) {
          const categorySpendingData = [
            ['Category', 'Budget', 'Spent', 'Progress (%)'],
            ...dashboard.categorySpending.map(cat => [
              cat.categoryName,
              cat.budget,
              cat.spent,
              cat.progress ? cat.progress.toFixed(1) : '0.0'
            ])
          ];
          const categorySpendingSheet = XLSX.utils.aoa_to_sheet(categorySpendingData);
          XLSX.utils.book_append_sheet(workbook, categorySpendingSheet, 'Category Spending');
        }

        // Daily Spending Sheet
        if (dashboard.dailySpending && dashboard.dailySpending.length > 0) {
          const dailySpendingData = [
            ['Date', 'Amount'],
            ...dashboard.dailySpending.map(day => [
              new Date(day.date).toLocaleDateString(),
              day.amount
            ])
          ];
          const dailySpendingSheet = XLSX.utils.aoa_to_sheet(dailySpendingData);
          XLSX.utils.book_append_sheet(workbook, dailySpendingSheet, 'Daily Spending');
        }
      }

      // Save the Excel file
      XLSX.writeFile(workbook, `tracker-data-${new Date().toISOString().split('T')[0]}.xlsx`);
      
      toast.success('Excel file exported successfully!');
    } catch (err: any) {
      toast.error(`Failed to export Excel: ${err.message}`);
    }
  };

  if (profileLoading || goalsLoading) {
    return <div className="p-10 text-center animate-pulse">Loading profile...</div>;
  }

  if (profileError || !profile) {
    return (
      <div className="p-10 text-center space-y-4">
        <div className="h-16 w-16 bg-secondary rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-bold">Profile Not Found</h2>
        <p className="text-sm text-muted-foreground">It looks like your profile hasn&apos;t been set up yet.</p>
        <button
          onClick={initializeDemoProfile}
          disabled={saveProfile.isPending}
          className="bg-surface-dark text-primary-foreground px-6 py-3 rounded-full font-medium"
        >
          {saveProfile.isPending ? "Initializing..." : "Initialize Demo Profile"}
        </button>
      </div>
    );
  }

  const initials = profile.name ? profile.name.split(" ").map((n: string) => n[0]).join("").toUpperCase() : "U";
  const savingsGoals = (goals || []).filter((goal: Goal) => goal.type === "SAVINGS");

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">Profile</div>
        <div className="h-11 w-11 rounded-full bg-gradient-mint flex items-center justify-center font-bold text-primary shadow-soft">
          {initials}
        </div>
      </div>

      <h1 className="font-display text-4xl font-bold tracking-tight">You</h1>

      <div className="bg-card rounded-[1.75rem] shadow-soft p-5 flex items-center gap-4 border border-border/30 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 h-24 w-24 bg-mint/20 rounded-full blur-2xl" />
        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-mint to-emerald-400 flex items-center justify-center text-2xl font-display font-bold text-primary shadow-lg shadow-mint/30">
          {initials}
        </div>
        <div className="flex-1">
          <div className="font-display text-xl font-bold">{profile.name}</div>
          <div className="text-xs text-muted-foreground">{profile.email}</div>
        </div>
        <button className="text-xs text-primary font-medium hover:opacity-80 transition">Edit</button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card rounded-2xl shadow-soft p-4 border border-border/30 hover:border-mint/20 transition-colors">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Monthly Budget</div>
          <div className="font-display text-2xl font-bold mt-1 text-mint">{formatRupees(profile.monthlyBudget)}</div>
        </div>
        <div className="bg-card rounded-2xl shadow-soft p-4 border border-border/30 hover:border-mint/20 transition-colors">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Daily Calories</div>
          <div className="font-display text-2xl font-bold mt-1">{profile.calorieGoal.toLocaleString()}</div>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs uppercase tracking-widest text-muted-foreground">Categories</span>
          <button 
            onClick={handleOpenAddCategory}
            className="text-xs text-primary font-medium flex items-center gap-1 hover:opacity-80 transition"
          >
            <Plus className="h-3 w-3" />
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {profile.categories.map((c: UserCategory) => (
            <div 
              key={c.name} 
              className="group bg-card rounded-full shadow-soft px-3 py-2 flex items-center gap-2 text-sm relative overflow-hidden"
            >
              <span className="w-5 text-center">{c.name.charAt(0)}</span>
              <span className="font-medium">{c.name}</span>
              <span className="text-muted-foreground text-xs">{formatRupees(c.budget)}</span>
              
              <div className="flex items-center gap-1 ml-1 pl-2 border-l border-border opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleOpenEditCategory(c)}
                  className="p-1 hover:text-primary transition"
                  title="Edit"
                >
                  <Edit2 className="h-3 w-3" />
                </button>
                <button 
                  onClick={() => handleDeleteCategory(c.name)}
                  className="p-1 hover:text-destructive transition"
                  title="Delete"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Savings Jars</div>
        <div className="space-y-3">
          {savingsGoals.map((j: Goal) => {
            const pct = Math.min(100, j.progress || (j.targetAmount > 0 ? (j.currentAmount / j.targetAmount) * 100 : 0));
            return (
              <div key={j.id} className="bg-card rounded-2xl shadow-soft p-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Savings Goal</span>
                  <span className="text-sm text-muted-foreground">{formatRupees(j.targetAmount)}</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden mt-2">
                  <div className="h-full bg-gradient-mint rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <div className="text-xs text-muted-foreground mt-1">{Math.round(pct)}% complete</div>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Appearance</div>
        <div className="grid grid-cols-2 gap-3">
          {([
            { id: "light" as const, label: "Light", Icon: Sun, bg: "bg-gradient-to-br from-[#f8f6f3] to-[#e8e5e0] border-border/30 hover:border-mint/40" },
            { id: "dark" as const, label: "Dark", Icon: Moon, bg: "bg-gradient-to-br from-[#1a1f1c] to-[#0f1210] text-primary-foreground border-white/5 hover:border-mint/40" },
          ]).map(({ id, label, Icon, bg }) => (
            <button
              key={id}
              onClick={() => toggleTheme(id)}
              className={`relative ${bg} rounded-2xl p-5 shadow-soft flex flex-col items-start gap-2 border-2 transition-all duration-200 ${theme === id ? "border-primary shadow-lg shadow-mint/20" : ""}`}
            >
              <Icon className={`h-5 w-5 ${id === 'dark' ? 'text-mint' : 'text-amber-500'}`} />
              <span className="font-semibold">{label}</span>
              {theme === id && (
                <div className="absolute top-3 right-3 h-6 w-6 rounded-full bg-mint text-primary flex items-center justify-center shadow-md">
                  <Check className="h-3 w-3" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Data Management</div>
        <div className="space-y-3">
          <div className="bg-card rounded-2xl shadow-soft p-4">
            <div className="text-sm font-semibold mb-3">Storage Usage</div>
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <div className="text-xs text-muted-foreground">MongoDB Atlas</div>
                <div className="font-display text-xl font-bold mt-1">
                  {storageUsage ? formatBytes(storageUsage.usedBytes) : storageUsageLoading ? "Calculating..." : "Unavailable"}
                </div>
              </div>
              <div className="text-right text-xs text-muted-foreground">
                {storageUsage ? `${Math.round(storageUsage.usedPercentage)}%` : "--"}
              </div>
            </div>
            <div className="h-3 w-full bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-mint rounded-full transition-all duration-300"
                style={{ width: `${storageUsage?.usedPercentage ?? 0}%` }}
              />
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              {storageUsage
                ? `${formatBytes(storageUsage.usedBytes)} of ${formatBytes(storageUsage.totalBytes)} used`
                : storageUsageLoading
                ? "Checking storage usage..."
                : "Storage data unavailable"}
            </div>
          </div>
          <div className="bg-card rounded-2xl shadow-soft p-4">
            <div className="text-sm font-semibold mb-3">Export Your Data</div>
            <p className="text-xs text-muted-foreground mb-4">
              Download all your transactions, goals, and profile data in your preferred format.
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={exportDataAsJSON}
                className="flex flex-col items-center gap-2 p-3 bg-secondary rounded-xl hover:bg-secondary/80 transition"
              >
                <FileText className="h-5 w-5 text-primary" />
                <span className="text-xs font-medium">JSON</span>
              </button>
              <button
                onClick={exportDataAsPDF}
                className="flex flex-col items-center gap-2 p-3 bg-secondary rounded-xl hover:bg-secondary/80 transition"
              >
                <Download className="h-5 w-5 text-primary" />
                <span className="text-xs font-medium">PDF</span>
              </button>
              <button
                onClick={exportDataAsExcel}
                className="flex flex-col items-center gap-2 p-3 bg-secondary rounded-xl hover:bg-secondary/80 transition"
              >
                <FileSpreadsheet className="h-5 w-5 text-primary" />
                <span className="text-xs font-medium">Excel</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isCatDialogOpen} onOpenChange={setIsCatDialogOpen}>
        <DialogContent className="rounded-[1.75rem] max-w-[90vw] sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">{catToEdit ? "Edit Category" : "Add Category"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs uppercase tracking-widest text-muted-foreground">Category Name</Label>
              <Input
                id="name"
                value={catNameInput}
                onChange={(e) => setCatNameInput(e.target.value)}
                placeholder="e.g. Entertainment"
                className="rounded-2xl h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget" className="text-xs uppercase tracking-widest text-muted-foreground">Monthly Budget (₹)</Label>
              <Input
                id="budget"
                type="number"
                value={catBudgetInput}
                onChange={(e) => setCatBudgetInput(e.target.value)}
                placeholder="0.00"
                className="rounded-2xl h-12"
              />
            </div>
          </div>
          <DialogFooter className="flex-row gap-2">
            <Button 
              variant="secondary" 
              onClick={() => setIsCatDialogOpen(false)}
              className="flex-1 rounded-full h-12 font-medium"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveCategory}
              disabled={saveCategories.isPending}
              className="flex-1 bg-surface-dark text-primary-foreground rounded-full h-12 font-medium"
            >
              {saveCategories.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
