"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { restaurantService } from "@/services/restaurantService";
import { getBranches } from "@/services/branchService";
import { FiPlus, FiCoffee, FiEdit, FiTrash2, FiRefreshCw, FiCheckCircle } from "react-icons/fi";

function RestaurantTablesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryRestaurantId = searchParams.get("restaurantId") || "";

  const [loading, setLoading] = useState(true);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(queryRestaurantId);
  const [areas, setAreas] = useState([]);
  const [tables, setTables] = useState([]);

  // Modals state
  const [showAddAreaModal, setShowAddAreaModal] = useState(false);
  const [areaName, setAreaName] = useState("");
  const [modalRestaurantId, setModalRestaurantId] = useState("");

  const [showAddTableModal, setShowAddTableModal] = useState(false);
  const [tableForm, setTableForm] = useState({
    tableNumber: "",
    capacity: 4,
    areaId: "",
  });

  const [selectedTable, setSelectedTable] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (queryRestaurantId) {
      setSelectedRestaurantId(queryRestaurantId);
    }
  }, [queryRestaurantId]);

  useEffect(() => {
    if (selectedRestaurantId) {
      fetchFloorPlan(selectedRestaurantId);
    }
  }, [selectedRestaurantId]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const res = await restaurantService.getRestaurants();
      let list = res.data || [];
      
      setRestaurants(list);
      if (list.length > 0) {
        const initialId = queryRestaurantId && list.some(r => r.id === queryRestaurantId) 
          ? queryRestaurantId 
          : list[0].id;
        setSelectedRestaurantId(initialId);
        setModalRestaurantId(initialId);
      }
    } catch (err) {
      console.error("Failed to fetch restaurants:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFloorPlan = async (restaurantId) => {
    try {
      const [areaRes, tableRes] = await Promise.all([
        restaurantService.getAreas(restaurantId),
        restaurantService.getTables(restaurantId),
      ]);
      setAreas(areaRes.data || []);
      setTables(tableRes.data || []);
    } catch (err) {
      console.error("Error loading floor plan:", err);
    }
  };

  const handleCreateArea = async (e) => {
    e.preventDefault();
    const targetRestId = modalRestaurantId || selectedRestaurantId || (restaurants[0]?.id);

    if (!areaName.trim()) {
      alert("Please enter an Area Name (e.g., Ground Floor, VIP).");
      return;
    }

    if (!targetRestId) {
      alert("No Restaurant Outlet found. Please create a restaurant outlet first.");
      return;
    }

    try {
      await restaurantService.createArea({
        name: areaName.trim(),
        restaurantId: targetRestId,
      });
      setAreaName("");
      setShowAddAreaModal(false);
      setSelectedRestaurantId(targetRestId);
      fetchFloorPlan(targetRestId);
      alert("Dining Area created successfully!");
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Failed to create area");
    }
  };

  const handleCreateTable = async (e) => {
    e.preventDefault();
    const targetRestId = selectedRestaurantId || (restaurants[0]?.id);

    if (!tableForm.tableNumber || !tableForm.areaId) {
      alert("Please fill in Table Number and select an Area.");
      return;
    }

    try {
      await restaurantService.createTable({
        ...tableForm,
        capacity: parseInt(tableForm.capacity),
        restaurantId: targetRestId,
      });
      setTableForm({ tableNumber: "", capacity: 4, areaId: "" });
      setShowAddTableModal(false);
      fetchFloorPlan(targetRestId);
      alert("Table created successfully!");
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Failed to create table");
    }
  };

  const handleStatusChange = async (tableId, newStatus) => {
    try {
      await restaurantService.updateTableStatus(tableId, newStatus);
      setSelectedTable(null);
      fetchFloorPlan(selectedRestaurantId);
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleOpenPOSForTable = (table) => {
    router.push(`/restaurant/pos?tableId=${table.id}&restaurantId=${selectedRestaurantId}`);
  };

  const handleDeleteArea = async (areaId) => {
    if (!confirm("Are you sure you want to delete this dining area?")) return;
    try {
      await restaurantService.deleteArea(areaId);
      fetchFloorPlan(selectedRestaurantId);
      alert("Dining area deleted successfully!");
    } catch (err) {
      alert("Failed to delete area: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteTable = async (tableId, e) => {
    if (e) e.stopPropagation();
    if (!confirm("Are you sure you want to delete this table?")) return;
    try {
      await restaurantService.deleteTable(tableId);
      fetchFloorPlan(selectedRestaurantId);
      alert("Table deleted successfully!");
    } catch (err) {
      alert("Failed to delete table: " + (err.response?.data?.message || err.message));
    }
  };

  if (loading) {
    return <div style={{ padding: "32px", textAlign: "center", color: "#64748b" }}>Loading Floor Plan...</div>;
  }

  return (
    <div style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto" }}>
      {/* Top Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#0f172a", margin: 0 }}>Restaurant Table Management</h1>
          <p style={{ color: "#64748b", margin: "4px 0 0 0" }}>Live floor plan, table statuses, and seating layout.</p>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {restaurants.length > 0 && (
            <select
              value={selectedRestaurantId}
              onChange={(e) => setSelectedRestaurantId(e.target.value)}
              style={{
                padding: "10px 14px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                backgroundColor: "#fff",
                fontWeight: "600",
              }}
            >
              {restaurants.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() => {
              setModalRestaurantId(selectedRestaurantId || (restaurants[0]?.id || ""));
              setShowAddAreaModal(true);
            }}
            style={{
              padding: "10px 16px",
              backgroundColor: "#f1f5f9",
              border: "1px solid #cbd5e1",
              borderRadius: "8px",
              fontWeight: "600",
              color: "#334155",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <FiPlus /> Add Area
          </button>

          <button
            onClick={() => {
              if (areas.length === 0) {
                alert("Please add at least one dining area first.");
                return;
              }
              setTableForm((prev) => ({ ...prev, areaId: areas[0]?.id || "" }));
              setShowAddTableModal(true);
            }}
            style={{
              padding: "10px 16px",
              backgroundColor: "#2563eb",
              border: "none",
              borderRadius: "8px",
              fontWeight: "600",
              color: "#fff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <FiPlus /> Add Table
          </button>
        </div>
      </div>

      {/* Table Legend */}
      <div
        style={{
          display: "flex",
          gap: "16px",
          marginBottom: "24px",
          backgroundColor: "#fff",
          padding: "14px 20px",
          borderRadius: "10px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          flexWrap: "wrap",
        }}
      >
        <span style={{ fontSize: "14px", fontWeight: "700", color: "#334155" }}>Status Legend:</span>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px" }}>
          <span style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#22c55e" }}></span>
          <span>AVAILABLE</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px" }}>
          <span style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#ef4444" }}></span>
          <span>OCCUPIED</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px" }}>
          <span style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#3b82f6" }}></span>
          <span>RESERVED</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px" }}>
          <span style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#eab308" }}></span>
          <span>CLEANING</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px" }}>
          <span style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#64748b" }}></span>
          <span>BLOCKED</span>
        </div>
      </div>

      {/* Floor Plan Display grouped by Areas */}
      {areas.length === 0 ? (
        <div style={{ backgroundColor: "#fff", padding: "48px", borderRadius: "12px", textAlign: "center", border: "1px solid #e2e8f0" }}>
          <FiCoffee size={48} color="#94a3b8" style={{ marginBottom: "12px" }} />
          <h3 style={{ color: "#0f172a", fontSize: "18px", fontWeight: "700", margin: "0 0 6px 0" }}>No floors or areas found</h3>
          <p style={{ color: "#64748b", fontSize: "14px", margin: "0 0 20px 0" }}>Create your first floor or dining section to configure tables.</p>
          <button
            onClick={() => {
              setModalRestaurantId(selectedRestaurantId || (restaurants[0]?.id || ""));
              setShowAddAreaModal(true);
            }}
            style={{ padding: "10px 20px", backgroundColor: "#2563eb", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "700", cursor: "pointer" }}
          >
            + Add Area
          </button>
        </div>
      ) : (
        areas.map((area) => {
          const areaTables = tables.filter((t) => t.areaId === area.id);

          return (
            <div key={area.id} style={{ marginBottom: "32px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>{area.name}</span>
                  <span style={{ fontSize: "13px", fontWeight: "500", color: "#64748b", backgroundColor: "#f1f5f9", padding: "2px 10px", borderRadius: "12px" }}>
                    {areaTables.length} tables
                  </span>
                </h2>

                <button
                  onClick={() => handleDeleteArea(area.id)}
                  style={{ padding: "6px 12px", backgroundColor: "#fee2e2", color: "#991b1b", border: "none", borderRadius: "6px", fontSize: "12px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
                  title="Delete Area"
                >
                  <FiTrash2 size={14} /> Delete Area
                </button>
              </div>

              {areaTables.length === 0 ? (
                <div style={{ backgroundColor: "#fff", padding: "24px", borderRadius: "10px", border: "1px solid #e2e8f0", textAlign: "center" }}>
                  <p style={{ color: "#64748b", fontSize: "14px", margin: "0 0 12px 0" }}>No tables found in this area</p>
                  <button
                    onClick={() => {
                      setTableForm((prev) => ({ ...prev, areaId: area.id }));
                      setShowAddTableModal(true);
                    }}
                    style={{ padding: "8px 16px", backgroundColor: "#2563eb", color: "#fff", border: "none", borderRadius: "6px", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}
                  >
                    + Add Table
                  </button>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: "16px" }}>
                  {areaTables.map((tbl) => {
                    const isOccupied = tbl.status === "OCCUPIED";
                    const isReserved = tbl.status === "RESERVED";
                    const isAvailable = tbl.status === "AVAILABLE";
                    const isCleaning = tbl.status === "CLEANING";

                    const bg = isOccupied ? "#fef2f2" : isReserved ? "#eff6ff" : isAvailable ? "#f0fdf4" : isCleaning ? "#fefce8" : "#f8fafc";
                    const border = isOccupied ? "#ef4444" : isReserved ? "#3b82f6" : isAvailable ? "#22c55e" : isCleaning ? "#eab308" : "#cbd5e1";
                    const textColor = isOccupied ? "#991b1b" : isReserved ? "#1e40af" : isAvailable ? "#166534" : isCleaning ? "#854d0e" : "#334155";

                    const activeOrder = tbl.orders && tbl.orders.length > 0 ? tbl.orders[0] : null;

                    return (
                      <div
                        key={tbl.id}
                        onClick={() => setSelectedTable(tbl)}
                        style={{
                          backgroundColor: bg,
                          border: `2px solid ${border}`,
                          borderRadius: "12px",
                          padding: "16px",
                          cursor: "pointer",
                          transition: "transform 0.15s ease, box-shadow 0.15s ease",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                          position: "relative",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: "18px", fontWeight: "800", color: textColor }}>{tbl.tableNumber}</span>
                          <button
                            onClick={(e) => handleDeleteTable(tbl.id, e)}
                            style={{ background: "#fee2e2", color: "#ef4444", border: "none", borderRadius: "4px", padding: "4px 6px", cursor: "pointer", display: "flex", alignItems: "center" }}
                            title="Delete Table"
                          >
                            <FiTrash2 size={13} />
                          </button>
                        </div>
                        <div style={{ fontSize: "12px", color: textColor, fontWeight: "600", marginTop: "4px" }}>
                          {tbl.capacity} Seats
                        </div>

                        <div style={{ marginTop: "12px" }}>
                          <span
                            style={{
                              display: "inline-block",
                              padding: "4px 8px",
                              borderRadius: "6px",
                              fontSize: "11px",
                              fontWeight: "700",
                              backgroundColor: border,
                              color: "#fff",
                              textTransform: "uppercase",
                            }}
                          >
                            {tbl.status}
                          </span>
                        </div>

                        {activeOrder && (
                          <div style={{ marginTop: "12px", paddingTop: "8px", borderTop: `1px solid ${border}`, fontSize: "12px", fontWeight: "700", color: textColor }}>
                            Order: {activeOrder.orderNumber}
                            <div style={{ fontSize: "14px", fontWeight: "800", marginTop: "2px" }}>
                              ₹{parseFloat(activeOrder.totalAmount || 0).toFixed(2)}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })
      )}

      {/* Add Area Modal */}
      {showAddAreaModal && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ backgroundColor: "#fff", padding: "24px", borderRadius: "12px", width: "100%", maxWidth: "420px" }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: "18px", fontWeight: "700" }}>Create Dining Area</h3>
            <form onSubmit={handleCreateArea}>
              {restaurants.length > 1 && (
                <div style={{ marginBottom: "14px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "4px" }}>Restaurant Outlet</label>
                  <select
                    value={modalRestaurantId}
                    onChange={(e) => setModalRestaurantId(e.target.value)}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                  >
                    {restaurants.map((r) => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "600", marginBottom: "6px" }}>Area Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ground Floor, VIP Section, Terrace"
                  value={areaName}
                  onChange={(e) => setAreaName(e.target.value)}
                  required
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button type="button" onClick={() => setShowAddAreaModal(false)} style={{ padding: "8px 16px", borderRadius: "6px", border: "1px solid #cbd5e1", backgroundColor: "#fff" }}>
                  Cancel
                </button>
                <button type="submit" style={{ padding: "8px 16px", borderRadius: "6px", backgroundColor: "#2563eb", color: "#fff", border: "none", fontWeight: "600" }}>
                  Save Area
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Table Modal */}
      {showAddTableModal && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ backgroundColor: "#fff", padding: "24px", borderRadius: "12px", width: "100%", maxWidth: "450px" }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: "18px", fontWeight: "700" }}>Add New Table</h3>
            <form onSubmit={handleCreateTable}>
              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "600", marginBottom: "6px" }}>Area</label>
                <select
                  value={tableForm.areaId}
                  onChange={(e) => setTableForm({ ...tableForm, areaId: e.target.value })}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                >
                  {areas.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "600", marginBottom: "6px" }}>Table Number / Identifier</label>
                <input
                  type="text"
                  placeholder="e.g. Table 01, T-12"
                  value={tableForm.tableNumber}
                  onChange={(e) => setTableForm({ ...tableForm, tableNumber: e.target.value })}
                  required
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "600", marginBottom: "6px" }}>Capacity (Seats)</label>
                <input
                  type="number"
                  min="1"
                  value={tableForm.capacity}
                  onChange={(e) => setTableForm({ ...tableForm, capacity: e.target.value })}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button type="button" onClick={() => setShowAddTableModal(false)} style={{ padding: "8px 16px", borderRadius: "6px", border: "1px solid #cbd5e1", backgroundColor: "#fff" }}>
                  Cancel
                </button>
                <button type="submit" style={{ padding: "8px 16px", borderRadius: "6px", backgroundColor: "#2563eb", color: "#fff", border: "none", fontWeight: "600" }}>
                  Save Table
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Selected Table Action Drawer */}
      {selectedTable && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ backgroundColor: "#fff", padding: "24px", borderRadius: "12px", width: "100%", maxWidth: "450px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "700" }}>{selectedTable.tableNumber}</h3>
              <span style={{ padding: "4px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "700", backgroundColor: "#f1f5f9" }}>
                {selectedTable.status}
              </span>
            </div>

            <p style={{ color: "#64748b", margin: "0 0 20px 0" }}>
              Capacity: {selectedTable.capacity} Seats | Area: {selectedTable.area?.name}
            </p>

            {/* Quick Actions */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
              <button
                onClick={() => handleOpenPOSForTable(selectedTable)}
                style={{
                  padding: "12px",
                  backgroundColor: "#2563eb",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                {selectedTable.status === "OCCUPIED" ? "Open Active Order in POS" : "Take Order / Open POS"}
              </button>

              <div style={{ fontSize: "14px", fontWeight: "700", color: "#334155", marginTop: "10px" }}>Change Table Status:</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                <button onClick={() => handleStatusChange(selectedTable.id, "AVAILABLE")} style={{ padding: "8px", backgroundColor: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0", borderRadius: "6px", fontWeight: "600", cursor: "pointer" }}>AVAILABLE</button>
                <button onClick={() => handleStatusChange(selectedTable.id, "OCCUPIED")} style={{ padding: "8px", backgroundColor: "#fef2f2", color: "#991b1b", border: "1px solid #fecaca", borderRadius: "6px", fontWeight: "600", cursor: "pointer" }}>OCCUPIED</button>
                <button onClick={() => handleStatusChange(selectedTable.id, "RESERVED")} style={{ padding: "8px", backgroundColor: "#eff6ff", color: "#1e40af", border: "1px solid #bfdbfe", borderRadius: "6px", fontWeight: "600", cursor: "pointer" }}>RESERVED</button>
                <button onClick={() => handleStatusChange(selectedTable.id, "CLEANING")} style={{ padding: "8px", backgroundColor: "#fefce8", color: "#854d0e", border: "1px solid #fef08a", borderRadius: "6px", fontWeight: "600", cursor: "pointer" }}>CLEANING</button>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button onClick={() => setSelectedTable(null)} style={{ padding: "8px 16px", borderRadius: "6px", border: "1px solid #cbd5e1", backgroundColor: "#fff" }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RestaurantTablesPage() {
  return (
    <Suspense fallback={<div style={{ padding: "32px", textAlign: "center" }}>Loading Floor Plan...</div>}>
      <RestaurantTablesContent />
    </Suspense>
  );
}
