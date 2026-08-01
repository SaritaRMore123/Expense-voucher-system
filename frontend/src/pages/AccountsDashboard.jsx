import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import StatCard from "../components/StatCard";
import VoucherTable from "../components/VoucherTable";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function AccountsDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("/dashboard/accounts").then(({ data }) => setStats(data));
  }, []);

  return (
    <div className="min-h-screen bg-ledger-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="font-display text-2xl font-semibold text-ledger-900 mb-1">Welcome, {user.name}</h1>
        <p className="text-ledger-400 text-sm mb-6">Reimbursement processing overview across the organization.</p>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <StatCard label="Total Vouchers" value={stats.total} />
            <StatCard label="Pending Approval" value={stats.pending} accent="text-stamp-amber" />
            <StatCard label="Approved" value={stats.approved} accent="text-stamp-green" />
            <StatCard label="Rejected" value={stats.rejected} accent="text-stamp-rust" />
            <StatCard label="Total Approved Amount" value={`₹${Number(stats.totalApprovedAmount).toLocaleString("en-IN")}`} />
          </div>
        )}

        <h2 className="font-display text-lg font-semibold text-ledger-900 mb-3">Recently Approved (Ready for Reimbursement)</h2>
        <VoucherTable vouchers={stats?.recentApproved || []} basePath="/accounts/vouchers" showEmployee />
      </main>
    </div>
  );
}
