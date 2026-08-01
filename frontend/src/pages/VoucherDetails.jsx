import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import StatusStamp from "../components/StatusStamp";
import SignatureUpload from "../components/SignatureUpload";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function VoucherDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [voucher, setVoucher] = useState(null);
  const [directorSignature, setDirectorSignature] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectBox, setShowRejectBox] = useState(false);
  const [error, setError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = () =>
    api
      .get(`/vouchers/${id}`)
      .then(({ data }) => setVoucher(data))
      .catch((err) => setLoadError(err.response?.data?.message || "Failed to load this voucher."));

  useEffect(() => { load(); }, [id]);

  if (loadError) return (
    <div className="min-h-screen bg-ledger-50">
      <Navbar />
      <p className="p-8 text-stamp-rust">{loadError}</p>
    </div>
  );

  if (!voucher) return (
    <div className="min-h-screen bg-ledger-50"><Navbar /><p className="p-8 text-ledger-400">Loading…</p></div>
  );

  const isOwner = user.role === "employee" && voucher.employeeUserId === user.id;
  const basePath = user.role === "employee" ? "/employee/vouchers" : user.role === "director" ? "/director/vouchers" : "/accounts/vouchers";

  const handleSubmit = async () => {
    setError(""); setBusy(true);
    try {
      await api.post(`/vouchers/${id}/submit`);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Submit failed");
    } finally { setBusy(false); }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this draft voucher? This cannot be undone.")) return;
    await api.delete(`/vouchers/${id}`);
    navigate(basePath);
  };

  const handleApprove = async () => {
    setError(""); setBusy(true);
    try {
      await api.post(`/vouchers/${id}/approve`, { directorSignature });
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Approval failed");
    } finally { setBusy(false); }
  };

  const handleReject = async () => {
    setError(""); setBusy(true);
    try {
      await api.post(`/vouchers/${id}/reject`, { rejectionReason });
      setShowRejectBox(false);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Rejection failed");
    } finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen bg-ledger-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 py-8 print:max-w-full">
        <div className="flex items-start justify-between mb-6 print:hidden">
          <div>
            <Link to={basePath} className="text-xs text-ledger-400 hover:text-ledger-700">&larr; Back to list</Link>
            <h1 className="font-display text-2xl font-semibold text-ledger-900 mt-1">{voucher.expenseTitle}</h1>
          </div>
          <button onClick={() => window.print()} className="border border-ledger-300 text-ledger-700 text-sm px-4 py-2 rounded hover:bg-white transition">
            Print / Download
          </button>
        </div>

        <div className="bg-white border border-ledger-200 rounded-lg p-8 print:border-none">
          <div className="flex items-center justify-between border-b border-ledger-100 pb-4 mb-6">
            <div>
              <p className="font-mono-voucher text-ledger-500 text-sm">{voucher.voucherNumber}</p>
              <p className="text-xs text-ledger-400">Voucher Date: {voucher.voucherDate}</p>
            </div>
            <StatusStamp status={voucher.status} />
          </div>

          <dl className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm mb-6">
            <div><dt className="text-ledger-400">Employee</dt><dd className="font-medium">{voucher.employeeName}{voucher.employeeIdCode ? ` (${voucher.employeeIdCode})` : ""}</dd></div>
            <div><dt className="text-ledger-400">Department</dt><dd className="font-medium">{voucher.department}</dd></div>
            <div><dt className="text-ledger-400">Expense Category</dt><dd className="font-medium">{voucher.expenseCategory || "—"}</dd></div>
            <div><dt className="text-ledger-400">Expense Date</dt><dd className="font-medium">{voucher.expenseDate}</dd></div>
            <div className="col-span-2"><dt className="text-ledger-400">Description</dt><dd>{voucher.expenseDescription || "—"}</dd></div>
            <div><dt className="text-ledger-400">Amount</dt><dd className="font-mono-voucher font-semibold text-lg">₹{Number(voucher.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</dd></div>
          </dl>

          <div className="grid grid-cols-2 gap-8 border-t border-ledger-100 pt-6 mb-6">
            <div>
              <p className="text-xs text-ledger-400 mb-2">Employee Signature</p>
              {voucher.employeeSignature
                ? <img src={voucher.employeeSignature} alt="employee signature" className="h-16" />
                : <p className="text-xs text-ledger-300 italic">Not signed yet</p>}
            </div>
            <div>
              <p className="text-xs text-ledger-400 mb-2">Director Signature</p>
              {voucher.directorSignature
                ? <img src={voucher.directorSignature} alt="director signature" className="h-16" />
                : <p className="text-xs text-ledger-300 italic">Awaiting approval</p>}
            </div>
          </div>

          {voucher.status === "rejected" && voucher.rejectionReason && (
            <div className="bg-stamp-rust/5 border border-stamp-rust/30 rounded p-4 mb-6 text-sm">
              <p className="text-stamp-rust font-medium mb-1">Rejection Reason</p>
              <p className="text-ledger-700">{voucher.rejectionReason}</p>
            </div>
          )}

          {error && <p className="text-stamp-rust text-sm mb-4">{error}</p>}

          {/* Employee actions on own Draft voucher */}
          {isOwner && voucher.status === "draft" && (
            <div className="flex gap-3 print:hidden">
              <Link to={`/employee/vouchers/${voucher.id}/edit`} className="border border-ledger-300 text-ledger-700 text-sm px-4 py-2 rounded hover:bg-ledger-50 transition">Edit</Link>
              <button onClick={handleDelete} className="border border-stamp-rust text-stamp-rust text-sm px-4 py-2 rounded hover:bg-stamp-rust/5 transition">Delete</button>
              <button onClick={handleSubmit} disabled={busy || !voucher.employeeSignature}
                className="bg-ledger-900 text-white text-sm px-4 py-2 rounded hover:bg-ledger-800 transition disabled:opacity-50">
                {busy ? "Submitting…" : "Submit for Approval"}
              </button>
              {!voucher.employeeSignature && <p className="text-xs text-ledger-400 self-center">Upload your signature first (edit voucher).</p>}
            </div>
          )}

          {/* Director actions on Pending voucher */}
          {user.role === "director" && voucher.status === "pending" && (
            <div className="border-t border-ledger-100 pt-6 space-y-4 print:hidden">
              <SignatureUpload label="Your Signature (required to approve)" existingPath={directorSignature} onUploaded={setDirectorSignature} />
              <div className="flex gap-3">
                <button onClick={handleApprove} disabled={busy || !directorSignature}
                  className="bg-stamp-green text-white text-sm px-4 py-2 rounded hover:opacity-90 transition disabled:opacity-50">
                  Approve
                </button>
                <button onClick={() => setShowRejectBox(!showRejectBox)}
                  className="border border-stamp-rust text-stamp-rust text-sm px-4 py-2 rounded hover:bg-stamp-rust/5 transition">
                  Reject
                </button>
              </div>
              {showRejectBox && (
                <div className="flex gap-3 items-start">
                  <textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Reason for rejection (required)" rows={2}
                    className="flex-1 border border-ledger-200 rounded px-3 py-2 text-sm" />
                  <button onClick={handleReject} disabled={busy || !rejectionReason.trim()}
                    className="bg-stamp-rust text-white text-sm px-4 py-2 rounded hover:opacity-90 transition disabled:opacity-50">
                    Confirm Reject
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Audit trail / timeline - extra feature */}
        {voucher.history && voucher.history.length > 0 && (
          <div className="mt-8 print:hidden">
            <h2 className="font-display text-lg font-semibold text-ledger-900 mb-3">Timeline</h2>
            <ol className="border-l-2 border-ledger-200 pl-5 space-y-4">
              {voucher.history.map((h) => (
                <li key={h.id} className="relative">
                  <span className="absolute -left-[26px] top-1 w-3 h-3 rounded-full bg-ledger-600" />
                  <p className="text-sm font-medium text-ledger-800 capitalize">{h.action}{h.toStatus ? ` → ${h.toStatus}` : ""}</p>
                  <p className="text-xs text-ledger-400">
                    {h.performedByName} ({h.performedByRole}) · {new Date(h.createdAt).toLocaleString()}
                  </p>
                  {h.remarks && <p className="text-xs text-ledger-500 italic mt-0.5">"{h.remarks}"</p>}
                </li>
              ))}
            </ol>
          </div>
        )}
      </main>
    </div>
  );
}
