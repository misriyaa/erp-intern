"use client";

import Link from "next/link";

export default function SalesTable({ sales = [] }) {
  return (
    <div className="tableWrapper">
      <table className="table">
        <thead>
          <tr>
            <th>Invoice</th>
            <th>Customer</th>
            <th>Cashier</th>
            <th>Date</th>
            <th>Payment</th>
            <th style={{ textAlign: "center" }}>Status</th>
            <th style={{ textAlign: "right" }}>Total</th>
            <th style={{ textAlign: "center" }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {sales.length === 0 && (
            <tr>
              <td colSpan={8} style={{ textAlign: "center", padding: "30px 0" }}>
                No Sales Found
              </td>
            </tr>
          )}

          {sales.map((sale) => {
            const statusClass =
              sale.paymentStatus === "Paid"
                ? "paidStatus"
                : sale.paymentStatus === "Pending"
                ? "pendingStatus"
                : "cancelledStatus";

            return (
              <tr key={sale.id}>
                <td style={{ fontWeight: "700", color: "#1f344d" }}>
                  {sale.invoiceNo}
                </td>
                <td>{sale.customer}</td>
                <td>{sale.cashier}</td>
                <td>{sale.date}</td>
                <td>{sale.paymentMethod}</td>
                <td style={{ textAlign: "center" }}>
                  <span className={statusClass}>
                    {sale.paymentStatus}
                  </span>
                </td>
                <td style={{ textAlign: "right", fontWeight: "700", color: "#1f344d" }}>
                  ₹{sale.total.toLocaleString()}
                </td>
                <td>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <Link
                      href={`/sales/${sale.id}`}
                      className="viewButton"
                    >
                      View
                    </Link>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}