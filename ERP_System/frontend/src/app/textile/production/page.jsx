"use client";

import { useState, useEffect } from "react";
import {
  FiCpu,
  FiPlus,
  FiSearch,
  FiFilter,
  FiCheckCircle,
  FiClock,
  FiX,
  FiPlayCircle,
  FiChevronRight,
  FiTrash2,
} from "react-icons/fi";
import { toast, Toaster } from "react-hot-toast";

const STAGES = [
  "1. Yarn Spinning",
  "2. Loom Weaving",
  "3. Dyeing & Washing",
  "4. Printing & Finish",
  "5. Quality Inspection",
  "6. Finished Stock",
];

export default function ProductionTrackingPage() {
  const [batches, setBatches] = useState([]);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    batchName: "",
    material: "",
    targetMeters: "",
    operator: "",
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("textile_production_batches");
      if (stored) {
        const parsed = JSON.parse(stored);
        const userOnly = parsed.filter(
          (b) => !["PROD-801", "PROD-802", "PROD-803", "PROD-804"].includes(b.id)
        );
        setBatches(userOnly);
        localStorage.setItem("textile_production_batches", JSON.stringify(userOnly));
      } else {
        setBatches([]);
      }
    }
  }, []);

  const saveBatches = (newBatches) => {
    setBatches(newBatches);
    if (typeof window !== "undefined") {
      localStorage.setItem("textile_production_batches", JSON.stringify(newBatches));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateBatch = (e) => {
    e.preventDefault();
    if (!formData.batchName || !formData.targetMeters) {
      toast.error("Please enter batch name and target quantity");
      return;
    }

    const newBatch = {
      id: `PROD-${Math.floor(805 + Math.random() * 100)}`,
      batchName: formData.batchName,
      material: formData.material || "Standard Fabric Blend",
      targetMeters: Number(formData.targetMeters),
      completedMeters: 0,
      currentStageIndex: 0,
      operator: formData.operator || "Production Operator",
      startDate: new Date().toISOString().split("T")[0],
      status: "IN_PROGRESS",
    };

    saveBatches([newBatch, ...batches]);
    toast.success(`Production Batch "${formData.batchName}" scheduled!`);
    setShowAddModal(false);
    setFormData({ batchName: "", material: "", targetMeters: "", operator: "" });
  };

  const handleAdvanceStage = (id) => {
    const updated = batches.map((b) => {
      if (b.id === id) {
        const nextIndex = Math.min(b.currentStageIndex + 1, STAGES.length - 1);
        const isFinished = nextIndex === STAGES.length - 1;
        toast.success(`Batch ${b.id} advanced to "${STAGES[nextIndex]}"`);
        return {
          ...b,
          currentStageIndex: nextIndex,
          completedMeters: isFinished ? b.targetMeters : Math.round(b.targetMeters * ((nextIndex + 1) / STAGES.length)),
          status: isFinished ? "COMPLETED" : "IN_PROGRESS",
        };
      }
      return b;
    });
    saveBatches(updated);
  };

  const handleDeleteBatch = (id) => {
    const updated = batches.filter((b) => b.id !== id);
    saveBatches(updated);
    toast.success("Production Batch deleted.");
  };

  const filtered = batches.filter(
    (b) =>
      b.batchName.toLowerCase().includes(search.toLowerCase()) ||
      b.id.toLowerCase().includes(search.toLowerCase()) ||
      b.operator.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: "24px", fontFamily: "Inter, sans-serif" }}>
      <Toaster position="top-right" />

      {/* HEADER */}
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
            <FiCpu style={{ color: "#0d9488" }} /> Textile Production & Batch Tracking
          </h1>
          <p style={{ color: "#64748b", margin: "4px 0 0 0", fontSize: "14px" }}>
            Monitor production stage progression from loom weaving to dyeing, printing, and final inspection.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 18px",
            background: "linear-gradient(135deg, #0d9488 0%, #0f766e 100%)",
            color: "#ffffff",
            border: "none",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "700",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(13, 148, 136, 0.25)",
          }}
        >
          <FiPlus size={16} /> New Production Order
        </button>
      </div>

      {/* SEARCH BAR */}
      <div
        style={{
          background: "#ffffff",
          padding: "16px",
          borderRadius: "12px",
          border: "1px solid #e2e8f0",
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <FiSearch style={{ color: "#64748b" }} />
        <input
          type="text"
          placeholder="Search batch ID, batch name, or assigned operator..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            border: "none",
            outline: "none",
            background: "transparent",
            width: "100%",
            fontSize: "14px",
          }}
        />
      </div>

      {/* BATCH CARDS GRID */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "18px" }}>
        {filtered.map((b) => {
          const currentStageName = STAGES[b.currentStageIndex];
          const isCompleted = b.currentStageIndex === STAGES.length - 1;

          return (
            <div
              key={b.id}
              style={{
                background: "#ffffff",
                borderRadius: "14px",
                border: "1px solid #e2e8f0",
                padding: "20px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <span style={{ fontSize: "13px", fontWeight: "800", color: "#0d9488" }}>{b.id}</span>
                  <span
                    style={{
                      padding: "4px 10px",
                      borderRadius: "12px",
                      fontSize: "11px",
                      fontWeight: "700",
                      background: isCompleted ? "#d1fae5" : b.status === "QUALITY_HOLD" ? "#fef3c7" : "#e0e7ff",
                      color: isCompleted ? "#047857" : b.status === "QUALITY_HOLD" ? "#b45309" : "#4338ca",
                    }}
                  >
                    {isCompleted ? "COMPLETED" : b.status === "QUALITY_HOLD" ? "QC HOLD" : "IN PRODUCTION"}
                  </span>
                </div>

                <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a", margin: "0 0 6px 0" }}>
                  {b.batchName}
                </h3>
                <div style={{ fontSize: "13px", color: "#64748b", marginBottom: "14px" }}>
                  Material: <strong>{b.material}</strong>
                </div>

                {/* STAGE STEPPER */}
                <div
                  style={{
                    background: "#f8fafc",
                    padding: "12px",
                    borderRadius: "10px",
                    border: "1px solid #cbd5e1",
                    marginBottom: "14px",
                  }}
                >
                  <div style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", uppercase: true, marginBottom: "4px" }}>
                    CURRENT STAGE
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: "800", color: "#0d9488", display: "flex", alignItems: "center", gap: "6px" }}>
                    <FiPlayCircle /> {currentStageName}
                  </div>
                </div>

                <div style={{ fontSize: "12px", color: "#475569", marginBottom: "8px", display: "flex", justifyContent: "space-between" }}>
                  <span>Operator: <strong>{b.operator}</strong></span>
                  <span>Started: <strong>{b.startDate}</strong></span>
                </div>

                <div style={{ fontSize: "12px", color: "#475569", marginBottom: "14px" }}>
                  Target Output: <strong>{b.targetMeters} Meters</strong>
                </div>
              </div>

              {!isCompleted && (
                <button
                  onClick={() => handleAdvanceStage(b.id)}
                  style={{
                    width: "100%",
                    padding: "10px",
                    background: "#f0fdf4",
                    color: "#166534",
                    border: "1px solid #bbf7d0",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: "700",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                  }}
                >
                  Advance to Next Stage <FiChevronRight />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* ADD BATCH MODAL */}
      {showAddModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(15, 23, 42, 0.5)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              padding: "24px",
              width: "100%",
              maxWidth: "500px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "800", color: "#0f172a", margin: 0 }}>
                ⚙️ Schedule Production Batch
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}
              >
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateBatch}>
              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                  Batch Title / Order Name *
                </label>
                <input
                  type="text"
                  name="batchName"
                  value={formData.batchName}
                  onChange={handleInputChange}
                  placeholder="e.g. Denim Twill 14oz Export Lot"
                  required
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px" }}
                />
              </div>

              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                  Target Raw Material / Yarn
                </label>
                <input
                  type="text"
                  name="material"
                  value={formData.material}
                  onChange={handleInputChange}
                  placeholder="e.g. Combed Cotton Yarn #40s"
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                    Target Quantity (Meters) *
                  </label>
                  <input
                    type="number"
                    name="targetMeters"
                    value={formData.targetMeters}
                    onChange={handleInputChange}
                    placeholder="2500"
                    required
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                    Assigned Operator
                  </label>
                  <input
                    type="text"
                    name="operator"
                    value={formData.operator}
                    onChange={handleInputChange}
                    placeholder="e.g. Ramesh Kumar"
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{ padding: "10px 16px", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#ffffff", fontWeight: "600" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "10px 18px",
                    borderRadius: "8px",
                    border: "none",
                    background: "linear-gradient(135deg, #0d9488 0%, #0f766e 100%)",
                    color: "#ffffff",
                    fontWeight: "700",
                  }}
                >
                  Create Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
