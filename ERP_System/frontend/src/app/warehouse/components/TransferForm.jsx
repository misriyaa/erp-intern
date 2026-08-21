"use client";

import { useState, useEffect } from "react";
import { useAlert } from "@/context/AlertContext";
import apiClient from "@/services/apiClient";

export default function TransferForm() {
  const { showSuccess, showWarning, showError } = useAlert();
  const [form, setForm] = useState({
    fromWarehouseId: "",
    toWarehouseId: "",
    productId: "",
    quantity: "",
    remarks: "",
  });

  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTransfers = async () => {
    try {
      const [whRes, prodRes, transRes] = await Promise.all([
        apiClient.get("/warehouses"),
        apiClient.get("/products"),
        apiClient.get("/stock-transfers"),
      ]);

      if (whRes.data?.success && whRes.data?.data) {
        setWarehouses(whRes.data.data);
      }
      if (prodRes.data?.success && prodRes.data?.data) {
        setProducts(prodRes.data.data);
      }
      if (transRes.data?.success && transRes.data?.data) {
        const mapped = transRes.data.data.map((item) => ({
          id: item.id,
          date: new Date(item.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
          product: item.items?.[0]?.product?.name || "N/A",
          fromWarehouse: item.fromWarehouse?.name || "N/A",
          toWarehouse: item.toWarehouse?.name || "N/A",
          quantity: item.items?.[0]?.quantity || 0,
          status: item.status || "Completed",
        }));
        setHistory(mapped);
      }
    } catch (err) {
      console.error("Failed to load transfer data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransfers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.fromWarehouseId ||
      !form.toWarehouseId ||
      !form.productId ||
      !form.quantity
    ) {
      showWarning("Invalid form data", "Please fill all required stock transfer fields.");
      return;
    }

    if (form.fromWarehouseId === form.toWarehouseId) {
      showWarning("Invalid form data", "Source and Destination warehouse locations cannot be identical.");
      return;
    }

    try {
      const transferNo = `TR-${Date.now().toString().slice(-8)}`;
      const payload = {
        transferNo,
        fromWarehouseId: form.fromWarehouseId,
        toWarehouseId: form.toWarehouseId,
        status: "COMPLETED",
        remarks: form.remarks,
        items: [
          {
            productId: form.productId,
            quantity: parseInt(form.quantity),
          }
        ]
      };

      const res = await apiClient.post("/stock-transfers", payload);
      if (res.data?.success) {
        showSuccess("Stock Transfer Executed", "Stock transfer approved and executed successfully.");
        setForm({
          fromWarehouseId: "",
          toWarehouseId: "",
          productId: "",
          quantity: "",
          remarks: "",
        });
        fetchTransfers();
      }
    } catch (err) {
      console.error(err);
      showError("Transfer Failed", err.response?.data?.message || "Failed to execute stock transfer.");
    }
  };

  if (loading) {
    return <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>Loading stock transfer details...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Transfer Form Card */}
      <div className="transfer-form-card">
        <h2 className="form-card-title">
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ marginRight: 8 }}>
            <path d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          Initiate Stock Transfer
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="form-group-label" style={{ fontSize: "13px", fontWeight: "600", color: "#334155", display: "block", marginBottom: 6 }}>From Warehouse *</label>
              <select
                name="fromWarehouseId"
                value={form.fromWarehouseId}
                onChange={handleChange}
                className="form-control-pill"
              >
                <option value="">Select Origin Warehouse</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-group-label" style={{ fontSize: "13px", fontWeight: "600", color: "#334155", display: "block", marginBottom: 6 }}>To Warehouse *</label>
              <select
                name="toWarehouseId"
                value={form.toWarehouseId}
                onChange={handleChange}
                className="form-control-pill"
              >
                <option value="">Select Destination Warehouse</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-group-label" style={{ fontSize: "13px", fontWeight: "600", color: "#334155", display: "block", marginBottom: 6 }}>Product *</label>
              <select
                name="productId"
                value={form.productId}
                onChange={handleChange}
                className="form-control-pill"
              >
                <option value="">Select Product Item</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-group-label" style={{ fontSize: "13px", fontWeight: "600", color: "#334155", display: "block", marginBottom: 6 }}>Transfer Quantity *</label>
              <input
                type="number"
                min="1"
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
                placeholder="Enter unit quantity"
                className="form-control-pill"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="form-group-label" style={{ fontSize: "13px", fontWeight: "600", color: "#334155", display: "block", marginBottom: 6 }}>Transfer Remarks & Notes</label>
            <textarea
              rows={3}
              name="remarks"
              value={form.remarks}
              onChange={handleChange}
              placeholder="Add optional notes or authorization details..."
              className="form-control-pill"
              style={{ resize: "none" }}
            />
          </div>

          <div className="mt-6 flex justify-end">
            <button type="submit" className="btn-action-primary">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" style={{ marginRight: 8 }}>
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
              Execute Transfer
            </button>
          </div>
        </form>
      </div>

      {/* Recent Transfers Table Card */}
      <div className="warehouse-table-container">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", padding: "0 4px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#18181b", margin: 0 }}>
            Recent Transfer History
          </h2>
          <span style={{ fontSize: "13px", color: "#71717a" }}>
            Showing last {history.length} transfer logs
          </span>
        </div>

        <table className="warehouse-table">
          <thead>
            <tr>
              <th>DATE & TIME</th>
              <th>PRODUCT</th>
              <th>FROM WAREHOUSE</th>
              <th>TO WAREHOUSE</th>
              <th style={{ textAlign: "center" }}>QTY</th>
              <th style={{ textAlign: "center" }}>STATUS</th>
            </tr>
          </thead>

          <tbody>
            {history.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "40px 0", color: "#71717a" }}>
                  No transfer history logged yet.
                </td>
              </tr>
            )}

            {history.map((item) => (
              <tr key={item.id}>
                <td style={{ fontSize: "13px", color: "#71717a" }}>{item.date}</td>
                <td style={{ fontWeight: "600", color: "#0f172a" }}>{item.product}</td>
                <td>{item.fromWarehouse}</td>
                <td>{item.toWarehouse}</td>
                <td style={{ textAlign: "center" }}>
                  <span style={{ background: "#f3f4f6", padding: "2px 8px", borderRadius: 4, fontWeight: 600 }}>{item.quantity}</span>
                </td>
                <td style={{ textAlign: "center" }}>
                  <span className="badge-status active">
                    Completed
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}