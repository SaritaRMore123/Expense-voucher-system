import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import VoucherForm from "../components/VoucherForm";
import api from "../api/axios";

export default function EditVoucher() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [voucher, setVoucher] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/vouchers/${id}`).then(({ data }) => {
      setVoucher(data);
      setLoading(false);
    });
  }, [id]);

  const handleUpdate = async (form) => {
    await api.put(`/vouchers/${id}`, form);
    navigate(`/employee/vouchers/${id}`);
  };

  if (loading) return <div className="p-8 text-ledger-400">Loading…</div>;
  if (voucher.status !== "draft") {
    return (
      <div className="min-h-screen bg-ledger-50">
        <Navbar />
        <main className="max-w-2xl mx-auto px-6 py-16 text-center text-ledger-600">
          Only Draft vouchers can be edited. This voucher is currently <strong>{voucher.status}</strong>.
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ledger-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="font-display text-2xl font-semibold text-ledger-900 mb-1">
          Edit Draft — {voucher.voucherNumber}
        </h1>
        <p className="text-ledger-400 text-sm mb-6">Changes are saved back to the same draft.</p>
        <VoucherForm initial={voucher} onSubmit={handleUpdate} submitLabel="Save Changes" />
      </main>
    </div>
  );
}
