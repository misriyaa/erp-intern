"use client";

import { useEffect, useState } from "react";
import { FiShoppingCart, FiPlus, FiTrash2 } from "react-icons/fi";

export default function MedicinePurchases() {
  const [purchases, setPurchases] = useState([
    { id: "p1", invoiceNumber: "INV-MED-0291", supplier: "Global Pharma Inc.", date: "2026-08-20", amount: 1550.00, items: 3 },
    { id: "p2", invoiceNumber: "INV-MED-0292", supplier: "Apex Drug Distributors", date: "2026-08-22", amount: 2800.00, items: 5 }
  ]);

  return (
    <div style={{ padding: "24px", fontFamily: "Inter, sans-serif", backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#0f172a", margin: 0 }}>Medicine Purchase Logs</h1>
        <p style={{ color: "#64748b", margin: "4px 0 0 0" }}>View batch procurement lists, match supplier invoices, and track purchase payments.</p>
      </div>

      <div style={{ background: "#ffffff", borderRadius: "16px", padding: "24px", border: "1px solid #e2e8f0" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #cbd5e1", textAlign: "left", fontSize: "12px", color: "#64748b" }}>
                <th style={{ padding: "12px" }}>SUPPLIER INVOICE NO</th>
                <th style={{ padding: "12px" }}>SUPPLIER DISTRIBUTOR</th>
                <th style={{ padding: "12px" }}>PURCHASE DATE</th>
                <th style={{ padding: "12px", textAlign: "right" }}>ITEMS COUNT</th>
                <th style={{ padding: "12px", textAlign: "right" }}>TOTAL BILL</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map(p => (
                <tr key={p.id} style={{ borderBottom: "1px solid #f1f5f9", fontSize: "14px" }}>
                  <td style={{ padding: "12px", fontWeight: "700", color: "#10b981" }}>{p.invoiceNumber}</td>
                  <td style={{ padding: "12px" }}>{p.supplier}</td>
                  <td style={{ padding: "12px", color: "#64748b" }}>{p.date}</td>
                  <td style={{ padding: "12px", textAlign: "right" }}>{p.items} drugs</td>
                  <td style={{ padding: "12px", textAlign: "right", fontWeight: "700" }}>${p.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
