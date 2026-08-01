const styleMap = {
  draft: "text-ledger-400",
  pending: "text-stamp-amber",
  approved: "text-stamp-green",
  rejected: "text-stamp-rust",
};

const labelMap = {
  draft: "Draft",
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

export default function StatusStamp({ status }) {
  return (
    <span className={`stamp ${styleMap[status] || "text-ledger-400"}`}>
      {labelMap[status] || status}
    </span>
  );
}
