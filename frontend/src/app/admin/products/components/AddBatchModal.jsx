"use client";

import { useState } from "react";
import { FiX, FiPlus, FiAlertCircle } from "react-icons/fi";
import { toast } from "react-hot-toast";
import { createProductBatch } from "@/services/batchService";

export default function AddBatchModal({ isOpen, onClose, product, onSuccess }) {
  const [formData, setFormData] = useState({
    batchNumber: "",
    mrp: "",
    purchasePrice: "",
    sellingPrice: "",
    quantity: "0",
    expiryDate: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const batchNumber = formData.batchNumber.trim();
    if (!batchNumber) {
      setError("Batch number is required.");
      return;
    }

    const mrp = parseFloat(formData.mrp);
    const purchasePrice = parseFloat(formData.purchasePrice);
    const sellingPrice = parseFloat(formData.sellingPrice);
    const quantity = parseInt(formData.quantity || 0, 10);

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
    if (isNaN(quantity) || quantity < 0) {
      setError("Quantity cannot be negative.");
      return;
    }

    // Check client-side duplicate batch number if product.batches exists
    if (product?.batches && product.batches.some((b) => b.batchNumber.toLowerCase() === batchNumber.toLowerCase())) {
      setError(`Batch "${batchNumber}" already exists for this product.`);
      return;
    }

    try {
      setLoading(true);
      await createProductBatch(product.id, {
        batchNumber,
        mrp,
        purchasePrice,
        sellingPrice,
        quantity,
        expiryDate: formData.expiryDate || null,
      });

      toast.success(`Batch "${batchNumber}" added successfully!`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error("Failed to add batch:", err);
      const msg = err.response?.data?.message || err.message || "Failed to create batch.";
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
          maxWidth: "540px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          overflow: "hidden",
          animation: "modalFadeIn 0.2s ease-out",
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
              Add New Batch
            </h2>
            <p style={{ fontSize: "13px", color: "#64748b", margin: "4px 0 0" }}>
              Product: <strong style={{ color: "#334155" }}>{product?.name || "Product"}</strong> ({product?.sku || "SKU"})
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

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            {/* Batch Number */}
            <div style={{ gridColumn: "span 2" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "6px" }}>
                Batch Number <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                type="text"
                name="batchNumber"
                placeholder="e.g. COKE001 or BATCH-2026-A"
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
                placeholder="₹ 60.00"
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
                placeholder="₹ 60.00"
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
                placeholder="₹ 50.00"
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

            {/* Initial Quantity */}
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "6px" }}>
                Initial Stock Qty <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                type="number"
                min="0"
                name="quantity"
                placeholder="100"
                value={formData.quantity}
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
            <div style={{ gridColumn: "span 2" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "6px" }}>
                Expiry Date (Optional)
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
              <FiPlus size={16} />
              {loading ? "Adding Batch..." : "Add Batch"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
