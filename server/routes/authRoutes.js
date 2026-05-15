const express = require("express");
const { body } = require("express-validator");
const { register, login, getMe, updateProfile } = require("../controllers/authController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email required"),
    body("password").isLength({ min: 6 }).withMessage("Password min 6 characters"),
  ],
  register
);

router.post(
  "/login",
  [body("email").isEmail(), body("password").notEmpty()],
  login
);

router.get("/me", protect, getMe);

router.put(
  "/profile",
  protect,
  [
    body("name").optional().trim().notEmpty(),
    body("avatarUrl").optional().isString(),
    body("timezone").optional().trim(),
    body("password").optional().isLength({ min: 6 }),
  ],
  updateProfile
);

module.exports = router;
