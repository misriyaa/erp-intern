"use client";

import { useState, useEffect } from "react";
import { FiX, FiCheck, FiAlertCircle, FiInfo } from "react-icons/fi";
import { toast } from "react-hot-toast";
import { updateBatch } from "@/services/batchService";

export default function EditBatchModal({ isOpen, onClose, batch, onSuccess }) {
  const [formData, setFormData] = useState({
    batchNumber: "",
    mrp: "",
    purchasePrice: "",
    sellingPrice: "",
    expiryDate: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (batch) {
      setFormData({
        batchNumber: batch.batchNumber || "",
        mrp: batch.mrp !== undefined ? String(batch.mrp) : "",
        purchasePrice: batch.purchasePrice !== undefined ? String(batch.purchasePrice) : "",
        sellingPrice: batch.sellingPrice !== undefined ? String(batch.sellingPrice) : "",
        expiryDate: batch.expiryDate ? new Date(batch.expiryDate).toISOString().split("T")[0] : "",
      });
      setError("");
    }
  }, [batch]);

  if (!isOpen || !batch) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const mrp = parseFloat(formData.mrp);
    const purchasePrice = parseFloat(formData.purchasePrice);
    const sellingPrice = parseFloat(formData.sellingPrice);

    if (isNaN(mrp) || mrp <= 0) {
      setError("MRP must be greater than 0.");
      return;
    }
    if (isNaN(purchasePrice) || purchasePrice <= 0) {
      setError("Purchase price must be greater than 0.");
      return;
    }
    if (isNaN(sellingPrice) || sellingPrice <= 0) {
      setError("Selling price must be greater than 0.");
      return;
    }
    if (mrp < sellingPrice) {
      setError("MRP must be greater than or equal to selling price.");
      return;
    }

    try {
      setLoading(true);
      await updateBatch(batch.id, {
        batchNumber: formData.batchNumber.trim(),
        mrp,
        purchasePrice,
        sellingPrice,
        expiryDate: formData.expiryDate || null,
      });

      toast.success(`Batch "${batch.batchNumber}" updated successfully!`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error("Failed to update batch:", err);
      const msg = err.response?.data?.message || err.message || "Failed to update batch.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.6)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "16px",
      }}
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "520px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid #f1f5f9",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "linear-gradient(to right, #f8fafc, #ffffff)",
          }}
        >
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#0f172a", margin: 0 }}>
              Edit Batch: {batch.batchNumber}
            </h2>
            <p style={{ fontSize: "13px", color: "#64748b", margin: "4px 0 0" }}>
              Current Stock: <strong style={{ color: "#2563eb" }}>{batch.quantity} units</strong>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              border: "none",
              background: "#f1f5f9",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#64748b",
            }}
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: "24px" }}>
          {error && (
            <div
              style={{
                marginBottom: "16px",
                padding: "10px 14px",
                backgroundColor: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: "8px",
                color: "#b91c1c",
                fontSize: "13px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <FiAlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Info Notice about Stock quantity changes */}
          <div
            style={{
              marginBottom: "16px",
              padding: "10px 14px",
              backgroundColor: "#f0f9ff",
              border: "1px solid #bae6fd",
              borderRadius: "8px",
              color: "#0369a1",
              fontSize: "12px",
              display: "flex",
              alignItems: "flex-start",
              gap: "8px",
            }}
          >
            <FiInfo size={16} style={{ marginTop: "2px", flexShrink: 0 }} />
            <span>
              Stock quantity ({batch.quantity} units) cannot be directly modified here. Use Purchases, Sales, or Stock Adjustments for inventory movements.
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            {/* Batch Number */}
            <div style={{ gridColumn: "span 2" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "6px" }}>
                Batch Number <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                type="text"
                name="batchNumber"
                value={formData.batchNumber}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "14px",
                  outline: "none",
                }}
              />
            </div>

            {/* MRP */}
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "6px" }}>
                MRP (₹) <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                name="mrp"
                value={formData.mrp}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "14px",
                  outline: "none",
                }}
              />
            </div>

            {/* Selling Price */}
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "6px" }}>
                Selling Price (₹) <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                name="sellingPrice"
                value={formData.sellingPrice}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "14px",
                  outline: "none",
                }}
              />
            </div>

            {/* Purchase Price */}
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "6px" }}>
                Purchase Price (₹) <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                name="purchasePrice"
                value={formData.purchasePrice}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "14px",
                  outline: "none",
                }}
              />
            </div>

            {/* Expiry Date */}
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "6px" }}>
                Expiry Date
              </label>
              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "14px",
                  outline: "none",
                }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div
            style={{
              marginTop: "24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: "12px",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                padding: "10px 18px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                backgroundColor: "#ffffff",
                color: "#475569",
                fontWeight: "600",
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "10px 20px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: "#2563eb",
                color: "#ffffff",
                fontWeight: "600",
                fontSize: "14px",
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 2px 4px rgba(37, 99, 235, 0.2)",
              }}
            >
              <FiCheck size={16} />
              {loading ? "Updating..." : "Update Batch"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
