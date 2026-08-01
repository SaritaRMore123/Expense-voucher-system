const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

// Accounts are entirely company-managed via company-roster.csv (see
// src/utils/syncRoster.js) — there is no self-registration, so this model
// only needs the core identity/role fields, nothing related to
// self-service password reset or email verification.
const User = sequelize.define("User", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  role: {
    type: DataTypes.ENUM("employee", "director", "accounts"),
    allowNull: false,
    defaultValue: "employee",
  },
  employeeId: { type: DataTypes.STRING, allowNull: true },
  department: { type: DataTypes.STRING, allowNull: true },
});

module.exports = User;
