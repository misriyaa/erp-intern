"use client";

import { useEffect, useState } from "react";
import { medicalService } from "@/services/medicalService";
import { FiTrash2, FiRefreshCw } from "react-icons/fi";

export default function MedicineReturns() {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReturns();
  }, []);

  const fetchReturns = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await medicalService.getPurchaseReturns();
      if (res.success && res.data) {
        if (res.data.length > 0) {
          setReturns(res.data);
        } else {
          // Fallback sample data if database is fresh
          setReturns([
            { id: "mock-1", returnNumber: "RET-MED-0012", supplier: "Global Pharma Inc.", returnDate: "2026-08-25T10:00:00.000Z", totalAmount: 240.00, status: "DISPATCHED", isMock: true },
            { id: "mock-2", returnNumber: "RET-MED-0013", supplier: "MedPharm Distributors", returnDate: "2026-08-28T14:30:00.000Z", totalAmount: 185.50, status: "PENDING", isMock: true }
          ]);
        }
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load supplier returns registry.");
      // Fallback on error to keep UI functional
      setReturns([
        { id: "mock-1", returnNumber: "RET-MED-0012", supplier: "Global Pharma Inc.", returnDate: "2026-08-25T10:00:00.000Z", totalAmount: 240.00, status: "DISPATCHED", isMock: true }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "24px", fontFamily: "Inter, sans-serif", backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#0f172a", margin: 0 }}>Supplier Returns (Damaged / Expired)</h1>
          <p style={{ color: "#64748b", margin: "4px 0 0 0" }}>Process returns for expired drug batches and verify distributor credit refunds.</p>
        </div>
        <button 
          onClick={fetchReturns}
          style={{
            padding: "8px 16px",
            borderRadius: "8px",
            border: "1px solid #cbd5e1",
            background: "#ffffff",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            fontWeight: "600",
            fontSize: "14px",
            cursor: "pointer"
          }}
        >
          <FiRefreshCw size={14} /> Refresh Returns
        </button>
      </div>

      {loading && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "200px" }}>
          <p style={{ color: "#64748b", fontWeight: "600" }}>Loading returns history...</p>
        </div>
      )}

      {!loading && error && (
        <div style={{ padding: "16px", background: "#fef2f2", border: "1px solid #fee2e2", borderRadius: "8px", color: "#b91c1c", marginBottom: "24px" }}>
          {error}
        </div>
      )}

      {!loading && (
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
                    <td style={{ padding: "12px" }}>
                      {r.supplier || (r.referencePurchaseOrderId ? `Supplier (PO #${r.referencePurchaseOrderId.substring(0,8)})` : "Generic Distributor")}
                      {r.isMock && <span style={{ marginLeft: "6px", fontSize: "10px", color: "#94a3b8", fontWeight: "500" }}>(Sample)</span>}
                    </td>
                    <td style={{ padding: "12px", color: "#64748b" }}>{new Date(r.returnDate || r.date).toLocaleDateString()}</td>
                    <td style={{ padding: "12px", textAlign: "right" }}>{r.items || 1} drugs</td>
                    <td style={{ padding: "12px", textAlign: "right", fontWeight: "700" }}>${parseFloat(r.totalAmount || r.amount || 0).toFixed(2)}</td>
                    <td style={{ padding: "12px", textAlign: "center" }}>
                      <span style={{ 
                        padding: "2px 6px", 
                        background: r.status === "DELIVERED" ? "#dcfce7" : "#fffbeb", 
                        color: r.status === "DELIVERED" ? "#16a34a" : "#d97706", 
                        borderRadius: "4px", 
                        fontSize: "10px", 
                        fontWeight: "700" 
                      }}>
                        {r.status || "DISPATCHED"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
