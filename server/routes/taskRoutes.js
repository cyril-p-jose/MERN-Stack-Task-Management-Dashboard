const express = require("express");
const { body } = require("express-validator");
const {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getStats,
} = require("../controllers/taskController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.get("/stats", getStats);
router.get("/", getTasks);
router.get("/:id", getTaskById);

router.post(
  "/",
  [
    body("title").trim().notEmpty(),
    body("description").optional().isString(),
    body("status").optional().isIn(["pending", "in_progress", "completed"]),
    body("priority").optional().isIn(["low", "medium", "high"]),
    body("deadline").optional().isISO8601().toDate(),
  ],
  createTask
);

router.put(
  "/:id",
  [
    body("title").optional().trim().notEmpty(),
    body("description").optional().isString(),
    body("status").optional().isIn(["pending", "in_progress", "completed"]),
    body("priority").optional().isIn(["low", "medium", "high"]),
    body("deadline")
      .optional({ values: "null" })
      .custom((v) => v === null || v === "" || v === undefined || !Number.isNaN(Date.parse(v))),
  ],
  updateTask
);

router.delete("/:id", deleteTask);

module.exports = router;
