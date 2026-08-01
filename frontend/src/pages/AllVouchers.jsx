import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import VoucherTable from "../components/VoucherTable";
import FilterBar from "../components/FilterBar";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const emptyFilters = {
  voucherNumber: "", employeeName: "", department: "", expenseCategory: "",
  status: "", dateFrom: "", dateTo: "", sortBy: "createdAt", sortDir: "DESC",
};

export default function AllVouchers() {
  const { user } = useAuth();
  const [vouchers, setVouchers] = useState([]);
  const [filters, setFilters] = useState(emptyFilters);
  const [loading, setLoading] = useState(true);

  const basePath = user.role === "director" ? "/director/vouchers" : "/accounts/vouchers";

  const fetchVouchers = () => {
    setLoading(true);
    const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ""));
    api.get("/vouchers", { params }).then(({ data }) => {
      setVouchers(data);
      setLoading(false);
    });
  };

  useEffect(() => { fetchVouchers(); }, []);

  return (
    <div className="min-h-screen bg-ledger-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="font-display text-2xl font-semibold text-ledger-900 mb-6">All Vouchers</h1>
        <FilterBar filters={filters} setFilters={setFilters} onApply={fetchVouchers} />
        {loading ? <p className="text-ledger-400">Loading…</p> : (
          <VoucherTable vouchers={vouchers} basePath={basePath} showEmployee />
        )}
      </main>
    </div>
  );
}
