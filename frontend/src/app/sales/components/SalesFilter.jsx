"use client";

export default function SalesFilter({
  search,
  setSearch,
  customer,
  setCustomer,
  paymentStatus,
  setPaymentStatus,
}) {
  return (
    <div className="bg-white p-5 rounded-xl shadow mb-6">

      <div className="grid md:grid-cols-3 gap-4">

        <input
          type="text"
          placeholder="Search Invoice..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-lg p-3"
        />

        <select
          value={customer}
          onChange={(e) => setCustomer(e.target.value)}
          className="border rounded-lg p-3"
        >
          <option value="">All Customers</option>
          <option>John Doe</option>
          <option>Ameen</option>
          <option>Rahul</option>
          <option>Faris</option>
        </select>

        <select
          value={paymentStatus}
          onChange={(e) => setPaymentStatus(e.target.value)}
          className="border rounded-lg p-3"
        >
          <option value="">All Payments</option>
          <option>Paid</option>
          <option>Pending</option>
          <option>Partial</option>
        </select>

      </div>

    </div>
  );
}