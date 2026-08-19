"use client";

import { useState } from "react";
import { useAlert } from "@/context/AlertContext";

const warehouseList = [
  "Main Warehouse",
  "Branch Warehouse",
  "Backup Warehouse",
];

const productList = [
  "Dell Inspiron 15",
  "HP Laser Printer",
  "Samsung Monitor",
  "Mechanical Keyboard",
  "Logitech Mouse",
];

const initialHistory = [
  {
    id: 101,
    date: new Date(Date.now() - 3600000 * 4).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
    product: "Dell Inspiron 15",
    fromWarehouse: "Main Warehouse",
    toWarehouse: "Branch Warehouse",
    quantity: 10,
    status: "Completed",
  },
  {
    id: 102,
    date: new Date(Date.now() - 3600000 * 24).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
    product: "Logitech Mouse",
    fromWarehouse: "Main Warehouse",
    toWarehouse: "Backup Warehouse",
    quantity: 50,
    status: "Completed",
  },
];

export default function TransferForm() {
  const { showSuccess, showWarning } = useAlert();
  const [form, setForm] = useState({
    fromWarehouse: "",
    toWarehouse: "",
    product: "",
    quantity: "",
    remarks: "",
  });

  const [history, setHistory] = useState(initialHistory);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !form.fromWarehouse ||
      !form.toWarehouse ||
      !form.product ||
      !form.quantity
    ) {
      showWarning("Invalid form data", "Please fill all required stock transfer fields.");
      return;
    }

    if (form.fromWarehouse === form.toWarehouse) {
      showWarning("Invalid form data", "Source and Destination warehouse locations cannot be identical.");
      return;
    }

    const newTransfer = {
      id: Date.now(),
      date: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
      ...form,
      status: "Completed",
    };

    setHistory((prev) => [newTransfer, ...prev]);

    showSuccess("Approve stock transfer", "Stock transfer approved and executed successfully.");

    setForm({
      fromWarehouse: "",
      toWarehouse: "",
      product: "",
      quantity: "",
      remarks: "",
    });
  };

  return (
    <div className="space-y-8">
      {/* Transfer Form Card */}
      <div className="transfer-form-card">
        <h2 className="form-card-title">
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          Initiate Stock Transfer
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="form-group-label">From Warehouse *</label>
              <select
                name="fromWarehouse"
                value={form.fromWarehouse}
                onChange={handleChange}
                className="form-control-pill"
              >
                <option value="">Select Origin Warehouse</option>
                {warehouseList.map((warehouse) => (
                  <option key={warehouse} value={warehouse}>
                    {warehouse}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-group-label">To Warehouse *</label>
              <select
                name="toWarehouse"
                value={form.toWarehouse}
                onChange={handleChange}
                className="form-control-pill"
              >
                <option value="">Select Destination Warehouse</option>
                {warehouseList.map((warehouse) => (
                  <option key={warehouse} value={warehouse}>
                    {warehouse}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-group-label">Product *</label>
              <select
                name="product"
                value={form.product}
                onChange={handleChange}
                className="form-control-pill"
              >
                <option value="">Select Product Item</option>
                {productList.map((product) => (
                  <option key={product} value={product}>
                    {product}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-group-label">Transfer Quantity *</label>
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
            <label className="form-group-label">Transfer Remarks & Notes</label>
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
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
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
                <td className="product-name-cell">{item.product}</td>
                <td>{item.fromWarehouse}</td>
                <td>{item.toWarehouse}</td>
                <td style={{ textAlign: "center" }}>
                  <span className="quantity-badge">{item.quantity}</span>
                </td>
                <td style={{ textAlign: "center" }}>
                  <span className="badge-status instock">
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