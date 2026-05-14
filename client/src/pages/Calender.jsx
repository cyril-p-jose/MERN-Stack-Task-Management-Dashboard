import { useEffect, useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/client";
import Spinner from "../components/Spinner.jsx";
import { priorityClass } from "../utils/format.js";

export default function Calendar() {
  const [cursor, setCursor] = useState(() => new Date());
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/tasks");
        if (!cancelled) setTasks(data);
      } catch (e) {
        if (!cancelled) toast.error(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const monthStart = startOfMonth(cursor);
  const monthEnd = endOfMonth(cursor);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const tasksByDay = useMemo(() => {
    const map = {};
    tasks.forEach((t) => {
      if (!t.deadline) return;
      const key = format(parseISO(t.deadline), "yyyy-MM-dd");
      if (!map[key]) map[key] = [];
      map[key].push(t);
    });
    return map;
  }, [tasks]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner label="Loading calendar" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Calendar</h2>
          <p className="text-slate-600 dark:text-slate-400">Deadlines plotted on a monthly grid.</p>
        </div>
        <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <button
            type="button"
            onClick={() => setCursor((d) => subMonths(d, 1))}
            className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <p className="min-w-[10rem] text-center text-sm font-semibold text-slate-900 dark:text-white">
            {format(cursor, "MMMM yyyy")}
          </p>
          <button
            type="button"
            onClick={() => setCursor((d) => addMonths(d, 1))}
            className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-card dark:border-slate-800 dark:bg-slate-900">
        <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50 text-center text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-400">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <div key={d} className="px-2 py-3">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 divide-x divide-slate-100 dark:divide-slate-800">
          {days.map((day) => {
            const key = format(day, "yyyy-MM-dd");
            const dayTasks = tasksByDay[key] || [];
            const muted = !isSameMonth(day, cursor);
            const today = isSameDay(day, new Date());
            return (
              <div
                key={key}
                className={`min-h-[110px] border-b border-slate-100 p-2 text-xs dark:border-slate-800 ${
                  muted ? "bg-slate-50/60 text-slate-400 dark:bg-slate-950/40" : "bg-white dark:bg-slate-900"
                }`}
              >
                <div className="mb-1 flex items-center justify-between">
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-semibold ${
                      today ? "bg-brand-600 text-white" : "text-slate-700 dark:text-slate-200"
                    }`}
                  >
                    {format(day, "d")}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  {dayTasks.slice(0, 3).map((t) => (
                    <Link
                      key={t._id}
                      to={`/tasks/${t._id}`}
                      className={`truncate rounded-lg px-1.5 py-0.5 text-[10px] font-semibold ${priorityClass(t.priority)}`}
                    >
                      {t.title}
                    </Link>
                  ))}
                  {dayTasks.length > 3 ? (
                    <span className="text-[10px] font-medium text-slate-500">+{dayTasks.length - 3} more</span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-400">
        Tasks without a due date are hidden here. Assign deadlines from the task editor to populate the calendar.
      </div>
    </div>
  );
}
