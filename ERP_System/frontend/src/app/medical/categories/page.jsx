"use client";

import { useEffect, useState } from "react";
import { medicalService } from "@/services/medicalService";
import { FiBox, FiPlus, FiTrash2 } from "react-icons/fi";

export default function MedicineCategories() {
  const [categories, setCategories] = useState([
    { id: "c1", name: "Analgesics", description: "Pain relief medication" },
    { id: "c2", name: "Antibiotics", description: "Bacterial infection control" },
    { id: "c3", name: "Antihistamines", description: "Allergy treatment medications" }
  ]);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");

  const handleAdd = (e) => {
    e.preventDefault();
    if (!name) return;
    setCategories([...categories, { id: `c-${Date.now()}`, name, description: desc }]);
    setName("");
    setDesc("");
  };

  return (
    <div style={{ padding: "24px", fontFamily: "Inter, sans-serif", backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#0f172a", margin: 0 }}>Medicine Categories</h1>
        <p style={{ color: "#64748b", margin: "4px 0 0 0" }}>Manage pharmacological classifications like Analgesics, Antibiotics, etc.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "32px" }}>
        <div style={{ background: "#ffffff", borderRadius: "16px", padding: "24px", border: "1px solid #e2e8f0", height: "fit-content" }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", fontWeight: "700" }}>Add Category</h3>
          <form onSubmit={handleAdd} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <input type="text" placeholder="Category Name" required value={name} onChange={(e) => setName(e.target.value)} style={{ padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }} />
            <input type="text" placeholder="Description" value={desc} onChange={(e) => setDesc(e.target.value)} style={{ padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }} />
            <button type="submit" style={{ padding: "10px", border: "none", background: "#10b981", color: "#ffffff", borderRadius: "8px", fontWeight: "700", cursor: "pointer" }}>Save Category</button>
          </form>
        </div>

        <div style={{ background: "#ffffff", borderRadius: "16px", padding: "24px", border: "1px solid #e2e8f0" }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", fontWeight: "700" }}>Active Classifications</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {categories.map(c => (
              <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", border: "1px solid #f1f5f9", borderRadius: "12px", background: "#f8fafc" }}>
                <div>
                  <strong>{c.name}</strong>
                  <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#64748b" }}>{c.description}</p>
                </div>
                <button onClick={() => setCategories(categories.filter(x => x.id !== c.id))} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}><FiTrash2 /></button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
