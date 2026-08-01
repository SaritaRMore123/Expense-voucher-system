export default function FilterBar({ filters, setFilters, onApply }) {
  const handleChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    onApply();
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-ledger-200 rounded-lg p-4 mb-5">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <input name="voucherNumber" value={filters.voucherNumber} onChange={handleChange}
          placeholder="Voucher #" className="border border-ledger-200 rounded px-2 py-1.5 text-sm" />
        <input name="employeeName" value={filters.employeeName} onChange={handleChange}
          placeholder="Employee" className="border border-ledger-200 rounded px-2 py-1.5 text-sm" />
        <input name="department" value={filters.department} onChange={handleChange}
          placeholder="Department" className="border border-ledger-200 rounded px-2 py-1.5 text-sm" />
        <input name="expenseCategory" value={filters.expenseCategory} onChange={handleChange}
          placeholder="Category" className="border border-ledger-200 rounded px-2 py-1.5 text-sm" />
        <select name="status" value={filters.status} onChange={handleChange}
          className="border border-ledger-200 rounded px-2 py-1.5 text-sm">
          <option value="">Any status</option>
          <option value="draft">Draft</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <input type="date" name="dateFrom" value={filters.dateFrom} onChange={handleChange}
          className="border border-ledger-200 rounded px-2 py-1.5 text-sm" />
        <input type="date" name="dateTo" value={filters.dateTo} onChange={handleChange}
          className="border border-ledger-200 rounded px-2 py-1.5 text-sm" />
      </div>
      <div className="flex items-center gap-3 mt-3">
        <select name="sortBy" value={filters.sortBy} onChange={handleChange}
          className="border border-ledger-200 rounded px-2 py-1.5 text-sm">
          <option value="createdAt">Sort: Created date</option>
          <option value="amount">Sort: Amount</option>
          <option value="expenseDate">Sort: Expense date</option>
          <option value="voucherNumber">Sort: Voucher #</option>
        </select>
        <select name="sortDir" value={filters.sortDir} onChange={handleChange}
          className="border border-ledger-200 rounded px-2 py-1.5 text-sm">
          <option value="DESC">Descending</option>
          <option value="ASC">Ascending</option>
        </select>
        <button type="submit" className="bg-ledger-900 text-white text-sm px-4 py-1.5 rounded hover:bg-ledger-800 transition">
          Apply filters
        </button>
      </div>
    </form>
  );
}
