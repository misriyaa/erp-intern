"use client";

import { useEffect, useState } from "react";
import { laundryService } from "@/services/laundryService";
import {
  FiBox,
  FiPlus,
  FiTrash2,
  FiEdit,
  FiRefreshCw
} from "react-icons/fi";

export default function LaundryServicesConfig() {
  const [laundries, setLaundries] = useState([]);
  const [selectedLaundryId, setSelectedLaundryId] = useState("");
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Category States
  const [newCatName, setNewCatName] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");

  // New Service States
  const [newSerCatId, setNewSerCatId] = useState("");
  const [newSerName, setNewSerName] = useState("");
  const [newSerDesc, setNewSerDesc] = useState("");
  const [newSerPrice, setNewSerPrice] = useState("");

  useEffect(() => {
    fetchInitData();
  }, []);

  useEffect(() => {
    if (selectedLaundryId) {
      fetchServiceCatalog(selectedLaundryId);
    }
  }, [selectedLaundryId]);

  const fetchInitData = async () => {
    try {
      setLoading(true);
      const res = await laundryService.getLaundries();
      const lndList = res.data || [];
      setLaundries(lndList);
      if (lndList.length > 0) {
        setSelectedLaundryId(lndList[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchServiceCatalog = async (laundryId) => {
    try {
      setLoading(true);
      const [catRes, serRes] = await Promise.all([
        laundryService.getCategories(laundryId),
        laundryService.getServices(laundryId)
      ]);
      const catList = catRes.data || [];
      setCategories(catList);
      setServices(serRes.data || []);
      if (catList.length > 0) {
        setNewSerCatId(catList[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCatName || !selectedLaundryId) return;

    try {
      const res = await laundryService.createCategory({
        laundryId: selectedLaundryId,
        name: newCatName,
        description: newCatDesc,
        sortOrder: 0
      });
      if (res.success) {
        setNewCatName("");
        setNewCatDesc("");
        fetchServiceCatalog(selectedLaundryId);
      }
    } catch (err) {
      alert("Failed to add category: " + err.message);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!confirm("Are you sure? This will delete the category and all its services.")) return;
    try {
      await laundryService.deleteCategory(id);
      fetchServiceCatalog(selectedLaundryId);
    } catch (err) {
      alert("Failed to delete category: " + err.message);
    }
  };

  const handleAddService = async (e) => {
    e.preventDefault();
    if (!newSerName || !newSerPrice || !newSerCatId || !selectedLaundryId) return;

    try {
      const res = await laundryService.createService({
        laundryId: selectedLaundryId,
        categoryId: newSerCatId,
        name: newSerName,
        description: newSerDesc,
        price: parseFloat(newSerPrice)
      });
      if (res.success) {
        setNewSerName("");
        setNewSerDesc("");
        setNewSerPrice("");
        fetchServiceCatalog(selectedLaundryId);
      }
    } catch (err) {
      alert("Failed to add service: " + err.message);
    }
  };

  const handleDeleteService = async (id) => {
    if (!confirm("Are you sure you want to delete this service rate?")) return;
    try {
      await laundryService.deleteService(id);
      fetchServiceCatalog(selectedLaundryId);
    } catch (err) {
      alert("Failed to delete service: " + err.message);
    }
  };

  return (
    <div style={{ padding: "24px", fontFamily: "Inter, sans-serif", backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#0f172a", margin: 0 }}>laundry Service Configuration</h1>
          <p style={{ color: "#64748b", margin: "4px 0 0 0" }}>Configure washing, dry cleaning categories, and individual garment pricing rules.</p>
        </div>
        
        {/* Laundry Selector */}
        <div>
          <select 
            value={selectedLaundryId}
            onChange={(e) => setSelectedLaundryId(e.target.value)}
            style={{ padding: "10px 16px", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#ffffff", fontWeight: "600" }}
          >
            {laundries.map(l => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.8fr", gap: "32px" }}>
        
        {/* CATEGORIES COLUMN */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Add Category Form */}
          <div style={{ background: "#ffffff", borderRadius: "16px", padding: "24px", border: "1px solid #e2e8f0" }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", fontWeight: "700" }}>Create Service Category</h3>
            <form onSubmit={handleAddCategory} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#64748b", marginBottom: "4px" }}>CATEGORY NAME</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Dry Cleaning, Wash & Fold"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#64748b", marginBottom: "4px" }}>DESCRIPTION</label>
                <input 
                  type="text"
                  placeholder="e.g. Standard 2-day wash"
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                />
              </div>
              <button type="submit" style={{ width: "100%", padding: "10px", border: "none", background: "#2563eb", color: "#ffffff", borderRadius: "8px", fontWeight: "700", cursor: "pointer" }}>
                Add Category
              </button>
            </form>
          </div>

          {/* Categories List */}
          <div style={{ background: "#ffffff", borderRadius: "16px", padding: "24px", border: "1px solid #e2e8f0" }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", fontWeight: "700" }}>Active Categories ({categories.length})</h3>
            {categories.length === 0 ? (
              <p style={{ color: "#64748b", margin: 0, fontSize: "14px" }}>No categories configured.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {categories.map(cat => (
                  <div key={cat.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", border: "1px solid #f1f5f9", borderRadius: "10px", background: "#f8fafc" }}>
                    <div>
                      <strong style={{ color: "#1e293b" }}>{cat.name}</strong>
                      {cat.description && <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "#64748b" }}>{cat.description}</p>}
                    </div>
                    <button onClick={() => handleDeleteCategory(cat.id)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}>
                      <FiTrash2 />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* SERVICES COLUMN */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Add Service Form */}
          <div style={{ background: "#ffffff", borderRadius: "16px", padding: "24px", border: "1px solid #e2e8f0" }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", fontWeight: "700" }}>Create Service Price Rate</h3>
            <form onSubmit={handleAddService} style={{ display: "grid", gridTemplateColumns: "1.2fr 1.5fr 120px", gap: "16px", alignItems: "end" }}>
              
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#64748b", marginBottom: "4px" }}>CATEGORY</label>
                <select 
                  value={newSerCatId}
                  onChange={(e) => setNewSerCatId(e.target.value)}
                  style={{ width: "100%", padding: "9px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#64748b", marginBottom: "4px" }}>SERVICE ITEM NAME</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Silk Shirt Dry Clean"
                  value={newSerName}
                  onChange={(e) => setNewSerName(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#64748b", marginBottom: "4px" }}>PRICE ($)</label>
                <input 
                  type="number"
                  step="0.01"
                  required
                  placeholder="5.00"
                  value={newSerPrice}
                  onChange={(e) => setNewSerPrice(e.target.value)}
                  style={{ width: "100%", padding: "9px", borderRadius: "8px", border: "1px solid #cbd5e1", fontWeight: "700" }}
                />
              </div>

              <div style={{ gridColumn: "span 3" }}>
                <button type="submit" style={{ width: "100%", padding: "12px", border: "none", background: "#2563eb", color: "#ffffff", borderRadius: "8px", fontWeight: "700", cursor: "pointer" }}>
                  Save Service Rate
                </button>
              </div>
            </form>
          </div>

          {/* Services List Table */}
          <div style={{ background: "#ffffff", borderRadius: "16px", padding: "24px", border: "1px solid #e2e8f0" }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", fontWeight: "700" }}>Configured Service Rates ({services.length})</h3>
            {services.length === 0 ? (
              <p style={{ color: "#64748b", margin: 0, fontSize: "14px" }}>No service rates configured.</p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #cbd5e1", textAlign: "left", fontSize: "12px", color: "#64748b" }}>
                      <th style={{ padding: "12px" }}>SERVICE ITEM</th>
                      <th style={{ padding: "12px" }}>CATEGORY</th>
                      <th style={{ padding: "12px", textAlign: "right" }}>UNIT PRICE</th>
                      <th style={{ padding: "12px", width: "40px" }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {services.map(ser => (
                      <tr key={ser.id} style={{ borderBottom: "1px solid #f1f5f9", fontSize: "14px" }}>
                        <td style={{ padding: "12px", fontWeight: "700", color: "#1e293b" }}>{ser.name}</td>
                        <td style={{ padding: "12px", color: "#475569" }}>{ser.category?.name}</td>
                        <td style={{ padding: "12px", textAlign: "right", fontWeight: "700", color: "#2563eb" }}>${parseFloat(ser.price).toFixed(2)}</td>
                        <td style={{ padding: "12px", textAlign: "center" }}>
                          <button onClick={() => handleDeleteService(ser.id)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}>
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

    </div>
  );
}
