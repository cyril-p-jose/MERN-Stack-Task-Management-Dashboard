import { useEffect, useMemo, useState } from "react";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import api from "../api/client";
import Spinner from "../components/Spinner.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { priorityClass, priorityLabels, statusLabels } from "../utils/format.js";
import { formatDate } from "../utils/format.js";

const columns = [
  { id: "pending", title: "Pending", hint: "Ideas and backlog" },
  { id: "in_progress", title: "In progress", hint: "Currently focused" },
  { id: "completed", title: "Completed", hint: "Shipped work" },
];

export default function Kanban() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/tasks");
      setTasks(data);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const grouped = useMemo(() => {
    const map = { pending: [], in_progress: [], completed: [] };
    tasks.forEach((t) => {
      if (map[t.status]) map[t.status].push(t);
    });
    return map;
  }, [tasks]);

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;
    if (destination.droppableId === source.droppableId) return;

    const nextStatus = destination.droppableId;
    const taskId = draggableId;

    const previous = tasks;
    const updated = tasks.map((t) => (t._id === taskId ? { ...t, status: nextStatus } : t));
    setTasks(updated);

    try {
      await api.put(`/tasks/${taskId}`, { status: nextStatus });
      toast.success(`Moved to ${statusLabels[nextStatus]}`);
    } catch (e) {
      setTasks(previous);
      toast.error(e.message);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner label="Loading board" />
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <EmptyState
        title="Kanban is empty"
        description="Create tasks from My Tasks to see them flow across your board."
        action={
          <Link to="/tasks" className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white">
            Go to tasks
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Kanban board</h2>
        <p className="text-slate-600 dark:text-slate-400">Drag cards between columns to update status instantly.</p>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid gap-4 lg:grid-cols-3">
          {columns.map((col) => (
            <Droppable droppableId={col.id} key={col.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`flex min-h-[420px] flex-col rounded-2xl border bg-white p-3 shadow-card transition dark:bg-slate-900 ${
                    snapshot.isDraggingOver
                      ? "border-brand-300 ring-2 ring-brand-200 dark:border-brand-700 dark:ring-brand-900"
                      : "border-slate-200/80 dark:border-slate-800"
                  }`}
                >
                  <div className="mb-3 px-2">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{col.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{col.hint}</p>
                  </div>
                  <div className="flex flex-1 flex-col gap-2">
                    {grouped[col.id].map((task, index) => (
                      <Draggable draggableId={task._id} index={index} key={task._id}>
                        {(dragProvided, dragSnapshot) => (
                          <div
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            {...dragProvided.dragHandleProps}
                            className={`rounded-xl border border-slate-200 bg-slate-50/80 p-3 shadow-sm transition dark:border-slate-700 dark:bg-slate-950/60 ${
                              dragSnapshot.isDragging ? "rotate-1 scale-[1.02] shadow-card-lg ring-2 ring-brand-200" : ""
                            }`}
                          >
                            <Link to={`/tasks/${task._id}`} className="block font-semibold text-slate-900 hover:underline dark:text-white">
                              {task.title}
                            </Link>
                            <p className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">{task.description}</p>
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${priorityClass(task.priority)}`}>
                                {priorityLabels[task.priority]}
                              </span>
                              {task.deadline ? (
                                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                                  Due {formatDate(task.deadline)}
                                </span>
                              ) : null}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
