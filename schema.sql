-- ============================================================================
-- Expense Voucher Management System — Database Schema
-- ============================================================================
-- This file documents the exact schema that Sequelize creates automatically
-- from the models in backend/src/models/ (via sequelize.sync() on server
-- start — see backend/src/server.js). It's provided here as a standalone,
-- human-readable reference and as the submission deliverable for "database
-- schema or migration files."
--
-- Written in SQLite syntax (the project's default database — see
-- backend/.env.example). It is trivially portable to PostgreSQL/MySQL:
-- swap AUTOINCREMENT -> SERIAL/AUTO_INCREMENT and DATETIME -> TIMESTAMP.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Users
-- Company-managed accounts. Populated by syncing backend/company-roster.csv
-- on every server start (see backend/src/utils/syncRoster.js) — there is no
-- self-registration endpoint.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "Users" (
  "id"          INTEGER PRIMARY KEY AUTOINCREMENT,
  "name"        VARCHAR(255) NOT NULL,
  "email"       VARCHAR(255) NOT NULL UNIQUE,
  "password"    VARCHAR(255) NOT NULL,               -- bcrypt hash, never plain text
  "role"        VARCHAR(20)  NOT NULL DEFAULT 'employee'
                CHECK ("role" IN ('employee', 'director', 'accounts')),
  "employeeId"  VARCHAR(255),                        -- optional org employee code
  "department"  VARCHAR(255),
  "createdAt"   DATETIME NOT NULL,
  "updatedAt"   DATETIME NOT NULL
);

-- ----------------------------------------------------------------------------
-- Vouchers
-- One row per expense voucher, following the Draft -> Pending -> Approved /
-- Rejected workflow described in the assignment.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "Vouchers" (
  "id"                  INTEGER PRIMARY KEY AUTOINCREMENT,
  "voucherNumber"       VARCHAR(255) NOT NULL UNIQUE,   -- auto-generated, e.g. EV-2026-08-0001
  "voucherDate"         DATE NOT NULL,                  -- defaults to creation date
  "expenseDate"         DATE NOT NULL,
  "department"          VARCHAR(255) NOT NULL,
  "expenseTitle"        VARCHAR(255) NOT NULL,
  "expenseCategory"     VARCHAR(255),
  "expenseDescription"  TEXT,
  "amount"              DECIMAL(12,2) NOT NULL CHECK ("amount" > 0),

  "employeeName"        VARCHAR(255) NOT NULL,          -- snapshot at creation time
  "employeeIdCode"      VARCHAR(255),
  "employeeSignature"   VARCHAR(255),                   -- file path under /uploads/signatures

  "status"              VARCHAR(20) NOT NULL DEFAULT 'draft'
                         CHECK ("status" IN ('draft', 'pending', 'approved', 'rejected')),

  "directorSignature"   VARCHAR(255),                   -- file path under /uploads/signatures
  "approvalDate"        DATETIME,
  "rejectionReason"     VARCHAR(255),

  "employeeUserId"      INTEGER NOT NULL,
  "createdAt"           DATETIME NOT NULL,
  "updatedAt"           DATETIME NOT NULL,

  FOREIGN KEY ("employeeUserId") REFERENCES "Users"("id")
);

CREATE INDEX IF NOT EXISTS "idx_vouchers_employeeUserId" ON "Vouchers" ("employeeUserId");
CREATE INDEX IF NOT EXISTS "idx_vouchers_status"         ON "Vouchers" ("status");

-- ----------------------------------------------------------------------------
-- VoucherHistories
-- Full audit trail: every create/edit/submit/approve/reject action on a
-- voucher, with who did it and when. Powers the "Timeline" shown on the
-- voucher details page (extra feature beyond the base assignment).
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "VoucherHistories" (
  "id"                  INTEGER PRIMARY KEY AUTOINCREMENT,
  "voucherId"           INTEGER NOT NULL,
  "action"              VARCHAR(255) NOT NULL,   -- created | updated | submitted | approved | rejected | deleted
  "fromStatus"          VARCHAR(255),
  "toStatus"            VARCHAR(255),
  "performedByUserId"   INTEGER NOT NULL,
  "performedByName"     VARCHAR(255) NOT NULL,   -- snapshot, in case the user is later renamed
  "performedByRole"     VARCHAR(255) NOT NULL,
  "remarks"             VARCHAR(255),            -- e.g. the rejection reason
  "createdAt"           DATETIME NOT NULL,
  "updatedAt"           DATETIME NOT NULL,

  FOREIGN KEY ("voucherId") REFERENCES "Vouchers"("id")
);

CREATE INDEX IF NOT EXISTS "idx_voucherhistories_voucherId" ON "VoucherHistories" ("voucherId");

-- ============================================================================
-- Sample data matching backend/company-roster.csv (for reference only —
-- in practice these rows are created automatically by syncRoster.js, with
-- the password properly bcrypt-hashed, not stored as plain text as shown
-- here for readability):
--
-- INSERT INTO "Users" ("name","email","password","role","department","employeeId","createdAt","updatedAt")
-- VALUES ('Ravi Sharma','employee@evms.com','<bcrypt-hash>','employee','Sales','EMP-001',datetime('now'),datetime('now'));
-- ============================================================================
