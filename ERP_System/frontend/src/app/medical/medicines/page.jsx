"use client";

import { useEffect, useState } from "react";
import { medicalService } from "@/services/medicalService";
import * as productService from "@/services/productService";
import toast, { Toaster } from "react-hot-toast";
import {
  FiActivity,
  FiPlus,
  FiTrash2,
  FiEdit,
  FiRefreshCw
} from "react-icons/fi";

const DOSAGE_FORMS = ["TABLET", "CAPSULE", "SYRUP", "INJECTION", "CREAM", "OINTMENT", "DROPS", "INHALER", "POWDER", "OTHER"];

export default function MedicinesCatalog() {
  const [medicines, setMedicines] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Medicine Inputs
  const [selectedProductId, setSelectedProductId] = useState("");
  const [genericName, setGenericName] = useState("");
  const [strength, setStrength] = useState("");
  const [dosageForm, setDosageForm] = useState("TABLET");
  const [prescriptionRequired, setPrescriptionRequired] = useState(false);
  const [manufacturer, setManufacturer] = useState("");

  useEffect(() => {
    fetchInitData();
  }, []);

  const fetchInitData = async () => {
    try {
      setLoading(true);
      const [medRes, prodRes] = await Promise.all([
        medicalService.getMedicines(),
        productService?.getProducts ? productService.getProducts() : Promise.resolve([])
      ]);
      setMedicines(medRes.data || []);
      
      const loadedProducts = prodRes.data || prodRes || [];
      setProducts(loadedProducts);
      
      if (loadedProducts.length > 0) {
        setSelectedProductId(loadedProducts[0].id);
      } else {
        setSelectedProductId("");
      }
    } catch (err) {
      console.error(err);
      setSelectedProductId("mock-id");
    } finally {
      setLoading(false);
    }
  };

  const handleAddMedicine = async (e) => {
    e.preventDefault();
    if (!selectedProductId || selectedProductId === "mock-id") {
      toast.error("Please select a valid inventory product first.");
      return;
    }
    if (!genericName.trim()) {
      toast.error("Please enter a generic formula name.");
      return;
    }
    if (!strength.trim()) {
      toast.error("Please enter medicine strength.");
      return;
    }

    try {
      const res = await medicalService.createMedicine({
        productId: selectedProductId,
        genericName: genericName.trim(),
        strength: strength.trim(),
        dosageForm,
        prescriptionRequired,
        manufacturer: manufacturer.trim() || undefined
      });
      if (res.success) {
        toast.success(`Medicine registered successfully!`);
        setGenericName("");
        setStrength("");
        setManufacturer("");
        setPrescriptionRequired(false);
        fetchInitData();
      }
    } catch (err) {
      console.error("Failed to register medicine", err);
      toast.error(err.response?.data?.message || "Failed to register medicine profile");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to deregister this medicine?")) return;
    try {
      await medicalService.deleteMedicine(id);
      fetchInitData();
    } catch (err) {
      setMedicines(medicines.filter(m => m.id !== id));
    }
  };

  return (
    <div style={{ padding: "24px", fontFamily: "Inter, sans-serif", backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      <Toaster position="top-right" />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#0f172a", margin: 0 }}>Medicines Registry</h1>
          <p style={{ color: "#64748b", margin: "4px 0 0 0" }}>Register medicines, set clinical categories, and enforce prescription locks.</p>
        </div>
        <button onClick={fetchInitData} style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#ffffff", display: "inline-flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
          <FiRefreshCw /> Reload List
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.8fr", gap: "32px" }}>
        
        {/* ADD MEDICINE FORM */}
        <div style={{ background: "#ffffff", borderRadius: "16px", padding: "24px", border: "1px solid #e2e8f0", height: "fit-content" }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", fontWeight: "700" }}>Register Drug Details</h3>
          <form onSubmit={handleAddMedicine} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            
            {/* Link product */}
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#64748b", marginBottom: "4px" }}>LINK TO INVENTORY PRODUCT</label>
              <select 
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
              >
                {products.length === 0 ? (
                  <option value="">No inventory products found</option>
                ) : (
                  <>
                    <option value="">-- Select Product --</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} (SKU: {p.sku})</option>
                    ))}
                  </>
                )}
              </select>
              {products.length === 0 && (
                <div style={{ marginTop: "8px", fontSize: "12px" }}>
                  <a href="/admin/products/add" style={{ color: "#4f46e5", fontWeight: "700", textDecoration: "underline" }}>
                    + Register a new Inventory Product first
                  </a>
                </div>
              )}
            </div>

            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#64748b", marginBottom: "4px" }}>GENERIC FORMULA NAME</label>
              <input 
                type="text"
                required
                placeholder="e.g. Paracetamol, Ibuprofen"
                value={genericName}
                onChange={(e) => setGenericName(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#64748b", marginBottom: "4px" }}>STRENGTH</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. 500mg, 10ml"
                  value={strength}
                  onChange={(e) => setStrength(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#64748b", marginBottom: "4px" }}>DOSAGE FORM</label>
                <select 
                  value={dosageForm}
                  onChange={(e) => setDosageForm(e.target.value)}
                  style={{ width: "100%", padding: "9px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                >
                  {DOSAGE_FORMS.map(df => (
                    <option key={df} value={df}>{df}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#64748b", marginBottom: "4px" }}>MANUFACTURER / BRAND</label>
              <input 
                type="text"
                placeholder="e.g. Pfizer, GSK"
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px", margin: "8px 0" }}>
              <input 
                type="checkbox"
                id="rx"
                checked={prescriptionRequired}
                onChange={(e) => setPrescriptionRequired(e.target.checked)}
              />
              <label htmlFor="rx" style={{ fontSize: "13px", fontWeight: "600", color: "#ef4444", cursor: "pointer" }}>
                PRESCRIPTION REQUIRED (RX LOCK)
              </label>
            </div>

            <button type="submit" style={{ width: "100%", padding: "12px", border: "none", background: "#10b981", color: "#ffffff", borderRadius: "8px", fontWeight: "700", cursor: "pointer" }}>
              Save Medicine Registry
            </button>
          </form>
        </div>

        {/* REGISTRY LIST */}
        <div style={{ background: "#ffffff", borderRadius: "16px", padding: "24px", border: "1px solid #e2e8f0" }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", fontWeight: "700" }}>Registered Medicines ({medicines.length})</h3>
          
          {medicines.length === 0 ? (
            <p style={{ color: "#64748b", margin: 0, fontSize: "14px" }}>No medicines registered yet.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #cbd5e1", textAlign: "left", fontSize: "12px", color: "#64748b" }}>
                    <th style={{ padding: "12px" }}>TRADE/BRAND NAME</th>
                    <th style={{ padding: "12px" }}>GENERIC FORMULA</th>
                    <th style={{ padding: "12px" }}>STRENGTH / FORM</th>
                    <th style={{ padding: "12px" }}>RX LOCK</th>
                    <th style={{ padding: "12px", width: "40px" }}></th>
                  </tr>
                </thead>
                <tbody>
                  {medicines.map(m => (
                    <tr key={m.id} style={{ borderBottom: "1px solid #f1f5f9", fontSize: "14px" }}>
                      <td style={{ padding: "12px", fontWeight: "700", color: "#1e293b" }}>{m.product?.name || "Generic Drug"}</td>
                      <td style={{ padding: "12px", color: "#475569" }}>{m.genericName}</td>
                      <td style={{ padding: "12px", color: "#64748b" }}>{m.strength} ({m.dosageForm})</td>
                      <td style={{ padding: "12px" }}>
                        {m.prescriptionRequired ? (
                          <span style={{ padding: "2px 6px", background: "#fef2f2", color: "#ef4444", borderRadius: "4px", fontSize: "10px", fontWeight: "700" }}>REQUIRED</span>
                        ) : (
                          <span style={{ padding: "2px 6px", background: "#f0fdf4", color: "#16a34a", borderRadius: "4px", fontSize: "10px", fontWeight: "700" }}>OTC</span>
                        )}
                      </td>
                      <td style={{ padding: "12px", textAlign: "center" }}>
                        <button onClick={() => handleDelete(m.id)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}>
                          <FiTrash2 />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
