import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { api } from "../../lib/api";
import { USER_ID } from "../../lib/constants";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";

const defaultCategory = { name: "", budget: "" };

export function OnboardingWizard({ onComplete }) {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    monthlyBudget: "",
    calorieGoal: "",
    categories: [defaultCategory],
  });

  const summary = useMemo(
    () => ({
      ...form,
      categories: form.categories.filter((category) => category.name.trim() && category.budget),
    }),
    [form],
  );

  const next = () => {
    if (step === 3 && summary.categories.length === 0) {
      setError("Add at least one category before continuing.");
      return;
    }
    setError("");
    setStep((current) => Math.min(5, current + 1));
  };

  const prev = () => {
    setError("");
    setStep((current) => Math.max(1, current - 1));
  };

  const updateCategory = (index, field, value) => {
    setForm((current) => ({
      ...current,
      categories: current.categories.map((category, categoryIndex) =>
        categoryIndex === index ? { ...category, [field]: value } : category,
      ),
    }));
  };

  const submit = async () => {
    setSaving(true);
    setError("");
    try {
      const payload = {
        name: form.name,
        email: form.email,
        monthlyBudget: Number(form.monthlyBudget),
        calorieGoal: Number(form.calorieGoal),
        categories: summary.categories.map((category) => ({
          name: category.name.trim(),
          budget: Number(category.budget),
        })),
      };
      const profile = await api.saveProfile(USER_ID, payload);
      onComplete(profile);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-shell justify-center">
      <Card className="mx-auto w-full max-w-3xl p-6 md:p-8">
        <p className="text-xs uppercase tracking-[0.36em] text-cyan-300">First-Time Setup</p>
        <h1 className="mt-3 font-display text-4xl font-bold text-white">Shape FinTrack around your life.</h1>
        <p className="mt-3 text-sm text-muted">
          Set your profile, your own categories, and your calorie target. Nothing here is pre-filled with assumptions.
        </p>

        <div className="mt-6 flex gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <div key={value} className={`h-2 flex-1 rounded-full ${value <= step ? "bg-cyan-300" : "bg-white/5"}`} />
          ))}
        </div>

        <motion.div
          key={step}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          className="mt-8"
        >
          {step === 1 ? (
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="label">Name</label>
                <input
                  className="text-input"
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="label">Email</label>
                <input
                  className="text-input"
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                  placeholder="you@example.com"
                />
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div>
              <label className="label">Monthly Budget</label>
              <input
                className="text-input"
                type="number"
                value={form.monthlyBudget}
                onChange={(event) => setForm({ ...form, monthlyBudget: event.target.value })}
                placeholder="Enter total budget in rupees"
              />
            </div>
          ) : null}

          {step === 3 ? (
            <div className="space-y-4">
              {form.categories.map((category, index) => (
                <div key={index} className="grid gap-3 md:grid-cols-[1fr_180px]">
                  <input
                    className="text-input"
                    value={category.name}
                    onChange={(event) => updateCategory(index, "name", event.target.value)}
                    placeholder="Category name"
                  />
                  <input
                    className="text-input"
                    type="number"
                    value={category.budget}
                    onChange={(event) => updateCategory(index, "budget", event.target.value)}
                    placeholder="Budget"
                  />
                </div>
              ))}
              <Button
                variant="secondary"
                onClick={() => setForm((current) => ({ ...current, categories: [...current.categories, defaultCategory] }))}
              >
                Add Another Category
              </Button>
            </div>
          ) : null}

          {step === 4 ? (
            <div>
              <label className="label">Daily Calorie Goal</label>
              <input
                className="text-input"
                type="number"
                value={form.calorieGoal}
                onChange={(event) => setForm({ ...form, calorieGoal: event.target.value })}
                placeholder="Calories per day"
              />
            </div>
          ) : null}

          {step === 5 ? (
            <div className="space-y-3">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-slate-300">{form.name || "No name yet"}</p>
                <p className="text-sm text-slate-500">{form.email || "No email yet"}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-slate-400">Monthly budget</p>
                <p className="mt-1 text-xl font-bold text-white">₹{form.monthlyBudget || 0}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-slate-400">Calories per day</p>
                <p className="mt-1 text-xl font-bold text-white">{form.calorieGoal || 0} kcal</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-slate-400">Categories</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {summary.categories.map((category) => (
                    <span key={category.name} className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-sm text-cyan-100">
                      {category.name} • ₹{category.budget}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </motion.div>

        {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}

        <div className="mt-8 flex items-center justify-between">
          <Button variant="secondary" onClick={prev} disabled={step === 1 || saving}>
            Back
          </Button>
          {step < 5 ? (
            <Button onClick={next}>Continue</Button>
          ) : (
            <Button onClick={submit} disabled={saving}>
              {saving ? "Saving..." : "Start Tracking"}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
