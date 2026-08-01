const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const { User } = require("../models");

const ROSTER_PATH = path.join(__dirname, "..", "..", "company-roster.csv");

// Simple CSV line parser — good enough for the roster format used here
// (no embedded commas/quotes expected in name/email/password/role/dept/id).
function parseCsv(text) {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return [];
  const headers = lines[0].split(",").map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const cells = line.split(",").map((c) => c.trim());
    const row = {};
    headers.forEach((h, i) => { row[h] = cells[i] || ""; });
    return row;
  });
}

// This is the ONLY way accounts are created or their password/role changed —
// there is no self-registration. The company edits company-roster.csv
// (name, email, password, role, department, employeeId) and restarts the
// backend; this function reads that file and creates/updates the matching
// users table row for each entry, hashing the plain-text password from the
// CSV before storing it. A user's password only changes if the CSV value
// no longer matches what's already stored (avoids re-hashing every restart).
async function syncRosterFromCsv() {
  if (!fs.existsSync(ROSTER_PATH)) {
    console.warn(`[roster] No company-roster.csv found at ${ROSTER_PATH} — skipping sync.`);
    return;
  }

  const rows = parseCsv(fs.readFileSync(ROSTER_PATH, "utf8"));
  let created = 0, updated = 0, skipped = 0;

  for (const row of rows) {
    const { name, email, password, role, department, employeeId } = row;
    if (!name || !email || !password || !role) {
      console.warn(`[roster] Skipping incomplete row: ${JSON.stringify(row)}`);
      skipped++;
      continue;
    }
    if (!["employee", "director", "accounts"].includes(role)) {
      console.warn(`[roster] Skipping row with invalid role "${role}" for ${email}`);
      skipped++;
      continue;
    }

    const existing = await User.findOne({ where: { email: email.toLowerCase() } });

    if (!existing) {
      const hashed = await bcrypt.hash(password, 10);
      await User.create({
        name, email: email.toLowerCase(), password: hashed, role,
        department: department || null, employeeId: employeeId || null,
      });
      created++;
      continue;
    }

    // Only re-hash/update if the CSV password no longer matches the stored
    // hash, or the role/name/department/employeeId changed in the CSV.
    const passwordChanged = !(await bcrypt.compare(password, existing.password));
    const roleChanged = existing.role !== role;
    const nameChanged = existing.name !== name;
    const deptChanged = (existing.department || "") !== (department || "");
    const idChanged = (existing.employeeId || "") !== (employeeId || "");

    if (passwordChanged || roleChanged || nameChanged || deptChanged || idChanged) {
      if (passwordChanged) existing.password = await bcrypt.hash(password, 10);
      existing.role = role;
      existing.name = name;
      existing.department = department || null;
      existing.employeeId = employeeId || null;
      await existing.save();
      updated++;
    }
  }

  console.log(`[roster] Synced from company-roster.csv — created: ${created}, updated: ${updated}, skipped: ${skipped}, total rows: ${rows.length}`);
}

module.exports = syncRosterFromCsv;
