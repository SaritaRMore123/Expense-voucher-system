import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import StatCard from "../components/StatCard";
import VoucherTable from "../components/VoucherTable";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function DirectorDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("/dashboard/director").then(({ data }) => setStats(data));
  }, []);

  return (
    <div className="min-h-screen bg-ledger-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="font-display text-2xl font-semibold text-ledger-900 mb-1">Welcome, {user.name}</h1>
        <p className="text-ledger-400 text-sm mb-6">Organization-wide voucher approval overview.</p>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard label="Pending Approval" value={stats.pendingApproval} accent="text-stamp-amber" />
            <StatCard label="Approved Today" value={stats.approvedToday} accent="text-stamp-green" />
            <StatCard label="Rejected Today" value={stats.rejectedToday} accent="text-stamp-rust" />
            <StatCard label="Total Pending Amount" value={`₹${Number(stats.totalPendingAmount).toLocaleString("en-IN")}`} />
          </div>
        )}

        <h2 className="font-display text-lg font-semibold text-ledger-900 mb-3">Recent Activity</h2>
        <VoucherTable vouchers={stats?.recent || []} basePath="/director/vouchers" showEmployee />
      </main>
    </div>
  );
}
