import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import VoucherTable from "../components/VoucherTable";
import api from "../api/axios";

export default function MyVouchers() {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/vouchers/mine").then(({ data }) => {
      setVouchers(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-ledger-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-2xl font-semibold text-ledger-900">My Vouchers</h1>
          <Link to="/employee/vouchers/new" className="bg-ledger-900 text-white text-sm px-4 py-2 rounded hover:bg-ledger-800 transition">
            + New Voucher
          </Link>
        </div>
        {loading ? (
          <p className="text-ledger-400">Loading…</p>
        ) : (
          <VoucherTable vouchers={vouchers} basePath="/employee/vouchers" />
        )}
      </main>
    </div>
  );
}
