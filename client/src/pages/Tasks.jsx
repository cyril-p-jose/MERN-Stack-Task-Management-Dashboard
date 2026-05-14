import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Plus, Search } from "lucide-react";
import api from "../api/client";
import TaskModal from "../components/TaskModal.jsx";
import EmptyState from "../components/EmptyState.jsx";
import Spinner from "../components/Spinner.jsx";
import {
  deadlineBadge,
  formatDate,
  priorityClass,
  priorityLabels,
  statusClass,
  statusLabels,
} from "../utils/format.js";

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [sort, setSort] = useState("newest");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (status) params.set("status", status);
    if (priority) params.set("priority", priority);
    if (sort) params.set("sort", sort);
    return `?${params.toString()}`;
  }, [search, status, priority, sort]);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/tasks${query}`);
      setTasks(data);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const handleCreate = async (payload) => {
    await api.post("/tasks", payload);
    toast.success("Task created");
    setModalOpen(false);
    load();
  };

  const handleUpdate = async (payload) => {
    await api.put(`/tasks/${editing._id}`, payload);
    toast.success("Task updated");
    setEditing(null);
    load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    await api.delete(`/tasks/${id}`);
    toast.success("Task deleted");
    load();
  };

  const toggleComplete = async (task) => {
    const next = task.status === "completed" ? "pending" : "completed";
    await api.put(`/tasks/${task._id}`, { status: next });
    toast.success(next === "completed" ? "Marked complete" : "Reopened task");
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">My tasks</h2>
          <p className="text-slate-600 dark:text-slate-400">Search, filter, and sort your backlog.</p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" />
          New task
        </button>
      </div>

      <div className="grid gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-card dark:border-slate-800 dark:bg-slate-900 md:grid-cols-2 lg:grid-cols-4">
        <div className="relative md:col-span-2">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            placeholder="Search title or description…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none ring-brand-500/20 focus:border-brand-500 focus:ring-4 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In progress</option>
          <option value="completed">Completed</option>
        </select>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
        >
          <option value="">All priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm md:col-span-2 lg:col-span-1 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="deadline_asc">Deadline (soonest)</option>
          <option value="deadline_desc">Deadline (latest)</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState
          title="No tasks match"
          description="Adjust filters or create a new task to populate this view."
          action={
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white"
            >
              Create task
            </button>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-card dark:border-slate-800 dark:bg-slate-900">
          <table className="min-w-full divide-y divide-slate-100 text-sm dark:divide-slate-800">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:bg-slate-950/50 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">Task</th>
                <th className="hidden px-4 py-3 sm:table-cell">Status</th>
                <th className="hidden px-4 py-3 md:table-cell">Priority</th>
                <th className="hidden px-4 py-3 lg:table-cell">Due</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {tasks.map((task) => {
                const badge = deadlineBadge(task.deadline, task.status);
                return (
                  <tr key={task._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3">
                      <Link to={`/tasks/${task._id}`} className="font-medium text-slate-900 hover:underline dark:text-white">
                        {task.title}
                      </Link>
                      <p className="line-clamp-1 text-xs text-slate-500 dark:text-slate-400">{task.description || "—"}</p>
                    </td>
                    <td className="hidden px-4 py-3 sm:table-cell">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusClass(task.status)}`}>
                        {statusLabels[task.status]}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${priorityClass(task.priority)}`}>
                        {priorityLabels[task.priority]}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 text-slate-600 dark:text-slate-300 lg:table-cell">
                      <div className="flex flex-col">
                        <span>{formatDate(task.deadline)}</span>
                        {badge.label ? (
                          <span
                            className={
                              badge.tone === "danger"
                                ? "text-xs font-medium text-rose-600"
                                : badge.tone === "warning"
                                  ? "text-xs font-medium text-amber-600"
                                  : "text-xs text-slate-500"
                            }
                          >
                            {badge.label}
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex flex-wrap justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => toggleComplete(task)}
                          className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                          {task.status === "completed" ? "Reopen" : "Complete"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditing(task)}
                          className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(task._id)}
                          className="rounded-lg border border-rose-100 px-2 py-1 text-xs font-medium text-rose-700 hover:bg-rose-50 dark:border-rose-900/50 dark:text-rose-300 dark:hover:bg-rose-950/40"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <TaskModal
        open={modalOpen}
        title="New task"
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreate}
      />
      <TaskModal
        open={Boolean(editing)}
        title="Edit task"
        initial={editing}
        onClose={() => setEditing(null)}
        onSubmit={handleUpdate}
      />
    </div>
  );
}
