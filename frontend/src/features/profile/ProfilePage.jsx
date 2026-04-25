import { useMemo, useState } from "react";
import { useAsync } from "../../hooks/useAsync";
import { api } from "../../lib/api";
import { USER_ID } from "../../lib/constants";
import { currency } from "../../lib/utils";
import { PageHeader } from "../../components/layout/PageHeader";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { ProgressBar } from "../../components/ui/ProgressBar";

export function ProfilePage({ profile, onProfileUpdate }) {
  const initialCategories = profile?.categories || [];
  const [form, setForm] = useState({
    name: profile.name,
    email: profile.email,
    monthlyBudget: profile.monthlyBudget,
    calorieGoal: profile.calorieGoal,
  });
  const [categories, setCategories] = useState(initialCategories);
  const [goalForm, setGoalForm] = useState({
    type: "SAVINGS",
    targetAmount: "",
    currentAmount: "",
    deadline: "",
  });
  const { data: goals, setData } = useAsync(() => api.getGoals(USER_ID), [], { initialData: [] });

  const submitProfile = async (event) => {
    event.preventDefault();
    const updated = await api.saveProfile(USER_ID, {
      ...form,
      monthlyBudget: Number(form.monthlyBudget),
      calorieGoal: Number(form.calorieGoal),
      categories,
    });
    onProfileUpdate(updated);
  };

  const saveCategories = async () => {
    const updated = await api.saveCategories(USER_ID, { categories });
    onProfileUpdate(updated);
  };

  const addGoal = async (event) => {
    event.preventDefault();
    const created = await api.addGoal({
      userId: USER_ID,
      type: goalForm.type,
      targetAmount: Number(goalForm.targetAmount),
      currentAmount: Number(goalForm.currentAmount),
      deadline: goalForm.deadline,
    });
    setData([created, ...(goals || [])]);
    setGoalForm({ type: "SAVINGS", targetAmount: "", currentAmount: "", deadline: "" });
  };

  const totalCategoryBudget = useMemo(
    () => categories.reduce((sum, category) => sum + Number(category.budget || 0), 0),
    [categories],
  );

  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="Profile"
        title="Edit the system, not just the data."
        description="Adjust your profile, rebalance budgets, and create long-running goals without hardcoded assumptions."
      />

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-4">
          <Card>
            <h2 className="text-2xl font-semibold text-slate-900">Profile Settings</h2>
            <form className="mt-5 space-y-4" onSubmit={submitProfile}>
              <input className="text-input" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Name" />
              <input className="text-input" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="Email" />
              <input className="text-input" type="number" value={form.monthlyBudget} onChange={(event) => setForm({ ...form, monthlyBudget: event.target.value })} placeholder="Monthly budget" />
              <input className="text-input" type="number" value={form.calorieGoal} onChange={(event) => setForm({ ...form, calorieGoal: event.target.value })} placeholder="Calorie goal" />
              <Button className="w-full" type="submit">Save Profile</Button>
            </form>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">Goals</h2>
                <p className="text-sm text-slate-500">Savings and calorie goals</p>
              </div>
            </div>
            <form className="mt-5 grid gap-3 md:grid-cols-2" onSubmit={addGoal}>
              <select className="select-input" value={goalForm.type} onChange={(event) => setGoalForm({ ...goalForm, type: event.target.value })}>
                <option value="SAVINGS">Savings</option>
                <option value="CALORIE">Calorie</option>
              </select>
              <input className="text-input" type="number" value={goalForm.targetAmount} onChange={(event) => setGoalForm({ ...goalForm, targetAmount: event.target.value })} placeholder="Target" />
              <input className="text-input" type="number" value={goalForm.currentAmount} onChange={(event) => setGoalForm({ ...goalForm, currentAmount: event.target.value })} placeholder="Current" />
              <input className="text-input" type="date" value={goalForm.deadline} onChange={(event) => setGoalForm({ ...goalForm, deadline: event.target.value })} />
              <Button className="md:col-span-2" type="submit">Create Goal</Button>
            </form>

            <div className="mt-5 space-y-4">
              {(goals || []).map((goal) => (
                <div key={goal.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-medium text-slate-900">{goal.type}</span>
                    <span className="text-sm text-slate-500">{goal.progress.toFixed(0)}%</span>
                  </div>
                  <ProgressBar value={goal.progress} total={100} tone="green" />
                  <p className="mt-3 text-sm text-slate-500">
                    {currency(goal.currentAmount)} of {currency(goal.targetAmount)} • due {goal.deadline}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Manage Categories</h2>
              <p className="text-sm text-slate-500">{currency(totalCategoryBudget)} allocated across your custom categories</p>
            </div>
            <Button type="button" onClick={() => setCategories([...categories, { name: "", budget: 0 }])}>Add Category</Button>
          </div>
          <div className="mt-5 space-y-3">
            {categories.map((category, index) => (
              <div key={`${category.name}-${index}`} className="grid gap-3 md:grid-cols-[1fr_160px_80px]">
                <input
                  className="text-input"
                  value={category.name}
                  onChange={(event) => {
                    const next = [...categories];
                    next[index] = { ...next[index], name: event.target.value };
                    setCategories(next);
                  }}
                  placeholder="Category name"
                />
                <input
                  className="text-input"
                  type="number"
                  value={category.budget}
                  onChange={(event) => {
                    const next = [...categories];
                    next[index] = { ...next[index], budget: Number(event.target.value) };
                    setCategories(next);
                  }}
                  placeholder="Budget"
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setCategories(categories.filter((_, categoryIndex) => categoryIndex !== index))}
                >
                  Delete
                </Button>
              </div>
            ))}
          </div>
          <Button className="mt-5" onClick={saveCategories}>Save Categories</Button>
        </Card>
      </div>
    </div>
  );
}
