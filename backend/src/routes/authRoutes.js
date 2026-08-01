const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { authenticate } = require("../middleware/auth");
const { loginLimiter } = require("../middleware/rateLimiters");

router.post("/login", loginLimiter, authController.login);
router.get("/me", authenticate, authController.me);

module.exports = router;
