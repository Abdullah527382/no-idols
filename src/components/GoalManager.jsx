import { useState } from "react";
import { Plus, Trash2, Pencil, Check, X } from "lucide-react";
import { useApp } from "../context/AppContext";
import ProgressBar from "./ui/ProgressBar";

const CATEGORIES = ["Spiritual", "Fitness", "Personal Growth"];

const emptyForm = {
  label: "",
  category: "Spiritual",
  target: "",
  progress: "",
  unit: "",
  notes: "",
};

export default function GoalManager() {
  const { goals, addGoal, updateGoal, deleteGoal } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  function startEdit(goal) {
    setEditingId(goal.id);
    setForm({
      label: goal.label,
      category: goal.category,
      target: goal.target,
      progress: goal.progress,
      unit: goal.unit,
      notes: goal.notes || "",
    });
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const payload = {
      ...form,
      target: Number(form.target) || 0,
      progress: Number(form.progress) || 0,
    };

    if (editingId) {
      await updateGoal(editingId, payload);
    } else {
      await addGoal(payload);
    }

    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  }

  function cancelForm() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  }

  return (
    <div className="space-y-5">
      {goals.length === 0 && !showForm && (
        <p className="text-sm text-white/40">
          No goals yet — add your first fitness or spiritual milestone.
        </p>
      )}

      {goals.map((goal) => (
        <div
          key={goal.id}
          className="rounded-lg border border-line bg-charcoal/60 p-4"
        >
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <span className="font-semibold text-white/80">{goal.label}</span>
            <div className="flex items-center gap-3">
              <span className="text-white/40">
                {goal.progress}/{goal.target} {goal.unit}
              </span>
              <button
                type="button"
                onClick={() => startEdit(goal)}
                className="text-white/40 hover:text-ember"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => deleteGoal(goal.id)}
                className="text-white/40 hover:text-blood-light"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <ProgressBar
            value={goal.progress}
            max={goal.target}
            accent={goal.category === "Fitness" ? "blood" : "brass"}
          />
          <div className="mt-1 flex items-center justify-between">
            <p className="text-[11px] uppercase tracking-wide text-white/30">
              {goal.category}
            </p>
            {goal.notes && (
              <p className="text-[11px] text-white/40">{goal.notes}</p>
            )}
          </div>
        </div>
      ))}

      {showForm ? (
        <form
          onSubmit={handleSubmit}
          className="space-y-3 rounded-lg border border-line bg-charcoal/60 p-4"
        >
          <input
            type="text"
            required
            placeholder="Goal (e.g. Fajr in congregation)"
            value={form.label}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, label: e.target.value }))
            }
            className="input-field"
          />
          <div className="grid grid-cols-2 gap-3">
            <select
              value={form.category}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, category: e.target.value }))
              }
              className="input-field"
            >
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Unit (days, sessions...)"
              value={form.unit}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, unit: e.target.value }))
              }
              className="input-field"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              min="0"
              placeholder="Progress"
              value={form.progress}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, progress: e.target.value }))
              }
              className="input-field"
            />
            <input
              type="number"
              min="0"
              required
              placeholder="Target"
              value={form.target}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, target: e.target.value }))
              }
              className="input-field"
            />
          </div>
          <textarea
            placeholder="Notes (optional)"
            value={form.notes}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, notes: e.target.value }))
            }
            className="input-field resize-none"
            rows={2}
          />
          <div className="flex gap-2">
            <button type="submit" className="btn-ember flex-1">
              <Check className="h-4 w-4" />{" "}
              {editingId ? "Save changes" : "Add goal"}
            </button>
            <button type="button" onClick={cancelForm} className="btn-ghost">
              <X className="h-4 w-4" />
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="btn-ghost w-full"
        >
          <Plus className="h-4 w-4" /> Add goal
        </button>
      )}
    </div>
  );
}
