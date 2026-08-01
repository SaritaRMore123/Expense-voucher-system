# Expense Voucher Management System (EVMS)

Full Stack Developer Internship Assignment — Prachay Securities Private Limited

A web application that digitizes the employee expense voucher lifecycle:
**Draft → Submitted/Pending → Approved / Rejected → visible to Accounts for reimbursement.**

Stack: **React (Vite) + Tailwind** frontend, **Node.js/Express + Sequelize** backend,
**SQLite by default** (zero setup) with a one-line switch to **PostgreSQL/MySQL**.

---

## 1. Project Structure

```
expense-voucher-system/
├── backend/          Express API, JWT auth, Sequelize models, file uploads
└── frontend/          React app (Employee / Director / Accounts portals)
```

---

## 2. Prerequisites

- Node.js 18+ and npm
- VS Code (or any editor/terminal)
- No database server required for the default setup (SQLite file is created automatically).
  Optional: PostgreSQL or MySQL if you prefer a real DB server (see §6).

---

## 3. Setup & Run — step by step (VS Code / terminal)

Open the project folder in VS Code, then open **two terminals** (Terminal → Split Terminal):
one for the backend, one for the frontend.

### Terminal 1 — Backend

```bash
cd expense-voucher-system/backend
npm install
cp .env.example .env
npm run dev          # starts API on http://localhost:5000
```

On startup, the backend automatically reads `backend/company-roster.csv` and
creates/updates the matching user accounts — there's no separate seed step.

You should see:
```
Database connection established.
Models synced.
[roster] Synced from company-roster.csv — created: 3, updated: 0, skipped: 0, total rows: 3
EVMS backend running on http://localhost:5000
```

### Terminal 2 — Frontend

```bash
cd expense-voucher-system/frontend
npm install
npm run dev          # starts React app on http://localhost:5173
```

Open **http://localhost:5173** in your browser.

### How accounts work (company-managed, no self-registration)

This app has **no public sign-up and no self-service password reset**, by
design — a company internal tool shouldn't let anyone grant themselves
access. Instead, `backend/company-roster.csv` is the single source of truth
for every user, role, and password:

```csv
name,email,password,role,department,employeeId
Ravi Sharma,employee@evms.com,Employee@123,employee,Sales,EMP-001
Anita Director,director@evms.com,Director@123,director,,
Vikram Accounts,accounts@evms.com,Accounts@123,accounts,,
```

To **add a person, change someone's role, or reset a password**: edit this
CSV (plain-text password is fine here — it gets hashed automatically on
sync) and restart the backend. On every restart, the app compares the CSV
against the database and creates or updates accounts to match — existing
passwords are only re-hashed if the CSV value actually changed, so
restarting doesn't disturb accounts you didn't touch.

### Demo logins (from the CSV above)

| Role      | Email                | Password     |
|-----------|-----------------------|---------------|
| Employee  | employee@evms.com     | Employee@123  |
| Director  | director@evms.com     | Director@123  |
| Accounts  | accounts@evms.com     | Accounts@123  |

---

## 4. Database Schema

**users**
| column      | type                                   | notes                     |
|-------------|----------------------------------------|----------------------------|
| id          | integer, PK                            |                            |
| name        | string                                  |                            |
| email       | string, unique                         |                            |
| password    | string                                  | bcrypt-hashed              |
| role        | enum(employee, director, accounts)     |                            |
| employeeId  | string, nullable                       | optional org employee code |
| department  | string, nullable                       |                            |

**vouchers**
| column             | type                                          | notes                              |
|--------------------|-----------------------------------------------|--------------------------------------|
| id                 | integer, PK                                   |                                       |
| voucherNumber      | string, unique                                | auto-generated e.g. `EV-2026-07-0001`|
| voucherDate        | date                                          | defaults to creation date            |
| expenseDate        | date                                          | required                             |
| department         | string                                        | required                             |
| expenseTitle       | string                                        | required                             |
| expenseCategory    | string                                        |                                       |
| expenseDescription | text                                          |                                       |
| amount             | decimal(12,2)                                 | must be > 0                          |
| employeeName       | string                                        | snapshot at creation time            |
| employeeIdCode     | string, nullable                              |                                       |
| employeeSignature  | string (file path)                            | required before submit               |
| status             | enum(draft, pending, approved, rejected)      | workflow state                       |
| directorSignature  | string (file path), nullable                  | required before approval             |
| approvalDate       | datetime, nullable                            |                                       |
| rejectionReason    | string, nullable                              | required on reject                   |
| employeeUserId     | integer, FK → users.id                        |                                       |
| createdAt/updatedAt| datetime                                       | audit timestamps (Sequelize managed) |

**voucher_histories** *(extra feature — full audit trail, see §7)*
| column             | type      | notes                                            |
|--------------------|-----------|---------------------------------------------------|
| id                 | integer   |                                                     |
| voucherId          | integer   | FK → vouchers.id                                   |
| action             | string    | created / updated / submitted / approved / rejected|
| fromStatus/toStatus| string    |                                                     |
| performedByUserId  | integer   |                                                     |
| performedByName    | string    | snapshot                                           |
| performedByRole    | string    | snapshot                                           |
| remarks            | string    | e.g. rejection reason                              |

Migrations: this project uses `sequelize.sync()` on server start, which auto-creates tables
from the models above — no separate migration files are needed for evaluation. The model
definitions themselves (`backend/src/models/*.js`) serve as the schema source of truth.

---

## 5. API Documentation

Base URL: `http://localhost:5000/api`. All endpoints except `/auth/login`
require header `Authorization: Bearer <token>`.

### Auth
| Method | Endpoint             | Role  | Description                    |
|--------|-----------------------|-------|----------------------------------|
| POST   | /auth/login             | any   | Login, returns JWT               |
| GET    | /auth/me                 | any   | Current user profile             |

There is intentionally no `/auth/register` endpoint. Accounts are provisioned
by the company by editing `backend/company-roster.csv` (see §3).

### Vouchers
| Method | Endpoint                        | Role                | Description                                  |
|--------|-----------------------------------|----------------------|-----------------------------------------------|
| POST   | /vouchers                          | employee             | Create voucher (starts as Draft)              |
| PUT    | /vouchers/:id                      | employee (owner)     | Edit — only while Draft                       |
| DELETE | /vouchers/:id                      | employee (owner)     | Delete — only while Draft                     |
| POST   | /vouchers/:id/submit                | employee (owner)     | Draft → Pending (requires signature)          |
| GET    | /vouchers/mine                      | employee             | List own vouchers                             |
| GET    | /vouchers/pending                    | director              | List Pending vouchers                         |
| POST   | /vouchers/:id/approve                | director              | Pending → Approved (requires signature)       |
| POST   | /vouchers/:id/reject                  | director              | Pending → Rejected (requires reason)          |
| GET    | /vouchers                              | director, accounts   | All vouchers + search/filter/sort query params|
| GET    | /vouchers/:id                          | any (owner-checked)  | Single voucher + audit history                |
| POST   | /vouchers/upload-signature              | employee, director   | multipart/form-data `signature` file          |

Query params supported on `GET /vouchers`: `status, department, expenseCategory,
voucherNumber, employeeName, dateFrom, dateTo, amountMin, amountMax, sortBy, sortDir`.

### Dashboard
| Method | Endpoint             | Role      |
|--------|------------------------|-----------|
| GET    | /dashboard/employee     | employee  |
| GET    | /dashboard/director     | director  |
| GET    | /dashboard/accounts      | accounts  |

---

## 6. Switching to PostgreSQL / MySQL

Edit `backend/.env`:
```env
DB_DIALECT=postgres        # or mysql
DB_HOST=localhost
DB_PORT=5432
DB_NAME=evms
DB_USER=postgres
DB_PASSWORD=postgres
```
Install the driver: `npm install pg pg-hstore` (Postgres) or `npm install mysql2` (MySQL).
No code changes are needed — `src/config/db.js` reads the dialect from `.env`.

---

## 7. What's implemented beyond the base spec

To go beyond the minimum requirements, this submission adds:

1. **Full audit trail / timeline** — every create, edit, submit, approve, and reject action is
   logged with who did it, their role, and a timestamp, and rendered as a visual timeline on
   the voucher details page. This gives the Director and Accounts team full traceability,
   which a real finance system would need for compliance.
2. **Search, filter & sort** (the bonus point) fully implemented for both Director and
   Accounts, covering all seven fields listed in the assignment (voucher #, employee,
   department, category, status, date range, amount range).
3. **Print/Download voucher** (the optional bonus) implemented via a print-optimized view —
   Accounts or anyone with access can generate a clean printable copy of any voucher.
4. **Auto-generated, human-readable voucher numbers** in the format `EV-YYYY-MM-####`,
   sequential per month, guaranteed unique at the database level.
5. **Company-managed accounts via CSV roster** — instead of open self-registration, every
   account/role/password is controlled by `backend/company-roster.csv`, synced into the database
   on every backend start. This mirrors how access would realistically be provisioned at a real
   company, and avoids the security risk of letting anyone self-assign the Director (approval)
   role.

## 8. Assumptions made during development

- Since no design mockups were provided, a custom "ledger/rubber-stamp" visual theme was
  designed for the three portals rather than reusing a generic admin-dashboard template.
- Voucher Date is auto-set to the creation date (per the workflow diagram, only Expense Date
  is user-entered).
- "Employee ID" is treated as optional free text as stated in §5 of the assignment.
- Signature images are stored on local disk under `backend/uploads/signatures` and served
  statically; in a production deployment these would go to S3/Blob storage instead.
- SQLite is used as the default database for zero-setup evaluation, with PostgreSQL/MySQL
  fully supported via a one-line `.env` change (see §6) since the assignment allows "any
  other database as well."
- Accounts, roles, and passwords are entirely company-managed via
  `backend/company-roster.csv` rather than open self-registration — this
  matches how an internal finance tool would realistically be provisioned,
  and means an evaluator can add or reset any test account by editing one
  plain-text file and restarting the backend, without needing an email or
  SMS service.

---

## 9. Manual Test Flow

1. Log in as **employee@evms.com** → New Voucher → fill form → upload signature → Save as Draft.
2. Open the voucher → Submit for Approval.
3. Log out, log in as **director@evms.com** → Pending Approvals → open the voucher → upload
   Director signature → Approve (or Reject with a reason).
4. Log out, log in as **accounts@evms.com** → All Vouchers → filter by status `approved` →
   open the voucher → view both signatures and the full audit timeline → Print/Download.
