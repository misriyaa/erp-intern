"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FiLayers,
  FiCpu,
  FiCheckCircle,
  FiShoppingBag,
  FiTrendingUp,
  FiAlertCircle,
  FiPlus,
  FiActivity,
  FiTruck,
  FiBarChart2,
} from "react-icons/fi";

export default function TextileDashboard() {
  const [batches] = useState([
    {
      id: "BATCH-2026-081",
      material: "Organic Cotton Yarn #40s",
      stage: "Dyeing & Washing",
      targetQty: "1,500 Meters",
      completedQty: "920 Meters",
      status: "IN_PROGRESS",
      progress: 61,
    },
    {
      id: "BATCH-2026-082",
      material: "Poly-Silk Blend Weave",
      stage: "Weaving / Knitting",
      targetQty: "3,000 Meters",
      completedQty: "2,750 Meters",
      status: "IN_PROGRESS",
      progress: 91,
    },
    {
      id: "BATCH-2026-083",
      material: "Heavyweight Denim Twill 14oz",
      stage: "Quality Inspection",
      targetQty: "800 Meters",
      completedQty: "800 Meters",
      status: "QUALITY_CHECK",
      progress: 100,
    },
    {
      id: "BATCH-2026-084",
      material: "Linen Soft-Touch Shirting",
      stage: "Finished Stock",
      targetQty: "2,100 Meters",
      completedQty: "2,100 Meters",
      status: "COMPLETED",
      progress: 100,
    },
  ]);

  return (
    <div style={{ padding: "24px", fontFamily: "Inter, sans-serif" }}>
      {/* HEADER SECTION */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: "800",
              color: "#0f172a",
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            🧵 Textile & Production Overview
          </h1>
          <p style={{ color: "#64748b", margin: "4px 0 0 0", fontSize: "14px" }}>
            Real-time tracking for raw materials, yarn spinning, weaving batches, dyeing, and quality control.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <Link
            href="/textile/production"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 18px",
              background: "linear-gradient(135deg, #0d9488 0%, #0f766e 100%)",
              color: "#ffffff",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "700",
              textDecoration: "none",
              boxShadow: "0 4px 12px rgba(13, 148, 136, 0.25)",
            }}
          >
            <FiPlus size={16} /> New Production Order
          </Link>
          <Link
            href="/textile/quality-control"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 18px",
              background: "#f1f5f9",
              color: "#334155",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "600",
              textDecoration: "none",
              border: "1px solid #cbd5e1",
            }}
          >
            <FiCheckCircle size={16} style={{ color: "#10b981" }} /> Log QC Inspection
          </Link>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
          gap: "18px",
          marginBottom: "28px",
        }}
      >
        <div
          style={{
            background: "#ffffff",
            padding: "20px",
            borderRadius: "14px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "13px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>
              Raw Materials Stock
            </span>
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "10px",
                background: "#ccfbf1",
                color: "#0f766e",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FiLayers size={22} />
            </div>
          </div>
          <h2 style={{ fontSize: "28px", fontWeight: "800", color: "#0f172a", margin: "12px 0 4px 0" }}>
            14,850 <span style={{ fontSize: "15px", color: "#64748b", fontWeight: "500" }}>KG</span>
          </h2>
          <div style={{ fontSize: "12px", color: "#10b981", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
            <FiTrendingUp /> +8.4% Yarn & Dye arrival this week
          </div>
        </div>

        <div
          style={{
            background: "#ffffff",
            padding: "20px",
            borderRadius: "14px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "13px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>
              Active Batches
            </span>
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "10px",
                background: "#e0e7ff",
                color: "#4338ca",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FiCpu size={22} />
            </div>
          </div>
          <h2 style={{ fontSize: "28px", fontWeight: "800", color: "#0f172a", margin: "12px 0 4px 0" }}>
            18 <span style={{ fontSize: "15px", color: "#64748b", fontWeight: "500" }}>Orders</span>
          </h2>
          <div style={{ fontSize: "12px", color: "#6366f1", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
            <FiActivity /> 5 Loom Weaving, 4 Dyeing, 3 QC
          </div>
        </div>

        <div
          style={{
            background: "#ffffff",
            padding: "20px",
            borderRadius: "14px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "13px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>
              Quality Pass Rate
            </span>
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "10px",
                background: "#d1fae5",
                color: "#047857",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FiCheckCircle size={22} />
            </div>
          </div>
          <h2 style={{ fontSize: "28px", fontWeight: "800", color: "#0f172a", margin: "12px 0 4px 0" }}>
            97.6%
          </h2>
          <div style={{ fontSize: "12px", color: "#10b981", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
            <FiCheckCircle /> Grade A Output: 94.2%
          </div>
        </div>

        <div
          style={{
            background: "#ffffff",
            padding: "20px",
            borderRadius: "14px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "13px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>
              Finished Fabrics
            </span>
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "10px",
                background: "#fef3c7",
                color: "#b45309",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FiShoppingBag size={22} />
            </div>
          </div>
          <h2 style={{ fontSize: "28px", fontWeight: "800", color: "#0f172a", margin: "12px 0 4px 0" }}>
            32,400 <span style={{ fontSize: "15px", color: "#64748b", fontWeight: "500" }}>Meters</span>
          </h2>
          <div style={{ fontSize: "12px", color: "#d97706", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
            <FiTruck /> Ready for Dispatch & Sales
          </div>
        </div>
      </div>

      {/* STAGE WORKFLOW PIPELINE VISUALIZATION */}
      <div
        style={{
          background: "#ffffff",
          padding: "24px",
          borderRadius: "14px",
          border: "1px solid #e2e8f0",
          marginBottom: "28px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
        }}
      >
        <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a", marginBottom: "16px" }}>
          ⚙️ Textile Production Pipeline Stages
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px" }}>
          {[
            { stage: "1. Yarn Spinning", count: "4.2 Tons", status: "Active", bg: "#f0fdf4", color: "#166534" },
            { stage: "2. Loom Weaving", count: "5 Batches", status: "In Progress", bg: "#eff6ff", color: "#1e40af" },
            { stage: "3. Dyeing & Washing", count: "4 Batches", status: "In Progress", bg: "#fdf4ff", color: "#86198f" },
            { stage: "4. Printing & Finish", count: "3 Batches", status: "Processing", bg: "#fff7ed", color: "#c2410c" },
            { stage: "5. QC Inspection", count: "3 Batches", status: "Inspecting", bg: "#ecfdf5", color: "#047857" },
            { stage: "6. Finished Stock", count: "32.4k Meters", status: "Ready", bg: "#f8fafc", color: "#334155" },
          ].map((s, idx) => (
            <div
              key={idx}
              style={{
                background: s.bg,
                border: "1px solid #cbd5e1",
                borderRadius: "10px",
                padding: "14px",
              }}
            >
              <div style={{ fontSize: "12px", fontWeight: "700", color: s.color, marginBottom: "4px" }}>
                {s.stage}
              </div>
              <div style={{ fontSize: "18px", fontWeight: "800", color: "#0f172a" }}>{s.count}</div>
              <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px", fontWeight: "600" }}>
                Status: {s.status}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RECENT BATCHES TABLE */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: "14px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a", margin: 0 }}>
            🏭 Ongoing Production Orders & Batch Progress
          </h3>
          <Link
            href="/textile/production"
            style={{ fontSize: "13px", fontWeight: "700", color: "#0d9488", textDecoration: "none" }}
          >
            View All Production Orders →
          </Link>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                <th style={{ padding: "14px 20px", fontWeight: "700", color: "#475569" }}>Batch ID</th>
                <th style={{ padding: "14px 20px", fontWeight: "700", color: "#475569" }}>Fabric / Yarn Type</th>
                <th style={{ padding: "14px 20px", fontWeight: "700", color: "#475569" }}>Current Stage</th>
                <th style={{ padding: "14px 20px", fontWeight: "700", color: "#475569" }}>Target Output</th>
                <th style={{ padding: "14px 20px", fontWeight: "700", color: "#475569" }}>Completion Progress</th>
              </tr>
            </thead>
            <tbody>
              {batches.map((b) => (
                <tr key={b.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "16px 20px", fontWeight: "700", color: "#0d9488" }}>{b.id}</td>
                  <td style={{ padding: "16px 20px", fontWeight: "600", color: "#0f172a" }}>{b.material}</td>
                  <td style={{ padding: "16px 20px" }}>
                    <span
                      style={{
                        padding: "4px 10px",
                        borderRadius: "12px",
                        fontSize: "12px",
                        fontWeight: "700",
                        background:
                          b.status === "COMPLETED"
                            ? "#d1fae5"
                            : b.status === "QUALITY_CHECK"
                            ? "#fef3c7"
                            : "#e0e7ff",
                        color:
                          b.status === "COMPLETED"
                            ? "#047857"
                            : b.status === "QUALITY_CHECK"
                            ? "#b45309"
                            : "#4338ca",
                      }}
                    >
                      {b.stage}
                    </span>
                  </td>
                  <td style={{ padding: "16px 20px", fontWeight: "600", color: "#334155" }}>
                    {b.completedQty} / {b.targetQty}
                  </td>
                  <td style={{ padding: "16px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div
                        style={{
                          flex: 1,
                          height: "8px",
                          background: "#e2e8f0",
                          borderRadius: "4px",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${b.progress}%`,
                            height: "100%",
                            background: b.progress === 100 ? "#10b981" : "#0d9488",
                            borderRadius: "4px",
                          }}
                        />
                      </div>
                      <span style={{ fontSize: "12px", fontWeight: "700", color: "#475569", width: "35px" }}>
                        {b.progress}%
                      </span>
                    </div>
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
