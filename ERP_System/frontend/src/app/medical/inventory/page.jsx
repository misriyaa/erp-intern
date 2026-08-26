"use client";

import { useEffect, useState } from "react";
import { FiPackage, FiSearch } from "react-icons/fi";

export default function PharmacyInventory() {
  const [stocks, setStocks] = useState([
    { id: "s1", name: "Panadol 500mg (Paracetamol)", sku: "PAN-500", quantity: 800, minStock: 200, unit: "tablets" },
    { id: "s2", name: "Amoxil 250mg (Amoxicillin)", sku: "AMO-250", quantity: 15, minStock: 50, unit: "capsules" },
    { id: "s3", name: "Zyrtec 10mg (Cetirizine)", sku: "ZYR-010", quantity: 320, minStock: 100, unit: "tablets" }
  ]);

  return (
    <div style={{ padding: "24px", fontFamily: "Inter, sans-serif", backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#0f172a", margin: 0 }}>Pharmacy Inventory Stock</h1>
        <p style={{ color: "#64748b", margin: "4px 0 0 0" }}>Check physical stock levels, monitor reorder status, and map warehouse rack locations.</p>
      </div>

      <div style={{ background: "#ffffff", borderRadius: "16px", padding: "24px", border: "1px solid #e2e8f0" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #cbd5e1", textAlign: "left", fontSize: "12px", color: "#64748b" }}>
                <th style={{ padding: "12px" }}>DRUG SKU</th>
                <th style={{ padding: "12px" }}>FORMULATION / NAME</th>
                <th style={{ padding: "12px", textAlign: "right" }}>MINIMUM LEVEL</th>
                <th style={{ padding: "12px", textAlign: "right" }}>CURRENT STOCK</th>
                <th style={{ padding: "12px", textAlign: "center" }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {stocks.map(s => (
                <tr key={s.id} style={{ borderBottom: "1px solid #f1f5f9", fontSize: "14px" }}>
                  <td style={{ padding: "12px", fontWeight: "700", color: "#475569" }}>{s.sku}</td>
                  <td style={{ padding: "12px", fontWeight: "600" }}>{s.name}</td>
                  <td style={{ padding: "12px", textAlign: "right", color: "#64748b" }}>{s.minStock} {s.unit}</td>
                  <td style={{ padding: "12px", textAlign: "right", fontWeight: "800", color: s.quantity <= s.minStock ? "#ef4444" : "#16a34a" }}>
                    {s.quantity} {s.unit}
                  </td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    {s.quantity <= s.minStock ? (
                      <span style={{ padding: "2px 6px", background: "#fef2f2", color: "#ef4444", borderRadius: "4px", fontSize: "10px", fontWeight: "700" }}>REORDER</span>
                    ) : (
                      <span style={{ padding: "2px 6px", background: "#f0fdf4", color: "#16a34a", borderRadius: "4px", fontSize: "10px", fontWeight: "700" }}>STABLE</span>
                    )}
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
