import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ListTodo,
  Kanban,
  CalendarDays,
  UserRound,
  LogOut,
  Menu,
  X,
  Moon,
  Sun,
} from "lucide-react";
import { useState } from "react";
import clsx from "clsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/tasks", label: "My Tasks", icon: ListTodo },
  { to: "/kanban", label: "Kanban", icon: Kanban },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/profile", label: "Profile", icon: UserRound },
];

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const { theme, setTheme, toggle } = useTheme();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const linkClass = ({ isActive }) =>
    clsx(
      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
      isActive
        ? "bg-brand-600 text-white shadow-lg shadow-brand-600/25"
        : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/80"
    );

  return (
    <div className="min-h-screen bg-surface-muted dark:bg-slate-950">
      {/* Mobile overlay */}
      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-50 w-72 transform border-r border-slate-200/80 bg-white/90 px-4 py-6 shadow-card-lg backdrop-blur transition-transform duration-300 dark:border-slate-800 dark:bg-slate-900/95 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex items-center justify-between gap-2 px-2">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600 text-lg font-bold text-white shadow-lg">
              TF
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Workspace</p>
              <p className="font-semibold text-slate-900 dark:text-white">TaskFlow</p>
            </div>
          </div>
          <button
            type="button"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden dark:hover:bg-slate-800"
            onClick={() => setOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-10 flex flex-col gap-1">
          {nav.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={linkClass} onClick={() => setOpen(false)}>
              <item.icon className="h-5 w-5 shrink-0 opacity-90" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-6 left-4 right-4 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-800/50">
          <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{user?.name}</p>
          <p className="truncate text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/80 px-4 py-3 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="rounded-xl border border-slate-200 p-2 text-slate-600 shadow-sm hover:bg-slate-50 lg:hidden dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                onClick={() => setOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-brand-600 dark:text-brand-400">
                  Productivity
                </p>
                <h1 className="text-lg font-semibold text-slate-900 dark:text-white">Task management</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden items-center rounded-full border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 sm:flex">
                <button
                  type="button"
                  className={clsx(
                    "rounded-full px-2 py-1 transition",
                    theme === "light" && "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                  )}
                  onClick={() => setTheme("light")}
                >
                  Light
                </button>
                <button
                  type="button"
                  className={clsx(
                    "rounded-full px-2 py-1 transition",
                    theme === "dark" && "bg-slate-900 text-white"
                  )}
                  onClick={() => setTheme("dark")}
                >
                  Dark
                </button>
                <button
                  type="button"
                  className={clsx(
                    "rounded-full px-2 py-1 transition",
                    theme === "system" && "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                  )}
                  onClick={() => setTheme("system")}
                >
                  Auto
                </button>
              </div>
              <button
                type="button"
                onClick={toggle}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 sm:hidden"
                aria-label="Toggle color theme"
              >
                <Sun className="hidden h-5 w-5 dark:inline" />
                <Moon className="h-5 w-5 dark:hidden" />
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl animate-fade-in px-4 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
