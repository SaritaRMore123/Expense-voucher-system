const { Op, fn, col, literal } = require("sequelize");
const { Voucher } = require("../models");

exports.employeeDashboard = async (req, res, next) => {
  try {
    const where = { employeeUserId: req.user.id };
    const [total, draft, pending, approved, rejected] = await Promise.all([
      Voucher.count({ where }),
      Voucher.count({ where: { ...where, status: "draft" } }),
      Voucher.count({ where: { ...where, status: "pending" } }),
      Voucher.count({ where: { ...where, status: "approved" } }),
      Voucher.count({ where: { ...where, status: "rejected" } }),
    ]);
    const totalAmountClaimed = await Voucher.sum("amount", { where }) || 0;

    res.json({ total, draft, pending, approved, rejected, totalAmountClaimed });
  } catch (err) {
    next(err);
  }
};

exports.directorDashboard = async (req, res, next) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [pendingApproval, approvedToday, rejectedToday, totalPendingAmount, recent] = await Promise.all([
      Voucher.count({ where: { status: "pending" } }),
      Voucher.count({ where: { status: "approved", approvalDate: { [Op.gte]: startOfDay } } }),
      Voucher.count({ where: { status: "rejected", updatedAt: { [Op.gte]: startOfDay } } }),
      Voucher.sum("amount", { where: { status: "pending" } }),
      Voucher.findAll({ order: [["updatedAt", "DESC"]], limit: 10 }),
    ]);

    res.json({
      pendingApproval,
      approvedToday,
      rejectedToday,
      totalPendingAmount: totalPendingAmount || 0,
      recent,
    });
  } catch (err) {
    next(err);
  }
};

exports.accountsDashboard = async (req, res, next) => {
  try {
    const [total, pending, approved, rejected, recentApproved] = await Promise.all([
      Voucher.count(),
      Voucher.count({ where: { status: "pending" } }),
      Voucher.count({ where: { status: "approved" } }),
      Voucher.count({ where: { status: "rejected" } }),
      Voucher.findAll({ where: { status: "approved" }, order: [["approvalDate", "DESC"]], limit: 10 }),
    ]);
    const totalApprovedAmount = await Voucher.sum("amount", { where: { status: "approved" } }) || 0;

    res.json({ total, pending, approved, rejected, totalApprovedAmount, recentApproved });
  } catch (err) {
    next(err);
  }
};
