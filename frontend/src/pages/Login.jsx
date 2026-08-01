import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const roleHome = { employee: "/employee", director: "/director", accounts: "/accounts" };

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(email, password);
      navigate(roleHome[user.role] || "/");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ledger-950 flex">
      {/* Left branding / security panel */}
      <div className="hidden lg:flex flex-col justify-between w-[46%] px-14 py-14 bg-gradient-to-br from-ledger-950 via-ledger-900 to-ledger-800 relative overflow-hidden">
        <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full border border-ledger-700/40" />
        <div className="absolute -right-10 top-40 w-64 h-64 rounded-full border border-stamp-amber/20" />

        <div className="relative">
          <p className="font-mono-voucher text-stamp-amber text-xs tracking-widest uppercase mb-3">
            Prachay Private Limited
          </p>
          <h1 className="font-display text-4xl text-ledger-50 font-semibold leading-tight mb-4">
            Expense Voucher<br />Management System
          </h1>
          <p className="text-ledger-300 text-sm max-w-sm leading-relaxed">
            One secure ledger for every reimbursement — from submission to Director
            approval to final payout, fully auditable at every step.
          </p>
        </div>

        <div className="relative space-y-5">
          <div className="flex gap-3">
            <span className="stamp text-stamp-green shrink-0">Encrypted</span>
            <p className="text-ledger-300 text-xs leading-relaxed pt-0.5">
              Passwords are hashed with bcrypt and never stored or logged in plain text.
            </p>
          </div>
          <div className="flex gap-3">
            <span className="stamp text-stamp-amber shrink-0">Company-issued</span>
            <p className="text-ledger-300 text-xs leading-relaxed pt-0.5">
              Every login is company-provisioned — there's no public sign-up, so access
              can't be self-granted.
            </p>
          </div>
          <div className="flex gap-3">
            <span className="stamp text-ledger-200 shrink-0">Audited</span>
            <p className="text-ledger-300 text-xs leading-relaxed pt-0.5">
              Every approval, rejection, and edit is timestamped in a permanent voucher history.
            </p>
          </div>
        </div>

        <p className="relative text-ledger-500 text-[11px]">
          © {new Date().getFullYear()} Prachay Private Limited. Internal use only.
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <h1 className="font-display text-3xl text-ledger-50 font-semibold">EVMS</h1>
            <p className="text-ledger-400 text-sm font-mono-voucher mt-1">Expense Voucher Management System</p>
          </div>

          <div className="bg-ledger-50 rounded-lg shadow-xl p-8">
            <h2 className="font-display text-xl font-semibold text-ledger-900 mb-1">Log in</h2>
            <p className="text-xs text-ledger-400 mb-6">
              Use the official email and password issued to you by the company.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ledger-800 mb-1">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                  className="w-full border border-ledger-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ledger-600" />
              </div>
              <div>
                <label className="block text-sm font-medium text-ledger-800 mb-1">Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                  className="w-full border border-ledger-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ledger-600" />
              </div>

              {error && <p className="text-stamp-rust text-sm">{error}</p>}

              <button type="submit" disabled={loading}
                className="w-full bg-ledger-900 text-white rounded py-2.5 text-sm font-medium hover:bg-ledger-800 transition disabled:opacity-50">
                {loading ? "Logging in…" : "Log in"}
              </button>
            </form>

            <div className="mt-6 text-xs text-ledger-400 border-t border-ledger-200 pt-4 space-y-2">
              <p>
                No account, or forgotten your password? Accounts and passwords are managed by your
                company administrator — contact them for access.
              </p>
              <div className="space-y-1">
                <p className="font-medium text-ledger-600">Demo accounts (from company-roster.csv):</p>
                <p>employee@evms.com / Employee@123</p>
                <p>director@evms.com / Director@123</p>
                <p>accounts@evms.com / Accounts@123</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
