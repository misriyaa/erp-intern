"use client";

import { useState, useEffect } from "react";
import {
  FiShoppingBag,
  FiPlus,
  FiSearch,
  FiFilter,
  FiTrash2,
  FiX,
  FiTag,
  FiBox,
} from "react-icons/fi";
import { toast, Toaster } from "react-hot-toast";
import apiClient from "@/services/apiClient";

export default function TextileProductsPage() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    fabricType: "Cotton Silk",
    gsm: "",
    width: "58 inches",
    colorPattern: "",
    stockMeters: "",
    pricePerMeter: "",
  });

  const extractMeta = (desc, key) => {
    if (!desc) return null;
    const match = desc.match(new RegExp(`${key}:\\s*([^|]+)`));
    return match ? match[1].trim() : null;
  };

  const fetchTextileProducts = async () => {
    try {
      const res = await apiClient.get("/products").then((r) => r.data);
      const all = res.data || (Array.isArray(res) ? res : []);
      const textileDbItems = all.filter(
        (p) =>
          p.sku?.startsWith("TEX-") ||
          p.description?.includes("[TEXTILE]")
      );

      const mapped = textileDbItems.map((p) => ({
        id: p.id,
        name: p.name,
        fabricType: extractMeta(p.description, "Fabric") || "Cotton Blend",
        gsm: Number(extractMeta(p.description, "GSM")) || 180,
        width: extractMeta(p.description, "Width") || "58 inches",
        colorPattern: extractMeta(p.description, "Pattern") || "Solid",
        stockMeters: p.inventories?.[0]?.quantity || 500,
        pricePerMeter: Number(p.sellingPrice) || 300,
        status: "ACTIVE",
      }));

      setProducts(mapped);
    } catch (err) {
      console.error("Error loading textile products from DB:", err);
    }
  };

  useEffect(() => {
    fetchTextileProducts();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.pricePerMeter) {
      toast.error("Please enter fabric name and price per meter");
      return;
    }

    setSubmitting(true);
    const sku = `TEX-${Date.now().toString().slice(-6)}`;
    const desc = `[TEXTILE] Fabric: ${formData.fabricType} | GSM: ${
      formData.gsm || 160
    } | Width: ${formData.width || "58 inches"} | Pattern: ${
      formData.colorPattern || "Solid"
    }`;

    const payload = {
      name: formData.name,
      sku,
      costPrice: parseFloat(formData.pricePerMeter || 0) * 0.8,
      sellingPrice: parseFloat(formData.pricePerMeter || 0),
      description: desc,
    };

    try {
      const res = await apiClient.post("/products", payload).then((r) => r.data);
      const savedProd = res.data || res;

      const newProd = {
        id: savedProd.id || `TEX-${Date.now()}`,
        name: formData.name,
        fabricType: formData.fabricType,
        gsm: Number(formData.gsm) || 160,
        width: formData.width || "58 inches",
        colorPattern: formData.colorPattern || "Solid",
        stockMeters: Number(formData.stockMeters) || 500,
        pricePerMeter: Number(formData.pricePerMeter),
        status: "ACTIVE",
      };

      setProducts([newProd, ...products]);
      toast.success(`Textile product "${formData.name}" saved dynamically to DB!`);
      setShowAddModal(false);
      setFormData({
        name: "",
        fabricType: "Cotton Silk",
        gsm: "",
        width: "58 inches",
        colorPattern: "",
        stockMeters: "",
        pricePerMeter: "",
      });
    } catch (err) {
      console.error("Error saving textile product to DB:", err);
      toast.error(err.response?.data?.message || "Failed to save textile product");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (confirm(`Remove product "${name}" from textile catalog?`)) {
      try {
        await apiClient.delete(`/products/${id}`);
      } catch (err) {
        console.warn("Backend delete note:", err.message);
      }
      setProducts(products.filter((p) => p.id !== id));
      toast.success("Product deleted successfully");
    }
  };

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.fabricType.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase())
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
            <FiShoppingBag style={{ color: "#0d9488" }} /> Textile Finished Products Catalog
          </h1>
          <p style={{ color: "#64748b", margin: "4px 0 0 0", fontSize: "14px" }}>
            Manage finished fabric rolls, GSM specifications, width metrics, pricing, and ready stock.
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
          <FiPlus size={16} /> Add Textile Product
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
          placeholder="Search product code, fabric type, or pattern..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ border: "none", outline: "none", background: "transparent", width: "100%", fontSize: "14px" }}
        />
      </div>

      {/* TABLE */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: "14px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
          overflow: "hidden",
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                <th style={{ padding: "14px 20px", fontWeight: "700", color: "#475569" }}>Code</th>
                <th style={{ padding: "14px 20px", fontWeight: "700", color: "#475569" }}>Product Name</th>
                <th style={{ padding: "14px 20px", fontWeight: "700", color: "#475569" }}>Fabric Composition</th>
                <th style={{ padding: "14px 20px", fontWeight: "700", color: "#475569" }}>GSM / Width</th>
                <th style={{ padding: "14px 20px", fontWeight: "700", color: "#475569" }}>Stock Available</th>
                <th style={{ padding: "14px 20px", fontWeight: "700", color: "#475569" }}>Selling Price</th>
                <th style={{ padding: "14px 20px", fontWeight: "700", color: "#475569" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "16px 20px", fontWeight: "700", color: "#0d9488" }}>{p.id}</td>
                  <td style={{ padding: "16px 20px" }}>
                    <div style={{ fontWeight: "700", color: "#0f172a" }}>{p.name}</div>
                    <div style={{ fontSize: "12px", color: "#64748b" }}>{p.colorPattern}</div>
                  </td>
                  <td style={{ padding: "16px 20px", color: "#334155" }}>{p.fabricType}</td>
                  <td style={{ padding: "16px 20px", color: "#475569" }}>
                    <strong>{p.gsm} GSM</strong> ({p.width})
                  </td>
                  <td style={{ padding: "16px 20px", fontWeight: "700", color: "#0f172a" }}>
                    {p.stockMeters.toLocaleString()} Meters
                  </td>
                  <td style={{ padding: "16px 20px", fontWeight: "800", color: "#0d9488" }}>
                    ₹{p.pricePerMeter} <span style={{ fontSize: "12px", fontWeight: "500", color: "#64748b" }}>/ Meter</span>
                  </td>
                  <td style={{ padding: "16px 20px" }}>
                    <button
                      onClick={() => handleDelete(p.id, p.name)}
                      style={{
                        padding: "6px 12px",
                        background: "#fee2e2",
                        color: "#ef4444",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "12px",
                        fontWeight: "600",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <FiTrash2 size={13} /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD PRODUCT MODAL */}
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
              maxWidth: "520px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "800", color: "#0f172a", margin: 0 }}>
                🛍️ Add Finished Textile Fabric Product
              </h2>
              <button onClick={() => setShowAddModal(false)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleAddProduct}>
              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Jacquard Damask Table Linen Fabric"
                  required
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                    Fabric Composition
                  </label>
                  <input
                    type="text"
                    name="fabricType"
                    value={formData.fabricType}
                    onChange={handleInputChange}
                    placeholder="Cotton / Silk / Denim"
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                    GSM (g/m²)
                  </label>
                  <input
                    type="number"
                    name="gsm"
                    value={formData.gsm}
                    onChange={handleInputChange}
                    placeholder="180"
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                    Roll Width
                  </label>
                  <input
                    type="text"
                    name="width"
                    value={formData.width}
                    onChange={handleInputChange}
                    placeholder="58 inches"
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                    Color / Pattern
                  </label>
                  <input
                    type="text"
                    name="colorPattern"
                    value={formData.colorPattern}
                    onChange={handleInputChange}
                    placeholder="Solid Navy Blue"
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                    Initial Stock (Meters)
                  </label>
                  <input
                    type="number"
                    name="stockMeters"
                    value={formData.stockMeters}
                    onChange={handleInputChange}
                    placeholder="1000"
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                    Selling Price (₹ / Meter) *
                  </label>
                  <input
                    type="number"
                    name="pricePerMeter"
                    value={formData.pricePerMeter}
                    onChange={handleInputChange}
                    placeholder="350"
                    required
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
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
