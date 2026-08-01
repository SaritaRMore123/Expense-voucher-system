export default function StatCard({ label, value, accent = "text-ledger-900" }) {
  return (
    <div className="bg-white border border-ledger-200 rounded-lg p-5">
      <p className="text-xs uppercase tracking-wide text-ledger-400 font-mono-voucher mb-2">{label}</p>
      <p className={`font-display text-2xl font-semibold ${accent}`}>{value}</p>
    </div>
  );
}
