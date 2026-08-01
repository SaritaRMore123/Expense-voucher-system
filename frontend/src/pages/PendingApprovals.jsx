import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import VoucherTable from "../components/VoucherTable";
import api from "../api/axios";

export default function PendingApprovals() {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/vouchers/pending").then(({ data }) => {
      setVouchers(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-ledger-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="font-display text-2xl font-semibold text-ledger-900 mb-6">Pending Approvals</h1>
        {loading ? <p className="text-ledger-400">Loading…</p> : (
          <VoucherTable vouchers={vouchers} basePath="/director/vouchers" showEmployee />
        )}
      </main>
    </div>
  );
}
