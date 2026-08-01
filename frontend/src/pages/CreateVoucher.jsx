import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import VoucherForm from "../components/VoucherForm";
import api from "../api/axios";

export default function CreateVoucher() {
  const navigate = useNavigate();

  const handleCreate = async (form) => {
    const { data } = await api.post("/vouchers", form);
    navigate(`/employee/vouchers/${data.id}`);
  };

  return (
    <div className="min-h-screen bg-ledger-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="font-display text-2xl font-semibold text-ledger-900 mb-1">New Expense Voucher</h1>
        <p className="text-ledger-400 text-sm mb-6">It will be saved as a Draft. Submit it for approval once ready.</p>
        <VoucherForm onSubmit={handleCreate} submitLabel="Save as Draft" />
      </main>
    </div>
  );
}
