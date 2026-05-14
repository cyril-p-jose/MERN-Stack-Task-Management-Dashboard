import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, Pencil } from "lucide-react";
import api from "../api/client";
import TaskModal from "../components/TaskModal.jsx";
import Spinner from "../components/Spinner.jsx";
import {
  formatDateTime,
  priorityClass,
  priorityLabels,
  statusClass,
  statusLabels,
} from "../utils/format.js";

export default function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/tasks/${id}`);
      setTask(data);
    } catch (e) {
      toast.error(e.message);
      navigate("/tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const save = async (payload) => {
    await api.put(`/tasks/${id}`, payload);
    toast.success("Task saved");
    setEditOpen(false);
    load();
  };

  const remove = async () => {
    if (!window.confirm("Delete this task permanently?")) return;
    await api.delete(`/tasks/${id}`);
    toast.success("Task deleted");
    navigate("/tasks");
  };

  if (loading || !task) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner label="Loading task" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          to="/tasks"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <div className="ml-auto flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setEditOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-3 py-2 text-sm font-semibold text-white shadow-md hover:bg-brand-700"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </button>
          <button
            type="button"
            onClick={remove}
            className="rounded-xl border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50 dark:border-rose-900/60 dark:text-rose-300 dark:hover:bg-rose-950/30"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200/80 bg-white p-8 shadow-card dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass(task.status)}`}>
            {statusLabels[task.status]}
          </span>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${priorityClass(task.priority)}`}>
            {priorityLabels[task.priority]} priority
          </span>
        </div>
        <h1 className="mt-4 text-3xl font-bold text-slate-900 dark:text-white">{task.title}</h1>
        <p className="mt-6 whitespace-pre-wrap text-slate-600 dark:text-slate-300">{task.description || "No description"}</p>
        <dl className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/50">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Created</dt>
            <dd className="mt-1 text-sm font-medium text-slate-900 dark:text-white">{formatDateTime(task.createdAt)}</dd>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/50">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Deadline</dt>
            <dd className="mt-1 text-sm font-medium text-slate-900 dark:text-white">
              {task.deadline ? formatDateTime(task.deadline) : "Not set"}
            </dd>
          </div>
        </dl>
      </div>

      <TaskModal open={editOpen} title="Edit task" initial={task} onClose={() => setEditOpen(false)} onSubmit={save} />
    </div>
  );
}
