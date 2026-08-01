const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

// Extra feature: full audit trail / timeline for every voucher.
// Every meaningful action (create, edit, submit, approve, reject, delete)
// is logged here so employees, the Director, and Accounts can see a
// complete history of what happened to a voucher and when.
const VoucherHistory = sequelize.define("VoucherHistory", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  voucherId: { type: DataTypes.INTEGER, allowNull: false },
  action: { type: DataTypes.STRING, allowNull: false }, // created, updated, submitted, approved, rejected, deleted
  fromStatus: { type: DataTypes.STRING, allowNull: true },
  toStatus: { type: DataTypes.STRING, allowNull: true },
  performedByUserId: { type: DataTypes.INTEGER, allowNull: false },
  performedByName: { type: DataTypes.STRING, allowNull: false },
  performedByRole: { type: DataTypes.STRING, allowNull: false },
  remarks: { type: DataTypes.STRING, allowNull: true },
});

module.exports = VoucherHistory;
