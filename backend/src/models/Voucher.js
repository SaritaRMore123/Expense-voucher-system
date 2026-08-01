const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Voucher = sequelize.define("Voucher", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  voucherNumber: { type: DataTypes.STRING, allowNull: false, unique: true },
  voucherDate: { type: DataTypes.DATEONLY, allowNull: false, defaultValue: DataTypes.NOW },
  expenseDate: { type: DataTypes.DATEONLY, allowNull: false },
  department: { type: DataTypes.STRING, allowNull: false },
  expenseTitle: { type: DataTypes.STRING, allowNull: false },
  expenseCategory: { type: DataTypes.STRING, allowNull: true },
  expenseDescription: { type: DataTypes.TEXT, allowNull: true },
  amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, validate: { min: 0.01 } },

  employeeName: { type: DataTypes.STRING, allowNull: false },
  employeeIdCode: { type: DataTypes.STRING, allowNull: true },
  employeeSignature: { type: DataTypes.STRING, allowNull: true },

  status: {
    type: DataTypes.ENUM("draft", "pending", "approved", "rejected"),
    allowNull: false,
    defaultValue: "draft",
  },

  directorSignature: { type: DataTypes.STRING, allowNull: true },
  approvalDate: { type: DataTypes.DATE, allowNull: true },
  rejectionReason: { type: DataTypes.STRING, allowNull: true },

  employeeUserId: { type: DataTypes.INTEGER, allowNull: false },
});

module.exports = Voucher;
