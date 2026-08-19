"use client";

import { useEffect, useState } from "react";
import { createInventory, updateInventory } from "@/services/inventoryService";
import { useAlert } from "@/context/AlertContext";

export default function StockModal({
  isOpen,
  onClose,
  onSave,
  item = null,
  products = [],
  warehouses = [],
}) {
  const { showSuccess, showError } = useAlert();
  const isEdit = !!item;

  const [form, setForm] = useState({
    productId: "",
    warehouseId: "",
    quantity: 0,
    minimumStock: 10,
    maximumStock: 1000,
    reorderLevel: 20,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (item) {
      setForm({
        productId: item.productId || "",
        warehouseId: item.warehouseId || "",
        quantity: item.quantity ?? 0,
        minimumStock: item.minimumStock ?? 10,
        maximumStock: item.maximumStock ?? 1000,
        reorderLevel: item.reorderLevel ?? 20,
      });
    } else {
      setForm({
        productId: "",
        warehouseId: "",
        quantity: 0,
        minimumStock: 10,
        maximumStock: 1000,
        reorderLevel: 20,
      });
    }
    setError("");
  }, [item, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "productId" || name === "warehouseId" ? value : Number(value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.productId) {
      setError("Product is required");
      return;
    }
    if (!form.warehouseId) {
      setError("Warehouse is required");
      return;
    }
    if (form.quantity < 0) {
      setError("Quantity cannot be negative");
      return;
    }
    if (form.minimumStock < 0) {
      setError("Minimum stock cannot be negative");
      return;
    }
    if (form.maximumStock <= 0) {
      setError("Maximum stock must be greater than 0");
      return;
    }
    if (form.reorderLevel < 0) {
      setError("Reorder level cannot be negative");
      return;
    }
    if (form.minimumStock > form.maximumStock) {
      setError("Minimum stock cannot be greater than Maximum stock");
      return;
    }

    try {
      setLoading(true);
      if (isEdit) {
        // Edit Mode: update inventory
        await updateInventory(item.id, {
          quantity: form.quantity,
          minimumStock: form.minimumStock,
          maximumStock: form.maximumStock,
          reorderLevel: form.reorderLevel,
        });
        showSuccess("Inventory Updated", "Stock item levels updated successfully.");
      } else {
        // Add Mode: create inventory
        await createInventory(form);
        showSuccess("Inventory Created", "New product stock mapped successfully.");
      }
      onSave();
      onClose();
    } catch (err) {
      console.error("Save stock error:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to save stock record. Make sure product doesn't already exist in the warehouse."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop-blur">
      <div className="modal-content-card">
        <div className="modal-card-header">
          <h2>{isEdit ? "Edit Stock Levels" : "Add Product to Warehouse"}</h2>
          <button className="modal-close-x-btn" onClick={onClose} aria-label="Close">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-card-body">
          {error && <div className="modal-error-pill">{error}</div>}

          <div className="modal-grid-cols">
            {/* Product Select */}
            <div className="modal-field-group">
              <label className="form-group-label">Product Item *</label>
              <select
                name="productId"
                value={form.productId}
                onChange={handleChange}
                disabled={isEdit}
                className="form-control-pill"
              >
                <option value="">Select a Product</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.sku})
                  </option>
                ))}
              </select>
            </div>

            {/* Warehouse Select */}
            <div className="modal-field-group">
              <label className="form-group-label">Warehouse Location *</label>
              <select
                name="warehouseId"
                value={form.warehouseId}
                onChange={handleChange}
                disabled={isEdit}
                className="form-control-pill"
              >
                <option value="">Select a Warehouse</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity */}
            <div className="modal-field-group">
              <label className="form-group-label">Initial Quantity *</label>
              <input
                type="number"
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
                placeholder="Enter stock quantity"
                min="0"
                className="form-control-pill"
              />
            </div>

            {/* Reorder Level */}
            <div className="modal-field-group">
              <label className="form-group-label">Reorder Level</label>
              <input
                type="number"
                name="reorderLevel"
                value={form.reorderLevel}
                onChange={handleChange}
                min="0"
                className="form-control-pill"
              />
            </div>

            {/* Minimum Stock */}
            <div className="modal-field-group">
              <label className="form-group-label">Minimum Stock Alert Threshold</label>
              <input
                type="number"
                name="minimumStock"
                value={form.minimumStock}
                onChange={handleChange}
                min="0"
                className="form-control-pill"
              />
            </div>

            {/* Maximum Capacity */}
            <div className="modal-field-group">
              <label className="form-group-label">Maximum Stock Capacity</label>
              <input
                type="number"
                name="maximumStock"
                value={form.maximumStock}
                onChange={handleChange}
                min="1"
                className="form-control-pill"
              />
            </div>
          </div>

          <div className="modal-card-footer">
            <button
              type="button"
              className="btn-action-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-action-primary"
              disabled={loading}
            >
              {loading ? (
                <span>Saving...</span>
              ) : (
                <>
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <span>{isEdit ? "Update Stock" : "Add to Stock"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
