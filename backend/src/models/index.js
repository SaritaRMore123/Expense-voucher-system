const sequelize = require("../config/db");
const User = require("./User");
const Voucher = require("./Voucher");
const VoucherHistory = require("./VoucherHistory");

User.hasMany(Voucher, { foreignKey: "employeeUserId", as: "vouchers" });
Voucher.belongsTo(User, { foreignKey: "employeeUserId", as: "employee" });

Voucher.hasMany(VoucherHistory, { foreignKey: "voucherId", as: "history" });
VoucherHistory.belongsTo(Voucher, { foreignKey: "voucherId" });

module.exports = { sequelize, User, Voucher, VoucherHistory };
