const { Sequelize } = require("sequelize");
const path = require("path");
require("dotenv").config();

const dialect = process.env.DB_DIALECT || "sqlite";

let sequelize;

if (dialect === "sqlite") {
  sequelize = new Sequelize({
    dialect: "sqlite",
    storage: path.join(__dirname, "..", "..", process.env.DB_STORAGE || "./data/evms.sqlite"),
    logging: false,
  });
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      dialect, // 'postgres' or 'mysql'
      logging: false,
    }
  );
}

module.exports = sequelize;
