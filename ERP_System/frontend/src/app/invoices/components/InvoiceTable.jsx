"use client";

import { FiEye, FiPrinter } from "react-icons/fi";

export default function InvoiceTable({ invoices = [], onView, onPrint }) {
  return (
    <div style={{ background: "#ffffff", borderRadius: "14px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.03)", overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
        <thead>
          <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
            <th style={{ padding: "14px 18px", fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Invoice Number
            </th>
            <th style={{ padding: "14px 18px", fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Customer
            </th>
            <th style={{ padding: "14px 18px", fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Date
            </th>
            <th style={{ padding: "14px 18px", fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Reference / Order Number
            </th>
            <th style={{ padding: "14px 18px", fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "right" }}>
              Amount
            </th>
            <th style={{ padding: "14px 18px", fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "center" }}>
              Payment Status
            </th>
            <th style={{ padding: "14px 18px", fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "center" }}>
              Invoice Status
            </th>
            <th style={{ padding: "14px 18px", fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "center" }}>
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {invoices.length === 0 ? (
            <tr>
              <td colSpan={8} style={{ textAlign: "center", padding: "40px 20px", color: "#64748b", fontWeight: "500" }}>
                No invoices found.
              </td>
            </tr>
          ) : (
            invoices.map((invoice) => {
              const paymentStatus = invoice.paymentStatus || (invoice.status === "COMPLETED" ? "Paid" : "Pending");
              const isPaid = paymentStatus.toUpperCase() === "PAID";
              const isPending = paymentStatus.toUpperCase() === "PENDING";
              const invoiceStatus = invoice.status || (isPaid ? "PAID" : "DRAFT");

              return (
                <tr key={invoice.id} style={{ borderBottom: "1px solid #f1f5f9", transition: "background-color 0.15s ease" }} onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8fafc")} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}>
                  <td style={{ padding: "14px 18px", fontWeight: "700", color: "#1e293b", whiteSpace: "nowrap" }}>
                    {invoice.invoiceNumber || invoice.invoiceNo}
                  </td>
                  <td style={{ padding: "14px 18px", fontWeight: "600", color: "#334155", whiteSpace: "nowrap" }}>
                    {invoice.customerName || invoice.customer || "Walk-in Customer"}
                  </td>
                  <td style={{ padding: "14px 18px", color: "#64748b", whiteSpace: "nowrap" }}>
                    {invoice.date || (invoice.invoiceDate ? new Date(invoice.invoiceDate).toISOString().split("T")[0] : "N/A")}
                  </td>
                  <td style={{ padding: "14px 18px", color: "#475569", whiteSpace: "nowrap" }}>
                    {invoice.referenceNumber || invoice.salesOrderNumber || invoice.orderNumber || invoice.invoiceNumber || "N/A"}
                  </td>
                  <td style={{ padding: "14px 18px", textAlign: "right", fontWeight: "800", color: "#0f172a", whiteSpace: "nowrap" }}>
                    ₹{Number(invoice.totalAmount ?? invoice.total ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ padding: "14px 18px", textAlign: "center", whiteSpace: "nowrap" }}>
                    <span style={{
                      display: "inline-block",
                      padding: "3px 10px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: "700",
                      backgroundColor: isPaid ? "#ecfdf5" : isPending ? "#fef3c7" : "#fee2e2",
                      color: isPaid ? "#16a34a" : isPending ? "#d97706" : "#dc2626",
                    }}>
                      {paymentStatus}
                    </span>
                  </td>
                  <td style={{ padding: "14px 18px", textAlign: "center", whiteSpace: "nowrap" }}>
                    <span style={{
                      display: "inline-block",
                      padding: "3px 10px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: "700",
                      backgroundColor: "#e0e7ff",
                      color: "#3730a3",
                    }}>
                      {invoiceStatus}
                    </span>
                  </td>
                  <td style={{ padding: "14px 18px", textAlign: "center", whiteSpace: "nowrap" }}>
                    <div style={{ display: "flex", justifyContent: "center", gap: "8px" }}>
                      <button
                        type="button"
                        onClick={() => onView(invoice)}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                          backgroundColor: "#eff6ff",
                          color: "#2563eb",
                          border: "1px solid #bfdbfe",
                          padding: "6px 12px",
                          borderRadius: "8px",
                          fontSize: "13px",
                          fontWeight: "600",
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#2563eb"; e.currentTarget.style.color = "#ffffff"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#eff6ff"; e.currentTarget.style.color = "#2563eb"; }}
                        title="View Details"
                      >
                        <FiEye size={14} />
                        <span>View</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onPrint(invoice)}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                          backgroundColor: "#f8fafc",
                          color: "#334155",
                          border: "1px solid #cbd5e1",
                          padding: "6px 12px",
                          borderRadius: "8px",
                          fontSize: "13px",
                          fontWeight: "600",
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#1e293b"; e.currentTarget.style.color = "#ffffff"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#f8fafc"; e.currentTarget.style.color = "#334155"; }}
                        title="Print Invoice"
                      >
                        <FiPrinter size={14} />
                        <span>Print</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
