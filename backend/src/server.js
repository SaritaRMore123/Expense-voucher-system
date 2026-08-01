require("dotenv").config();
const fs = require("fs");
const path = require("path");
const app = require("./app");
const { sequelize } = require("./models");
const syncRosterFromCsv = require("./utils/syncRoster");

const PORT = process.env.PORT || 5000;

// Ensure sqlite data folder exists
const dataDir = path.join(__dirname, "..", "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

async function start() {
  try {
    await sequelize.authenticate();
    console.log("Database connection established.");

    // alter:true keeps the dev SQLite schema in sync with the models
    // (e.g. picks up newly added columns) without needing a migration
    // tool for this assignment. In a real production deployment this
    // would be replaced with proper Sequelize migrations.
    await sequelize.sync({ alter: true });
    console.log("Models synced.");

    // Accounts are entirely company-managed: every login checks against the
    // users table, and this table is populated only from company-roster.csv.
    // Editing that file and restarting the backend is how the company adds
    // people, changes roles, or resets someone's password — there is no
    // self-registration or self-service password reset in this app.
    await syncRosterFromCsv();

    app.listen(PORT, () => {
      console.log(`EVMS backend running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Unable to start server:", err);
    process.exit(1);
  }
}

start();
