import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const roleHome = {
  employee: "/employee",
  director: "/director",
  accounts: "/accounts",
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="bg-ledger-950 text-ledger-50 border-b border-ledger-700">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to={roleHome[user.role]} className="flex items-baseline gap-2">
          <span className="font-display text-xl font-semibold tracking-tight">EVMS</span>
          <span className="text-ledger-400 text-xs font-mono-voucher hidden sm:inline">
            Expense Voucher Ledger
          </span>
        </Link>

        <nav className="flex items-center gap-5 text-sm">
          {user.role === "employee" && (
            <>
              <Link to="/employee" className="hover:text-stamp-amber transition">Dashboard</Link>
              <Link to="/employee/vouchers" className="hover:text-stamp-amber transition">My Vouchers</Link>
              <Link to="/employee/vouchers/new" className="hover:text-stamp-amber transition">New Voucher</Link>
            </>
          )}
          {user.role === "director" && (
            <>
              <Link to="/director" className="hover:text-stamp-amber transition">Dashboard</Link>
              <Link to="/director/pending" className="hover:text-stamp-amber transition">Pending Approvals</Link>
              <Link to="/director/vouchers" className="hover:text-stamp-amber transition">All Vouchers</Link>
            </>
          )}
          {user.role === "accounts" && (
            <>
              <Link to="/accounts" className="hover:text-stamp-amber transition">Dashboard</Link>
              <Link to="/accounts/vouchers" className="hover:text-stamp-amber transition">All Vouchers</Link>
            </>
          )}

          <div className="flex items-center gap-3 pl-4 border-l border-ledger-700">
            <span className="text-ledger-400 text-xs">
              {user.name} · <span className="uppercase">{user.role}</span>
            </span>
            <button
              onClick={handleLogout}
              className="text-xs font-medium px-3 py-1.5 rounded border border-ledger-600 hover:bg-ledger-800 transition"
            >
              Log out
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}
