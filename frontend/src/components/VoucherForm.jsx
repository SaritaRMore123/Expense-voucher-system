import { useState } from "react";
import SignatureUpload from "./SignatureUpload";

const categories = ["Travel", "Meals", "Accommodation", "Office Supplies", "Client Entertainment", "Communication", "Other"];

export default function VoucherForm({ initial, onSubmit, submitLabel = "Save as Draft" }) {
  const [form, setForm] = useState({
    department: initial?.department || "",
    expenseTitle: initial?.expenseTitle || "",
    expenseCategory: initial?.expenseCategory || categories[0],
    expenseDate: initial?.expenseDate || "",
    expenseDescription: initial?.expenseDescription || "",
    amount: initial?.amount || "",
    employeeIdCode: initial?.employeeIdCode || "",
    employeeSignature: initial?.employeeSignature || "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (Number(form.amount) <= 0) {
      setError("Amount must be greater than zero");
      return;
    }
    setSaving(true);
    try {
      await onSubmit(form);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-ledger-200 rounded-lg p-6 space-y-5 max-w-2xl">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-ledger-800 mb-1">Department *</label>
          <input name="department" value={form.department} onChange={handleChange} required
            className="w-full border border-ledger-200 rounded px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-ledger-800 mb-1">Employee ID (optional)</label>
          <input name="employeeIdCode" value={form.employeeIdCode} onChange={handleChange}
            className="w-full border border-ledger-200 rounded px-3 py-2 text-sm" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-ledger-800 mb-1">Expense Title *</label>
        <input name="expenseTitle" value={form.expenseTitle} onChange={handleChange} required
          className="w-full border border-ledger-200 rounded px-3 py-2 text-sm" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-ledger-800 mb-1">Expense Category</label>
          <select name="expenseCategory" value={form.expenseCategory} onChange={handleChange}
            className="w-full border border-ledger-200 rounded px-3 py-2 text-sm">
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-ledger-800 mb-1">Expense Date *</label>
          <input type="date" name="expenseDate" value={form.expenseDate} onChange={handleChange} required
            className="w-full border border-ledger-200 rounded px-3 py-2 text-sm" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-ledger-800 mb-1">Description</label>
        <textarea name="expenseDescription" value={form.expenseDescription} onChange={handleChange} rows={3}
          className="w-full border border-ledger-200 rounded px-3 py-2 text-sm" />
      </div>

      <div>
        <label className="block text-sm font-medium text-ledger-800 mb-1">Amount (₹) *</label>
        <input type="number" step="0.01" min="0.01" name="amount" value={form.amount} onChange={handleChange} required
          className="w-full border border-ledger-200 rounded px-3 py-2 text-sm" />
      </div>

      <SignatureUpload
        label="Employee Signature (required before submission)"
        existingPath={form.employeeSignature}
        onUploaded={(path) => setForm({ ...form, employeeSignature: path })}
      />

      {error && <p className="text-stamp-rust text-sm">{error}</p>}

      <button type="submit" disabled={saving}
        className="bg-ledger-900 text-white px-5 py-2.5 rounded text-sm font-medium hover:bg-ledger-800 transition disabled:opacity-50">
        {saving ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
