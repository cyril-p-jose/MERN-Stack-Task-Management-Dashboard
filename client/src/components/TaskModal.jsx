import { useEffect, useState } from "react";
import { X } from "lucide-react";

const empty = {
  title: "",
  description: "",
  status: "pending",
  priority: "medium",
  deadline: "",
};

export default function TaskModal({ open, onClose, onSubmit, initial, title }) {
  const [form, setForm] = useState(empty);

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setForm({
        title: initial.title || "",
        description: initial.description || "",
        status: initial.status || "pending",
        priority: initial.priority || "medium",
        deadline: initial.deadline ? initial.deadline.slice(0, 10) : "",
      });
    } else {
      setForm(empty);
    }
  }, [open, initial]);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      deadline: form.deadline ? new Date(form.deadline).toISOString() : null,
    };
    onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
      <button type="button" className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-slate-200 bg-white p-6 shadow-card-lg dark:border-slate-700 dark:bg-slate-900 sm:rounded-3xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Title</label>
            <input
              name="title"
              required
              value={form.title}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 outline-none ring-brand-500/20 focus:border-brand-500 focus:ring-4 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
            <textarea
              name="description"
              rows={4}
              value={form.description}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 outline-none ring-brand-500/20 focus:border-brand-500 focus:ring-4 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Priority</label>
              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Due date</label>
            <input
              type="date"
              name="deadline"
              value={form.deadline}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-brand-700"
            >
              Save task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
