const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");
const { authenticate, authorize } = require("../middleware/auth");

router.use(authenticate);

router.get("/employee", authorize("employee"), dashboardController.employeeDashboard);
router.get("/director", authorize("director"), dashboardController.directorDashboard);
router.get("/accounts", authorize("accounts"), dashboardController.accountsDashboard);

module.exports = router;
