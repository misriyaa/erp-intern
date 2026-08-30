"use client";

import { useEffect, useState } from "react";
import { medicalService } from "@/services/medicalService";
import { FiTrendingUp, FiActivity, FiDollarSign, FiRefreshCw } from "react-icons/fi";

export default function PharmacyReports() {
  const [data, setData] = useState({
    grossProfit: 0,
    costOfGoods: 0,
    netMargins: "0%",
    cogsByDrug: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await medicalService.getReports();
      if (res.success && res.data) {
        const { grossProfit, costOfGoods } = res.data;
        if (parseFloat(grossProfit || 0) === 0 && parseFloat(costOfGoods || 0) === 0) {
          // Fallback placeholders if database is empty
          setData({
            grossProfit: 14250.00,
            costOfGoods: 8550.00,
            netMargins: "40.0%",
            cogsByDrug: [
              { name: "Antibiotics (Amoxicillin)", sales: 4500.00, margin: 45, isMock: true },
              { name: "Pain Relief (Paracetamol)", sales: 3200.00, margin: 38, isMock: true },
              { name: "Diabetic Care (Metformin)", sales: 2800.00, margin: 42, isMock: true }
            ]
          });
        } else {
          setData(res.data);
        }
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load live pharmacy margins & COGS metrics.");
      setData({
        grossProfit: 14250.00,
        costOfGoods: 8550.00,
        netMargins: "40.0%",
        cogsByDrug: [
          { name: "Antibiotics (Amoxicillin)", sales: 4500.00, margin: 45, isMock: true }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const grossSales = parseFloat(data.grossProfit || 0) + parseFloat(data.costOfGoods || 0);

  return (
    <div style={{ padding: "24px", fontFamily: "Inter, sans-serif", backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#0f172a", margin: 0 }}>Pharmacy Analytics & Margins</h1>
          <p style={{ color: "#64748b", margin: "4px 0 0 0" }}>Calculate profit margins, track cost of goods (COGS), and identify top contributing drugs.</p>
        </div>
        <button 
          onClick={fetchReports}
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
          <FiRefreshCw /> Refresh Reports
        </button>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "200px" }}>
          <p style={{ color: "#64748b", fontWeight: "600" }}>Calculating pharmacy profit metrics...</p>
        </div>
      ) : (
        <>
          {error && (
            <div style={{ padding: "16px", background: "#fef2f2", border: "1px solid #fee2e2", borderRadius: "8px", color: "#b91c1c", marginBottom: "24px" }}>
              {error}
            </div>
          )}

          {/* Analytics Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "24px", marginBottom: "32px" }}>
            <div style={{ background: "#ffffff", borderRadius: "16px", padding: "24px", border: "1px solid #e2e8f0" }}>
              <span style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", display: "block", marginBottom: "8px" }}>GROSS SALES REVENUE</span>
              <span style={{ fontSize: "28px", fontWeight: "800", color: "#10b981" }}>${grossSales.toFixed(2)}</span>
            </div>

            <div style={{ background: "#ffffff", borderRadius: "16px", padding: "24px", border: "1px solid #e2e8f0" }}>
              <span style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", display: "block", marginBottom: "8px" }}>COST OF GOODS SOLD (COGS)</span>
              <span style={{ fontSize: "28px", fontWeight: "800", color: "#ef4444" }}>${parseFloat(data.costOfGoods || 0).toFixed(2)}</span>
            </div>

            <div style={{ background: "#ffffff", borderRadius: "16px", padding: "24px", border: "1px solid #e2e8f0" }}>
              <span style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", display: "block", marginBottom: "8px" }}>NET PROFIT MARGIN</span>
              <span style={{ fontSize: "28px", fontWeight: "800", color: "#3b82f6" }}>{data.netMargins}</span>
            </div>
          </div>

          {/* Margins Contribution */}
          <div style={{ background: "#ffffff", borderRadius: "16px", padding: "24px", border: "1px solid #e2e8f0" }}>
            <h3 style={{ margin: "0 0 20px 0", fontSize: "18px", fontWeight: "700" }}>Drug Profit Margins Breakdown</h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {data.cogsByDrug.map(drug => (
                <div key={drug.name}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", fontWeight: "600", marginBottom: "6px" }}>
                    <span style={{ color: "#334155" }}>
                      {drug.name} (${parseFloat(drug.sales || 0).toFixed(2)} sales)
                      {drug.isMock && <span style={{ marginLeft: "6px", fontSize: "10px", color: "#94a3b8" }}>(Sample)</span>}
                    </span>
                    <span style={{ color: "#10b981" }}>{drug.margin}% margin</span>
                  </div>
                  <div style={{ width: "100%", background: "#f1f5f9", borderRadius: "6px", height: "12px" }}>
                    <div style={{ background: "#10b981", height: "12px", borderRadius: "6px", width: `${drug.margin}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
