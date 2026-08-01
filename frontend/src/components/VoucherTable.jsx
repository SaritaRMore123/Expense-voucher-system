import { useNavigate } from "react-router-dom";
import StatusStamp from "./StatusStamp";

export default function VoucherTable({ vouchers, basePath, showEmployee = false }) {
  const navigate = useNavigate();

  if (!vouchers.length) {
    return (
      <div className="text-center py-16 text-ledger-400 text-sm border border-dashed border-ledger-200 rounded-lg">
        No vouchers to show.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-ledger-200 rounded-lg">
      <table className="w-full text-sm">
        <thead className="bg-ledger-900 text-ledger-50 text-left">
          <tr>
            <th className="px-4 py-3 font-mono-voucher font-normal">Voucher #</th>
            {showEmployee && <th className="px-4 py-3 font-normal">Employee</th>}
            <th className="px-4 py-3 font-normal">Department</th>
            <th className="px-4 py-3 font-normal">Title</th>
            <th className="px-4 py-3 font-normal">Expense Date</th>
            <th className="px-4 py-3 font-normal text-right">Amount</th>
            <th className="px-4 py-3 font-normal">Status</th>
          </tr>
        </thead>
        <tbody>
          {vouchers.map((v, i) => (
            <tr
              key={v.id}
              onClick={() => navigate(`${basePath}/${v.id}`)}
              className={`cursor-pointer hover:bg-ledger-50 transition ${i % 2 ? "bg-white" : "bg-ledger-50/40"}`}
            >
              <td className="px-4 py-3 font-mono-voucher text-ledger-700">{v.voucherNumber}</td>
              {showEmployee && <td className="px-4 py-3">{v.employeeName}</td>}
              <td className="px-4 py-3">{v.department}</td>
              <td className="px-4 py-3">{v.expenseTitle}</td>
              <td className="px-4 py-3">{v.expenseDate}</td>
              <td className="px-4 py-3 text-right font-mono-voucher">
                ₹{Number(v.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </td>
              <td className="px-4 py-3"><StatusStamp status={v.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
