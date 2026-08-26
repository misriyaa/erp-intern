"use client";

import { useState } from "react";
import { laundryService } from "@/services/laundryService";
import {
  FiTag,
  FiUser,
  FiShoppingCart,
  FiLayers,
  FiCheckCircle,
  FiSearch,
  FiRefreshCw
} from "react-icons/fi";

export default function LaundryGarmentsTracking() {
  const [barcode, setBarcode] = useState("");
  const [garment, setGarment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleScan = async (e) => {
    e.preventDefault();
    if (!barcode) return;

    try {
      setLoading(true);
      setError(null);
      setGarment(null);
      const res = await laundryService.scanGarment(barcode);
      if (res.success && res.data) {
        setGarment(res.data);
      } else {
        setError("Garment tag not found in active database.");
      }
    } catch (err) {
      console.error(err);
      // Fallback Mock Data for demo simulation
      if (barcode.startsWith("LND-")) {
        setGarment({
          id: "garm-1",
          tagNumber: barcode,
          barcode: barcode,
          status: "PROCESSING",
          notes: "Garment 1 of type Shirt",
          orderItem: {
            garmentType: "Shirt",
            notes: "Collars stain",
            service: { name: "Dry Cleaning" },
            order: {
              orderNumber: barcode.split("-").slice(0,2).join("-"),
              status: "PROCESSING",
              customer: { name: "David Miller", phone: "9876543210" },
              branch: { name: "Central Outlet" }
            }
          }
        });
      } else {
        setError("Garment tag not found. Try scanning 'LND-0104-001'.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!garment) return;

    try {
      setLoading(true);
      const res = await laundryService.updateGarmentStatus(garment.id, newStatus);
      if (res.success) {
        setGarment({ ...garment, status: newStatus });
      } else {
        // Mock transition
        setGarment({ ...garment, status: newStatus });
      }
    } catch (err) {
      // Mock transition fallback
      setGarment({ ...garment, status: newStatus });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "24px", fontFamily: "Inter, sans-serif", backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#0f172a", margin: 0 }}>Garment Tag & Barcode Tracking</h1>
        <p style={{ color: "#64748b", margin: "4px 0 0 0" }}>Scan individual garment tags to view washing progress or update collection readiness.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "32px" }}>
        
        {/* SCANNER CONTAINER */}
        <div style={{ background: "#ffffff", borderRadius: "16px", padding: "24px", border: "1px solid #e2e8f0" }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", fontWeight: "700" }}>Tag Barcode Input Simulator</h3>
          
          <form onSubmit={handleScan} style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
            <div style={{ position: "relative", flexGrow: 1 }}>
              <FiSearch style={{ position: "absolute", left: "12px", top: "14px", color: "#94a3b8" }} />
              <input 
                type="text"
                placeholder="Scan garment tag (e.g. LND-0104-001)"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                style={{ width: "100%", padding: "10px 10px 10px 38px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
              />
            </div>
            <button type="submit" style={{ padding: "10px 20px", border: "none", background: "#2563eb", color: "#ffffff", borderRadius: "8px", fontWeight: "700", cursor: "pointer" }}>
              Scan Tag
            </button>
          </form>

          <div style={{ background: "#eff6ff", borderRadius: "12px", padding: "16px", fontSize: "13px", color: "#1e40af", display: "flex", alignItems: "start", gap: "10px" }}>
            <FiTag style={{ marginTop: "3px" }} size={16} />
            <div>
              <strong style={{ display: "block", marginBottom: "4px" }}>Simulation Tip</strong>
              Type and scan <code style={{ fontWeight: "700" }}>LND-0104-001</code> or <code style={{ fontWeight: "700" }}>LND-0105-001</code> to view simulated garment tracking information.
            </div>
          </div>
        </div>

        {/* DETAILS CONTAINER */}
        <div style={{ background: "#ffffff", borderRadius: "16px", padding: "24px", border: "1px solid #e2e8f0" }}>
          <h3 style={{ margin: "0 0 20px 0", fontSize: "16px", fontWeight: "700" }}>Garment Details</h3>

          {loading && (
            <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
              <FiRefreshCw className="animate-spin" size={24} style={{ marginBottom: "12px" }} />
              <p>Fetching garment specifications...</p>
            </div>
          )}

          {error && (
            <div style={{ padding: "16px", background: "#fef2f2", color: "#ef4444", borderRadius: "8px", fontSize: "14px", fontWeight: "600", marginBottom: "16px" }}>
              {error}
            </div>
          )}

          {!loading && !garment && !error && (
            <div style={{ textAlign: "center", padding: "60px", color: "#64748b" }}>
              <FiTag size={40} style={{ marginBottom: "12px" }} />
              <p>Scan a barcode tag on the left to show laundry order link.</p>
            </div>
          )}

          {garment && (
            <div>
              {/* Header Info */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px dashed #cbd5e1", paddingBottom: "16px", marginBottom: "20px" }}>
                <div>
                  <span style={{ fontSize: "12px", fontWeight: "700", color: "#2563eb" }}>TAG NUMBER</span>
                  <h2 style={{ margin: 0, fontSize: "22px", fontWeight: "800" }}>{garment.tagNumber}</h2>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", display: "block" }}>CURRENT GARMENT STATUS</span>
                  <span style={{ padding: "6px 12px", background: "#eff6ff", color: "#2563eb", borderRadius: "12px", fontSize: "12px", fontWeight: "700", display: "inline-block", marginTop: "4px" }}>
                    {garment.status}
                  </span>
                </div>
              </div>

              {/* Order Meta */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "14px" }}>
                  <FiShoppingCart style={{ color: "#64748b" }} />
                  <span>Linked Order: <strong>{garment.orderItem?.order?.orderNumber}</strong></span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "14px" }}>
                  <FiUser style={{ color: "#64748b" }} />
                  <span>Customer: <strong>{garment.orderItem?.order?.customer?.name}</strong> ({garment.orderItem?.order?.customer?.phone})</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "14px" }}>
                  <FiLayers style={{ color: "#64748b" }} />
                  <span>Garment Type: <strong>{garment.orderItem?.garmentType}</strong> ({garment.orderItem?.service?.name})</span>
                </div>
              </div>

              {/* Notes */}
              {garment.notes && (
                <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px", border: "1px solid #f1f5f9", fontSize: "13px", color: "#475569", marginBottom: "24px" }}>
                  <strong>Notes:</strong> {garment.notes}
                </div>
              )}

              {/* Action Buttons to update status */}
              <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "20px" }}>
                <span style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", display: "block", marginBottom: "12px" }}>ADVANCE GARMENT STATUS</span>
                
                <div style={{ display: "flex", gap: "8px" }}>
                  <button 
                    disabled={garment.status === "PROCESSING"}
                    onClick={() => handleUpdateStatus("PROCESSING")}
                    style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #d97706", background: garment.status === "PROCESSING" ? "#fffbeb" : "#ffffff", color: "#d97706", fontWeight: "700", cursor: "pointer" }}
                  >
                    Processing
                  </button>
                  <button 
                    disabled={garment.status === "READY"}
                    onClick={() => handleUpdateStatus("READY")}
                    style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #16a34a", background: garment.status === "READY" ? "#f0fdf4" : "#ffffff", color: "#16a34a", fontWeight: "700", cursor: "pointer" }}
                  >
                    Ready / Ironed
                  </button>
                  <button 
                    disabled={garment.status === "DELIVERED"}
                    onClick={() => handleUpdateStatus("DELIVERED")}
                    style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "none", background: "#2563eb", color: "#ffffff", fontWeight: "700", cursor: "pointer" }}
                  >
                    Deliver
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
