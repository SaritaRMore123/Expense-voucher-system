import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import StatCard from "../components/StatCard";
import VoucherTable from "../components/VoucherTable";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    api.get("/dashboard/employee").then(({ data }) => setStats(data));
    api.get("/vouchers/mine").then(({ data }) => setRecent(data.slice(0, 5)));
  }, []);

  return (
    <div className="min-h-screen bg-ledger-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-semibold text-ledger-900">Welcome, {user.name}</h1>
            <p className="text-ledger-400 text-sm">Here's a summary of your expense vouchers.</p>
          </div>
          <Link to="/employee/vouchers/new" className="bg-ledger-900 text-white text-sm px-4 py-2 rounded hover:bg-ledger-800 transition">
            + New Voucher
          </Link>
        </div>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <StatCard label="Total" value={stats.total} />
            <StatCard label="Draft" value={stats.draft} accent="text-ledger-600" />
            <StatCard label="Pending" value={stats.pending} accent="text-stamp-amber" />
            <StatCard label="Approved" value={stats.approved} accent="text-stamp-green" />
            <StatCard label="Rejected" value={stats.rejected} accent="text-stamp-rust" />
            <StatCard label="Total Claimed" value={`₹${Number(stats.totalAmountClaimed).toLocaleString("en-IN")}`} />
          </div>
        )}

        <h2 className="font-display text-lg font-semibold text-ledger-900 mb-3">Recent Vouchers</h2>
        <VoucherTable vouchers={recent} basePath="/employee/vouchers" />
      </main>
    </div>
  );
}
