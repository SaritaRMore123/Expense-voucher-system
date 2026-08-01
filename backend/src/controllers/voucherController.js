const { Op } = require("sequelize");
const { Voucher, User, VoucherHistory } = require("../models");
const generateVoucherNumber = require("../utils/generateVoucherNumber");
const logHistory = require("../utils/logHistory");

// ---- Employee: create a voucher (always starts as Draft) ----
exports.createVoucher = async (req, res, next) => {
  try {
    const {
      expenseDate,
      department,
      expenseTitle,
      expenseCategory,
      expenseDescription,
      amount,
      employeeIdCode,
    } = req.body;

    if (!department || !expenseTitle || !expenseDate || amount === undefined) {
      return res.status(400).json({
        message: "department, expenseTitle, expenseDate and amount are required",
      });
    }
    if (Number(amount) <= 0) {
      return res.status(400).json({ message: "Amount must be greater than zero" });
    }

    const voucherNumber = await generateVoucherNumber();

    const voucher = await Voucher.create({
      voucherNumber,
      expenseDate,
      department,
      expenseTitle,
      expenseCategory,
      expenseDescription,
      amount,
      employeeName: req.user.name,
      employeeIdCode,
      employeeUserId: req.user.id,
      status: "draft",
    });

    await logHistory({
      voucherId: voucher.id,
      action: "created",
      toStatus: "draft",
      user: req.user,
    });

    res.status(201).json(voucher);
  } catch (err) {
    next(err);
  }
};

// ---- Employee: edit a Draft voucher ----
exports.updateVoucher = async (req, res, next) => {
  try {
    const voucher = await Voucher.findByPk(req.params.id);
    if (!voucher) return res.status(404).json({ message: "Voucher not found" });

    if (voucher.employeeUserId !== req.user.id) {
      return res.status(403).json({ message: "You can only edit your own vouchers" });
    }
    if (voucher.status !== "draft") {
      return res.status(400).json({ message: "Only Draft vouchers can be edited" });
    }

    const fields = [
      "expenseDate",
      "department",
      "expenseTitle",
      "expenseCategory",
      "expenseDescription",
      "amount",
      "employeeIdCode",
      "employeeSignature",
    ];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) voucher[f] = req.body[f];
    });

    if (voucher.amount !== undefined && Number(voucher.amount) <= 0) {
      return res.status(400).json({ message: "Amount must be greater than zero" });
    }

    await voucher.save();
    await logHistory({
      voucherId: voucher.id,
      action: "updated",
      fromStatus: "draft",
      toStatus: "draft",
      user: req.user,
    });

    res.json(voucher);
  } catch (err) {
    next(err);
  }
};

// ---- Employee: delete a Draft voucher ----
exports.deleteVoucher = async (req, res, next) => {
  try {
    const voucher = await Voucher.findByPk(req.params.id);
    if (!voucher) return res.status(404).json({ message: "Voucher not found" });

    if (voucher.employeeUserId !== req.user.id) {
      return res.status(403).json({ message: "You can only delete your own vouchers" });
    }
    if (voucher.status !== "draft") {
      return res.status(400).json({ message: "Only Draft vouchers can be deleted" });
    }

    await VoucherHistory.destroy({ where: { voucherId: voucher.id } });
    await voucher.destroy();
    res.json({ message: "Voucher deleted" });
  } catch (err) {
    next(err);
  }
};

// ---- Employee: submit a Draft voucher for approval ----
exports.submitVoucher = async (req, res, next) => {
  try {
    const voucher = await Voucher.findByPk(req.params.id);
    if (!voucher) return res.status(404).json({ message: "Voucher not found" });

    if (voucher.employeeUserId !== req.user.id) {
      return res.status(403).json({ message: "You can only submit your own vouchers" });
    }
    if (voucher.status !== "draft") {
      return res.status(400).json({ message: "Only Draft vouchers can be submitted" });
    }
    if (!voucher.employeeSignature) {
      return res.status(400).json({ message: "Employee signature is mandatory before submission" });
    }

    voucher.status = "pending";
    await voucher.save();

    await logHistory({
      voucherId: voucher.id,
      action: "submitted",
      fromStatus: "draft",
      toStatus: "pending",
      user: req.user,
    });

    res.json(voucher);
  } catch (err) {
    next(err);
  }
};

// ---- Director: approve a Pending voucher ----
exports.approveVoucher = async (req, res, next) => {
  try {
    const voucher = await Voucher.findByPk(req.params.id);
    if (!voucher) return res.status(404).json({ message: "Voucher not found" });
    if (voucher.status !== "pending") {
      return res.status(400).json({ message: "Only Pending vouchers can be approved" });
    }

    const signature = req.body.directorSignature || voucher.directorSignature;
    if (!signature) {
      return res.status(400).json({ message: "Director signature is mandatory before approval" });
    }

    voucher.status = "approved";
    voucher.directorSignature = signature;
    voucher.approvalDate = new Date();
    voucher.rejectionReason = null;
    await voucher.save();

    await logHistory({
      voucherId: voucher.id,
      action: "approved",
      fromStatus: "pending",
      toStatus: "approved",
      user: req.user,
    });

    res.json(voucher);
  } catch (err) {
    next(err);
  }
};

// ---- Director: reject a Pending voucher ----
exports.rejectVoucher = async (req, res, next) => {
  try {
    const voucher = await Voucher.findByPk(req.params.id);
    if (!voucher) return res.status(404).json({ message: "Voucher not found" });
    if (voucher.status !== "pending") {
      return res.status(400).json({ message: "Only Pending vouchers can be rejected" });
    }

    const { rejectionReason } = req.body;
    if (!rejectionReason || !rejectionReason.trim()) {
      return res.status(400).json({ message: "Rejection reason is mandatory" });
    }

    voucher.status = "rejected";
    voucher.rejectionReason = rejectionReason;
    voucher.approvalDate = null;
    await voucher.save();

    await logHistory({
      voucherId: voucher.id,
      action: "rejected",
      fromStatus: "pending",
      toStatus: "rejected",
      user: req.user,
      remarks: rejectionReason,
    });

    res.json(voucher);
  } catch (err) {
    next(err);
  }
};

// ---- Employee: list own vouchers ----
exports.getMyVouchers = async (req, res, next) => {
  try {
    const vouchers = await Voucher.findAll({
      where: { employeeUserId: req.user.id },
      order: [["createdAt", "DESC"]],
    });
    res.json(vouchers);
  } catch (err) {
    next(err);
  }
};

// ---- Director / Accounts: list all vouchers with search, filter, sort ----
exports.getAllVouchers = async (req, res, next) => {
  try {
    const {
      status,
      department,
      expenseCategory,
      voucherNumber,
      employeeName,
      dateFrom,
      dateTo,
      amountMin,
      amountMax,
      sortBy = "createdAt",
      sortDir = "DESC",
    } = req.query;

    const where = {};
    if (status) where.status = status;
    if (department) where.department = { [Op.like]: `%${department}%` };
    if (expenseCategory) where.expenseCategory = { [Op.like]: `%${expenseCategory}%` };
    if (voucherNumber) where.voucherNumber = { [Op.like]: `%${voucherNumber}%` };
    if (employeeName) where.employeeName = { [Op.like]: `%${employeeName}%` };
    if (dateFrom || dateTo) {
      where.expenseDate = {};
      if (dateFrom) where.expenseDate[Op.gte] = dateFrom;
      if (dateTo) where.expenseDate[Op.lte] = dateTo;
    }
    if (amountMin || amountMax) {
      where.amount = {};
      if (amountMin) where.amount[Op.gte] = amountMin;
      if (amountMax) where.amount[Op.lte] = amountMax;
    }

    const allowedSort = ["createdAt", "amount", "expenseDate", "voucherNumber", "status"];
    const order = [[allowedSort.includes(sortBy) ? sortBy : "createdAt", sortDir === "ASC" ? "ASC" : "DESC"]];

    const vouchers = await Voucher.findAll({ where, order });
    res.json(vouchers);
  } catch (err) {
    next(err);
  }
};

// ---- Director: list only pending approvals ----
exports.getPendingVouchers = async (req, res, next) => {
  try {
    const vouchers = await Voucher.findAll({
      where: { status: "pending" },
      order: [["createdAt", "ASC"]],
    });
    res.json(vouchers);
  } catch (err) {
    next(err);
  }
};

// ---- Any authenticated role: view a single voucher (with ownership check for employees) ----
exports.getVoucherById = async (req, res, next) => {
  try {
    const voucher = await Voucher.findByPk(req.params.id, {
      include: [{ model: VoucherHistory, as: "history", separate: true, order: [["createdAt", "ASC"]] }],
    });
    if (!voucher) return res.status(404).json({ message: "Voucher not found" });

    if (req.user.role === "employee" && voucher.employeeUserId !== req.user.id) {
      return res.status(403).json({ message: "You cannot view another employee's voucher" });
    }

    res.json(voucher);
  } catch (err) {
    next(err);
  }
};

// ---- Upload endpoint used for both employee & director signatures ----
exports.uploadSignature = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const relativePath = `/uploads/signatures/${req.file.filename}`;
    res.json({ path: relativePath });
  } catch (err) {
    next(err);
  }
};
