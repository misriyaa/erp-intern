"use client";

import { useEffect, useState } from "react";
import { laundryService } from "@/services/laundryService";
import { FiBarChart2, FiPieChart, FiTrendingUp, FiDollarSign } from "react-icons/fi";

export default function LaundryReports() {
  const [data, setData] = useState({
    revenueByService: [],
    turnaroundTime: "1.8 days",
    topCustomer: "David Miller ($145.00)",
    activeCapacity: "65%"
  });

  useEffect(() => {
    // Simulated report insights
    setData({
      revenueByService: [
        { name: "Dry Cleaning", value: 1552.50, color: "#2563eb" },
        { name: "Wash & Fold", value: 1104.00, color: "#3b82f6" },
        { name: "Steam Pressing", value: 793.50, color: "#60a5fa" }
      ],
      turnaroundTime: "1.4 days",
      topCustomer: "Emma Watson ($168.00)",
      activeCapacity: "58%"
    });
  }, []);

  return (
    <div style={{ padding: "24px", fontFamily: "Inter, sans-serif", backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#0f172a", margin: 0 }}>Laundry & Dry Cleaning Reports</h1>
        <p style={{ color: "#64748b", margin: "4px 0 0 0" }}>Analyze sales by service category, track average garment turnarounds, and review capacity utilization.</p>
      </div>

      {/* Analytics Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "24px", marginBottom: "32px" }}>
        
        <div style={{ background: "#ffffff", borderRadius: "16px", padding: "24px", border: "1px solid #e2e8f0" }}>
          <span style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", display: "block", marginBottom: "8px" }}>AVG TURNAROUND TIME</span>
          <span style={{ fontSize: "28px", fontWeight: "800", color: "#2563eb" }}>{data.turnaroundTime}</span>
          <span style={{ display: "block", fontSize: "11px", color: "#16a34a", marginTop: "4px", fontWeight: "600" }}>↓ 15% improvement this month</span>
        </div>

        <div style={{ background: "#ffffff", borderRadius: "16px", padding: "24px", border: "1px solid #e2e8f0" }}>
          <span style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", display: "block", marginBottom: "8px" }}>TOP CUSTOMER SPEND</span>
          <span style={{ fontSize: "18px", fontWeight: "800", color: "#1e293b", display: "block", marginTop: "8px" }}>{data.topCustomer}</span>
        </div>

        <div style={{ background: "#ffffff", borderRadius: "16px", padding: "24px", border: "1px solid #e2e8f0" }}>
          <span style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", display: "block", marginBottom: "8px" }}>WASHING CAPACITY UTILIZATION</span>
          <span style={{ fontSize: "28px", fontWeight: "800", color: "#d97706" }}>{data.activeCapacity}</span>
          <span style={{ display: "block", fontSize: "11px", color: "#64748b", marginTop: "4px" }}>Active machines ratio</span>
        </div>

      </div>

      {/* Revenue breakdown */}
      <div style={{ background: "#ffffff", borderRadius: "16px", padding: "24px", border: "1px solid #e2e8f0" }}>
        <h3 style={{ margin: "0 0 20px 0", fontSize: "18px", fontWeight: "700" }}>Revenue Contribution by Laundry Service</h3>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {data.revenueByService.map(service => (
            <div key={service.name}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", fontWeight: "600", marginBottom: "6px" }}>
                <span style={{ color: "#334155" }}>{service.name}</span>
                <span style={{ color: "#0f172a" }}>${service.value.toFixed(2)}</span>
              </div>
              <div style={{ width: "100%", background: "#f1f5f9", borderRadius: "6px", height: "12px" }}>
                <div style={{ background: service.color, height: "12px", borderRadius: "6px", width: `${(service.value / 3450) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
