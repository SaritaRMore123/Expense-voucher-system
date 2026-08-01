const { Voucher } = require("../models");
const { Op } = require("sequelize");

// Generates a voucher number like EV-2026-07-0001
// Unique, sequential per year-month, human readable.
async function generateVoucherNumber() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const prefix = `EV-${year}-${month}-`;

  const count = await Voucher.count({
    where: { voucherNumber: { [Op.like]: `${prefix}%` } },
  });

  const nextSeq = String(count + 1).padStart(4, "0");
  return `${prefix}${nextSeq}`;
}

module.exports = generateVoucherNumber;
