import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  CheckCircle2,
  CircleDashed,
  Flame,
  ListChecks,
  Sparkles,
  Timer,
  TrendingUp,
} from "lucide-react";
import api from "../api/client";
import Spinner from "../components/Spinner.jsx";
import { formatDateTime, relativeTime, statusLabels } from "../utils/format.js";

const icons = {
  task_created: Sparkles,
  task_updated: ListChecks,
  task_deleted: CircleDashed,
  task_completed: CheckCircle2,
  task_status: Timer,
  profile_updated: TrendingUp,
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [s, t, a] = await Promise.all([
          api.get("/tasks/stats"),
          api.get("/tasks"),
          api.get("/activities?limit=12"),
        ]);
        if (!cancelled) {
          setStats(s.data);
          setTasks(t.data);
          setActivities(a.data);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const pieData = useMemo(() => {
    if (!stats) return [];
    return [
      { name: "Pending", value: stats.pending, color: "#94a3b8" },
      { name: "In progress", value: stats.inProgress, color: "#38bdf8" },
      { name: "Completed", value: stats.completed, color: "#34d399" },
    ].filter((d) => d.value > 0);
  }, [stats]);

  const chartData = useMemo(() => {
    const buckets = {};
    tasks.forEach((task) => {
      const d = new Date(task.createdAt);
      const key = d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
      buckets[key] = (buckets[key] || 0) + 1;
    });
    return Object.entries(buckets)
      .slice(-7)
      .map(([name, total]) => ({ name, total }));
  }, [tasks]);

  if (loading || !stats) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner label="Loading dashboard" />
      </div>
    );
  }

  const cards = [
    {
      label: "Total tasks",
      value: stats.total,
      icon: ListChecks,
      accent: "from-slate-700 to-slate-900",
    },
    {
      label: "Completed",
      value: stats.completed,
      icon: CheckCircle2,
      accent: "from-emerald-500 to-teal-600",
    },
    {
      label: "In progress",
      value: stats.inProgress,
      icon: Timer,
      accent: "from-sky-500 to-indigo-600",
    },
    {
      label: "Pending",
      value: stats.pending,
      icon: CircleDashed,
      accent: "from-amber-500 to-orange-600",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium text-brand-600 dark:text-brand-400">Overview</p>
        <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Dashboard</h2>
        <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-400">
          Track workload, completion velocity, and recent changes across your workspace.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-card-lg dark:border-slate-800 dark:bg-slate-900"
          >
            <div
              className={`absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${c.accent} opacity-20 blur-2xl transition group-hover:opacity-30`}
            />
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{c.label}</p>
                <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{c.value}</p>
              </div>
              <div className="rounded-xl bg-slate-100 p-2 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                <c.icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Task creation trend</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Rolling activity by created date</p>
            </div>
            <div className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">
              Live
            </div>
          </div>
          <div className="h-64">
            {chartData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">
                Create tasks to see trends
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                  <YAxis allowDecimals={false} stroke="#94a3b8" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 10px 30px rgba(15,23,42,0.08)",
                    }}
                  />
                  <Area type="monotone" dataKey="total" stroke="#4f46e5" fillOpacity={1} fill="url(#colorTotal)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Productivity</h3>
          <div className="h-48">
            {pieData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">No distribution yet</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    nameKey="name"
                    dataKey="value"
                    data={pieData}
                    innerRadius={48}
                    outerRadius={70}
                    paddingAngle={4}
                  >
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={24} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-brand-600 to-indigo-700 p-5 text-white shadow-lg">
            <div className="flex items-center gap-2 text-sm text-indigo-100">
              <Flame className="h-4 w-4" />
              Completion rate
            </div>
            <p className="mt-3 text-4xl font-bold">{stats.completionRate}%</p>
            <p className="mt-2 text-sm text-indigo-100">of all tasks marked done</p>
          </div>
          <div className="grid gap-3">
            <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-950/60">
              <span className="text-sm text-slate-600 dark:text-slate-300">Completed this week</span>
              <span className="text-sm font-semibold text-slate-900 dark:text-white">{stats.completedThisWeek}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-950/60">
              <span className="text-sm text-slate-600 dark:text-slate-300">Overdue (active)</span>
              <span className="text-sm font-semibold text-rose-600 dark:text-rose-400">{stats.overdue}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Recent activity</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Latest updates across your tasks</p>
          </div>
        </div>
        {activities.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">No activity yet — create a task to get started.</p>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {activities.map((a) => {
              const Icon = icons[a.type] || Sparkles;
              return (
                <li key={a._id} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{a.message}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {formatDateTime(a.createdAt)} · {relativeTime(a.createdAt)}
                    </p>
                    {a.meta?.to ? (
                      <p className="mt-1 text-xs text-slate-500">
                        Status → {statusLabels[a.meta.to] || a.meta.to}
                      </p>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
