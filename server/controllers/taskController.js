const { validationResult } = require("express-validator");
const Task = require("../models/Task");
const Activity = require("../models/Activity");

const logActivity = async (userId, type, message, taskId = null, meta = {}) => {
  await Activity.create({ user: userId, type, message, taskId, meta });
};

const buildTaskQuery = (userId, { search, status, priority }) => {
  const q = { user: userId };
  if (status && ["pending", "in_progress", "completed"].includes(status)) {
    q.status = status;
  }
  if (priority && ["low", "medium", "high"].includes(priority)) {
    q.priority = priority;
  }
  if (search && search.trim()) {
    q.$or = [
      { title: new RegExp(search.trim(), "i") },
      { description: new RegExp(search.trim(), "i") },
    ];
  }
  return q;
};

const getSort = (sort) => {
  switch (sort) {
    case "deadline_asc":
      return { deadline: 1, createdAt: -1 };
    case "deadline_desc":
      return { deadline: -1, createdAt: -1 };
    case "oldest":
      return { createdAt: 1 };
    case "newest":
    default:
      return { createdAt: -1 };
  }
};

const getTasks = async (req, res, next) => {
  try {
    const { search, status, priority, sort } = req.query;
    const query = buildTaskQuery(req.user._id, { search, status, priority });
    const tasks = await Task.find(query).sort(getSort(sort));
    res.json(tasks);
  } catch (err) {
    next(err);
  }
};

const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(task);
  } catch (err) {
    next(err);
  }
};

const createTask = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "Validation failed", errors: errors.array() });
    }
    const task = await Task.create({ ...req.body, user: req.user._id });
    await logActivity(req.user._id, "task_created", `Created task "${task.title}"`, task._id);
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "Validation failed", errors: errors.array() });
    }
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ message: "Task not found" });

    const prevStatus = task.status;
    const { title, description, status, priority, deadline } = req.body;
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (deadline !== undefined) task.deadline = deadline || null;

    if (task.status === "completed") {
      task.completedAt = task.completedAt || new Date();
    } else {
      task.completedAt = null;
    }

    await task.save();

    if (task.status === "completed" && prevStatus !== "completed") {
      await logActivity(req.user._id, "task_completed", `Completed "${task.title}"`, task._id);
    } else if (status !== undefined && task.status !== prevStatus) {
      await logActivity(
        req.user._id,
        "task_status",
        `Moved "${task.title}" to ${String(task.status).replace("_", " ")}`,
        task._id,
        { from: prevStatus, to: task.status }
      );
    } else {
      await logActivity(req.user._id, "task_updated", `Updated "${task.title}"`, task._id);
    }

    res.json(task);
  } catch (err) {
    next(err);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ message: "Task not found" });
    await logActivity(req.user._id, "task_deleted", `Deleted task "${task.title}"`, null, {
      title: task.title,
    });
    res.json({ message: "Task removed" });
  } catch (err) {
    next(err);
  }
};

const getStats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const [total, completed, pending, inProgress] = await Promise.all([
      Task.countDocuments({ user: userId }),
      Task.countDocuments({ user: userId, status: "completed" }),
      Task.countDocuments({ user: userId, status: "pending" }),
      Task.countDocuments({ user: userId, status: "in_progress" }),
    ]);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const completedThisWeek = await Task.countDocuments({
      user: userId,
      status: "completed",
      completedAt: { $gte: weekAgo },
    });
    const overdue = await Task.countDocuments({
      user: userId,
      status: { $ne: "completed" },
      deadline: { $lt: new Date(), $ne: null },
    });
    res.json({
      total,
      completed,
      pending,
      inProgress,
      completedThisWeek,
      overdue,
      completionRate: total ? Math.round((completed / total) * 100) : 0,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getStats,
};
