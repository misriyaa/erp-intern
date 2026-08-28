"use client";

import { useState, useEffect } from "react";
import { restaurantService } from "@/services/restaurantService";
import { getProducts } from "@/services/productService";
import { getWarehouses } from "@/services/warehouseService";
import { FiTrash2, FiPlus, FiAlertTriangle } from "react-icons/fi";
import { showSuccess, showError, showWarning, showConfirm } from "@/utils/swal";

export default function RestaurantWastagePage() {
  const [loading, setLoading] = useState(true);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState("");
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState("");
  const [products, setProducts] = useState([]);
  const [wastages, setWastages] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [reason, setReason] = useState("SPOILAGE");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [restRes, whRes, prodRes] = await Promise.all([
        restaurantService.getRestaurants(),
        getWarehouses(),
        getProducts(),
      ]);

      const restList = restRes.data || [];
      setRestaurants(restList);
      if (restList.length > 0) setSelectedRestaurantId(restList[0].id);

      const whList = whRes.data || whRes || [];
      setWarehouses(whList);
      if (whList.length > 0) setSelectedWarehouseId(whList[0].id);

      setProducts(prodRes.data || prodRes || []);
    } catch (err) {
      console.error("Error loading wastage initial data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedRestaurantId) fetchWastages();
  }, [selectedRestaurantId]);

  const fetchWastages = async () => {
    try {
      const res = await restaurantService.getWastages(selectedRestaurantId);
      setWastages(res.data || []);
    } catch (err) {
      console.error("Error fetching wastages:", err);
    }
  };

  const handleAddItem = (productId) => {
    if (!productId) return;
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    setItems((prev) => {
      const exists = prev.find((i) => i.productId === productId);
      if (exists) return prev;
      return [
        ...prev,
        {
          productId,
          name: prod.name,
          quantity: 1,
          costPrice: parseFloat(prod.costPrice || 0),
        },
      ];
    });
  };

  const handleUpdateQty = (productId, qty) => {
    setItems((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, quantity: parseFloat(qty) || 1 } : i))
    );
  };

  const handleRemoveItem = (productId) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  const handleCreateWastage = async (e) => {
    e.preventDefault();
    if (items.length === 0) {
      showWarning("Items Required", "Please add at least one wastage item.");
      return;
    }
    try {
      await restaurantService.createWastage({
        restaurantId: selectedRestaurantId,
        warehouseId: selectedWarehouseId,
        reason,
        notes,
        items,
      });
      setShowModal(false);
      setItems([]);
      setNotes("");
      fetchWastages();
      showSuccess("Wastage Recorded", "Wastage recorded and stock deducted successfully.");
    } catch (err) {
      showError("Failed", err.response?.data?.message || err.message);
    }
  };

  const handleDeleteWastage = async (id) => {
    const isConfirmed = await showConfirm({
      title: "Delete Wastage Record?",
      text: "Are you sure you want to delete this wastage record?",
      confirmButtonText: "Yes, Delete",
      icon: "warning",
    });
    if (!isConfirmed) return;
    try {
      await restaurantService.deleteWastage(id);
      fetchWastages();
      showSuccess("Deleted", "Wastage record deleted successfully!");
    } catch (err) {
      showError("Delete Failed", err.response?.data?.message || err.message);
    }
  };

  if (loading) {
    return <div style={{ padding: "32px", textAlign: "center", color: "#64748b" }}>Loading Wastage Logs...</div>;
  }

  return (
    <div style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#0f172a", margin: 0 }}>Wastage Management</h1>
          <p style={{ color: "#64748b", margin: "4px 0 0 0" }}>Record food & raw material spoilage with automatic inventory stock reduction.</p>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {restaurants.length > 0 && (
            <select
              value={selectedRestaurantId}
              onChange={(e) => setSelectedRestaurantId(e.target.value)}
              style={{ padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontWeight: "600" }}
            >
              {restaurants.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          )}

          <button
            onClick={() => {
              if (products.length > 0) {
                setItems([{ productId: products[0].id, quantity: 1, unitCost: parseFloat(products[0].costPrice || 0) }]);
              }
              setShowModal(true);
            }}
            style={{ padding: "10px 18px", backgroundColor: "#ef4444", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
          >
            <FiPlus /> Record Wastage
          </button>
        </div>
      </div>

      <div style={{ backgroundColor: "#fff", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", overflow: "hidden" }}>
        {wastages.length === 0 ? (
          <div style={{ padding: "48px", textAlign: "center", color: "#94a3b8" }}>
            <FiTrash2 size={48} />
            <h3 style={{ marginTop: "16px", color: "#334155" }}>No Wastage Records Logged</h3>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#475569", fontSize: "13px", textTransform: "uppercase" }}>
                <th style={{ padding: "14px 20px" }}>Wastage #</th>
                <th style={{ padding: "14px 20px" }}>Reason</th>
                <th style={{ padding: "14px 20px" }}>Warehouse</th>
                <th style={{ padding: "14px 20px" }}>Items Wasted</th>
                <th style={{ padding: "14px 20px" }}>Total Cost</th>
                <th style={{ padding: "14px 20px" }}>Date</th>
                <th style={{ padding: "14px 20px", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {wastages.map((w) => (
                <tr key={w.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "16px 20px", fontWeight: "700", color: "#0f172a" }}>{w.wastageNumber}</td>
                  <td style={{ padding: "16px 20px" }}>
                    <span style={{ padding: "4px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "700", backgroundColor: "#fee2e2", color: "#991b1b" }}>
                      {w.reason}
                    </span>
                  </td>
                  <td style={{ padding: "16px 20px", color: "#64748b" }}>{w.warehouse?.name || "Kitchen Stock"}</td>
                  <td style={{ padding: "16px 20px", fontSize: "13px" }}>
                    {w.items?.map((i) => `${i.product?.name} (-${i.quantity})`).join(", ")}
                  </td>
                  <td style={{ padding: "16px 20px", fontWeight: "800", color: "#ef4444" }}>
                    ₹{parseFloat(w.totalCost || 0).toFixed(2)}
                  </td>
                  <td style={{ padding: "16px 20px", color: "#64748b", fontSize: "13px" }}>
                    {w.wastageDate ? new Date(w.wastageDate).toLocaleDateString() : ""}
                  </td>
                  <td style={{ padding: "16px 20px", textAlign: "right" }}>
                    <button
                      onClick={() => handleDeleteWastage(w.id)}
                      style={{ background: "#fee2e2", color: "#ef4444", border: "none", borderRadius: "4px", padding: "6px 10px", cursor: "pointer" }}
                      title="Delete Wastage Record"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Record Wastage Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ backgroundColor: "#fff", padding: "24px", borderRadius: "12px", width: "100%", maxWidth: "600px" }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: "20px", fontWeight: "700" }}>Record Stock Wastage</h3>
            <form onSubmit={handleCreateWastage}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "4px" }}>Select Warehouse / Kitchen</label>
                  <select
                    value={selectedWarehouseId}
                    onChange={(e) => setSelectedWarehouseId(e.target.value)}
                    style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  >
                    {warehouses.map((wh) => (
                      <option key={wh.id} value={wh.id}>{wh.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "4px" }}>Wastage Reason</label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  >
                    {["SPOILED", "EXPIRED", "DAMAGED", "OVER_PRODUCTION", "CUSTOMER_CANCELLED", "OTHER"].map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>

              <h4 style={{ fontSize: "14px", fontWeight: "700", marginTop: "16px", marginBottom: "8px" }}>Wasted Products / Ingredients:</h4>

              {items.map((item, idx) => (
                <div key={idx} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 40px", gap: "10px", marginBottom: "8px", alignItems: "center" }}>
                  <select
                    value={item.productId}
                    onChange={(e) => {
                      const prod = products.find((p) => p.id === e.target.value);
                      const list = [...items];
                      list[idx].productId = e.target.value;
                      list[idx].unitCost = prod ? parseFloat(prod.costPrice || 0) : 0;
                      setItems(list);
                    }}
                    style={{ padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>

                  <input
                    type="number"
                    step="0.01"
                    placeholder="Qty Wasted"
                    value={item.quantity}
                    onChange={(e) => {
                      const list = [...items];
                      list[idx].quantity = parseFloat(e.target.value);
                      setItems(list);
                    }}
                    style={{ padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  />

                  <button
                    type="button"
                    onClick={() => setItems(items.filter((_, i) => i !== idx))}
                    style={{ border: "none", background: "none", color: "#ef4444", cursor: "pointer" }}
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>
              ))}

              <button type="button" onClick={handleAddItemRow} style={{ padding: "6px 12px", backgroundColor: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "12px", fontWeight: "600", marginTop: "8px", marginBottom: "16px" }}>
                + Add Wasted Item Line
              </button>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "4px" }}>Notes / Description</label>
                <textarea
                  rows="2"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                ></textarea>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: "8px 16px", borderRadius: "6px", border: "1px solid #cbd5e1", backgroundColor: "#fff" }}>
                  Cancel
                </button>
                <button type="submit" style={{ padding: "8px 20px", backgroundColor: "#ef4444", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "700" }}>
                  Record & Deduct Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
