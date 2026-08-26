"use client";

import { useEffect, useState } from "react";
import { FiTrash2 } from "react-icons/fi";

export default function MedicineReturns() {
  const [returns, setReturns] = useState([
    { id: "r1", returnNumber: "RET-MED-0012", supplier: "Global Pharma Inc.", date: "2026-08-25", items: 2, amount: 240.00, status: "DISPATCHED" }
  ]);

  return (
    <div style={{ padding: "24px", fontFamily: "Inter, sans-serif", backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#0f172a", margin: 0 }}>Supplier Returns (Damaged / Expired)</h1>
        <p style={{ color: "#64748b", margin: "4px 0 0 0" }}>Process returns for expired drug batches and verify distributor credit refunds.</p>
      </div>

      <div style={{ background: "#ffffff", borderRadius: "16px", padding: "24px", border: "1px solid #e2e8f0" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #cbd5e1", textAlign: "left", fontSize: "12px", color: "#64748b" }}>
                <th style={{ padding: "12px" }}>RETURN NO</th>
                <th style={{ padding: "12px" }}>SUPPLIER DISTRIBUTOR</th>
                <th style={{ padding: "12px" }}>RETURN DATE</th>
                <th style={{ padding: "12px", textAlign: "right" }}>ITEMS COUNT</th>
                <th style={{ padding: "12px", textAlign: "right" }}>TOTAL VALUE</th>
                <th style={{ padding: "12px", textAlign: "center" }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {returns.map(r => (
                <tr key={r.id} style={{ borderBottom: "1px solid #f1f5f9", fontSize: "14px" }}>
                  <td style={{ padding: "12px", fontWeight: "700", color: "#ef4444" }}>{r.returnNumber}</td>
                  <td style={{ padding: "12px" }}>{r.supplier}</td>
                  <td style={{ padding: "12px", color: "#64748b" }}>{r.date}</td>
                  <td style={{ padding: "12px", textAlign: "right" }}>{r.items} drugs</td>
                  <td style={{ padding: "12px", textAlign: "right", fontWeight: "700" }}>${r.amount.toFixed(2)}</td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <span style={{ padding: "2px 6px", background: "#fffbeb", color: "#d97706", borderRadius: "4px", fontSize: "10px", fontWeight: "700" }}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
