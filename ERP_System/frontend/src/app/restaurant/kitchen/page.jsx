"use client";

import { useState, useEffect } from "react";
import { restaurantService } from "@/services/restaurantService";
import { FiTv, FiClock, FiCheck, FiPlay, FiRefreshCw, FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import { showError } from "@/utils/swal";

import { useCompany } from "@/context/CompanyContext";

export default function KitchenDisplayPage() {
  const { user } = useCompany();
  const roleUpper = (user?.role || user?.roleRef?.name || user?.type || "").toUpperCase();
  const isAdmin = roleUpper.includes("SUPER") || roleUpper.includes("ADMIN") || roleUpper.includes("OWNER");

  const [loading, setLoading] = useState(true);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState("");
  const [kotOrders, setKotOrders] = useState([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchKOTs();
    const interval = setInterval(fetchKOTs, 3000); // Poll live KOTs every 3s
    return () => clearInterval(interval);
  }, [selectedRestaurantId]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const res = await restaurantService.getRestaurants();
      const list = res.data || [];
      setRestaurants(list);
      if (list.length > 0) {
        let assigned = list[0].id;
        if (user?.restaurantId) {
          const match = list.find((r) => r.id === user.restaurantId);
          if (match) assigned = match.id;
        } else if (user?.branchId) {
          const match = list.find((r) => r.branchId === user.branchId);
          if (match) assigned = match.id;
        }
        setSelectedRestaurantId(assigned);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchKOTs = async () => {
    try {
      const res = await restaurantService.getKitchenOrders(selectedRestaurantId);
      setKotOrders(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartPreparing = async (id) => {
    try {
      await restaurantService.startPreparation(id);
      fetchKOTs();
    } catch (err) { showError("KDS Action Failed", err.message); }
  };

  const handleMarkReady = async (id) => {
    try {
      await restaurantService.markReady(id);
      fetchKOTs();
    } catch (err) { showError("KDS Action Failed", err.message); }
  };

  const handleMarkServed = async (id) => {
    try {
      await restaurantService.markServed(id);
      fetchKOTs();
    } catch (err) { showError("KDS Action Failed", err.message); }
  };

  const newKOTs = kotOrders.filter((k) => k.status === "NEW");
  const preparingKOTs = kotOrders.filter((k) => k.status === "PREPARING");
  const readyKOTs = kotOrders.filter((k) => k.status === "READY");

  if (loading) {
    return (
      <div style={{ padding: "60px", textAlign: "center", color: "#64748b", fontFamily: "Inter, sans-serif" }}>
        <FiRefreshCw className="animate-spin" size={32} style={{ marginBottom: "16px", color: "#2563eb" }} />
        <h2 style={{ fontSize: "20px", color: "#0f172a", margin: "0 0 8px 0" }}>Loading Kitchen Display System...</h2>
        <p style={{ margin: 0 }}>Fetching KOT Preparation Queue & Kitchen Tickets...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px", maxWidth: "1600px", margin: "0 auto", backgroundColor: "#f8fafc", minHeight: "100vh", fontFamily: "Inter, sans-serif" }}>
      
      {/* Header Bar */}
      <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", padding: "20px 24px", border: "1px solid #e2e8f0", marginBottom: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ background: "#d1fae5", padding: "12px", borderRadius: "12px", color: "#059669" }}>
            <FiTv size={26} />
          </div>
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: "800", margin: 0, color: "#0f172a" }}>Kitchen Display System (KDS)</h1>
            <p style={{ color: "#64748b", margin: "3px 0 0 0", fontSize: "14px" }}>Live KOT preparation queue & kitchen order ticket management.</p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {isAdmin && restaurants.length > 0 && (
            <select
              value={selectedRestaurantId}
              onChange={(e) => setSelectedRestaurantId(e.target.value)}
              style={{
                padding: "9px 14px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                backgroundColor: "#ffffff",
                fontWeight: "700",
                color: "#1e293b",
                fontSize: "13px",
              }}
            >
              {restaurants.map((r) => (
                <option key={r.id} value={r.id}>🏬 {r.name}</option>
              ))}
            </select>
          )}

          <button
            onClick={fetchKOTs}
            style={{
              padding: "9px 16px",
              backgroundColor: "#ffffff",
              border: "1px solid #cbd5e1",
              color: "#334155",
              borderRadius: "8px",
              fontWeight: "700",
              fontSize: "13px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <FiRefreshCw size={15} /> Refresh KOT Queue
          </button>
        </div>
      </div>

      {/* Empty State when zero active orders */}
      {kotOrders.length === 0 ? (
        <div style={{ backgroundColor: "#ffffff", padding: "64px 20px", borderRadius: "16px", border: "1px solid #e2e8f0", textAlign: "center" }}>
          <FiTv size={48} color="#94a3b8" style={{ marginBottom: "16px" }} />
          <h3 style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a", margin: "0 0 6px 0" }}>No active kitchen orders</h3>
          <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>New orders confirmed from Restaurant POS will automatically appear here on the KDS display.</p>
        </div>
      ) : (
        /* KOT Queue Columns Grid (Light Theme) */
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px", alignItems: "start" }}>
          
          {/* COLUMN 1: NEW KOTs */}
          <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", padding: "20px", border: "1px solid #e2e8f0", borderTop: "4px solid #2563eb", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", paddingBottom: "12px", borderBottom: "1px solid #f1f5f9" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "#2563eb" }}>NEW KOT ({newKOTs.length})</h3>
                <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "600" }}>Pending preparation start</span>
              </div>
              <span style={{ background: "#dbeafe", color: "#1e40af", padding: "4px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: "700" }}>NEW</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {newKOTs.length === 0 ? (
                <p style={{ color: "#94a3b8", fontSize: "13px", margin: 0, textAlign: "center", padding: "20px 0" }}>No new incoming orders.</p>
              ) : (
                newKOTs.map((kot) => (
                  <KOTCard key={kot.id} kot={kot} onAction={() => handleStartPreparing(kot.id)} actionText="Start Preparing" actionColor="#2563eb" icon={FiPlay} />
                ))
              )}
            </div>
          </div>

          {/* COLUMN 2: PREPARING KOTs */}
          <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", padding: "20px", border: "1px solid #e2e8f0", borderTop: "4px solid #f59e0b", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", paddingBottom: "12px", borderBottom: "1px solid #f1f5f9" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "#d97706" }}>PREPARING ({preparingKOTs.length})</h3>
                <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "600" }}>Cooking in kitchen</span>
              </div>
              <span style={{ background: "#fef3c7", color: "#92400e", padding: "4px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: "700" }}>COOKING</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {preparingKOTs.length === 0 ? (
                <p style={{ color: "#94a3b8", fontSize: "13px", margin: 0, textAlign: "center", padding: "20px 0" }}>No orders currently preparing.</p>
              ) : (
                preparingKOTs.map((kot) => (
                  <KOTCard key={kot.id} kot={kot} onAction={() => handleMarkReady(kot.id)} actionText="Mark Ready" actionColor="#d97706" icon={FiCheck} />
                ))
              )}
            </div>
          </div>

          {/* COLUMN 3: READY KOTs */}
          <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", padding: "20px", border: "1px solid #e2e8f0", borderTop: "4px solid #10b981", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", paddingBottom: "12px", borderBottom: "1px solid #f1f5f9" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "#059669" }}>READY TO SERVE ({readyKOTs.length})</h3>
                <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "600" }}>Plated & ready for waiter</span>
              </div>
              <span style={{ background: "#d1fae5", color: "#065f46", padding: "4px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: "700" }}>READY</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {readyKOTs.length === 0 ? (
                <p style={{ color: "#94a3b8", fontSize: "13px", margin: 0, textAlign: "center", padding: "20px 0" }}>No orders waiting to be served.</p>
              ) : (
                readyKOTs.map((kot) => (
                  <KOTCard key={kot.id} kot={kot} onAction={() => handleMarkServed(kot.id)} actionText="Serve Order" actionColor="#059669" icon={FiCheckCircle} />
                ))
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}

function KOTCard({ kot, onAction, actionText, actionColor, icon: Icon }) {
  const createdTime = kot.createdAt ? new Date(kot.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "";

  return (
    <div
      style={{
        backgroundColor: "#f8fafc",
        borderRadius: "12px",
        padding: "16px",
        border: "1px solid #e2e8f0",
        boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
      }}
    >
      {/* KOT Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", paddingBottom: "10px", borderBottom: "1px solid #e2e8f0" }}>
        <div>
          <span style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a" }}>{kot.kotNumber}</span>
          <div style={{ fontSize: "13px", fontWeight: "700", color: "#2563eb", marginTop: "2px" }}>
            {kot.tableNumber ? `Table ${kot.tableNumber}` : `(${kot.orderType})`}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#64748b", fontWeight: "600" }}>
          <FiClock size={14} />
          <span>{createdTime}</span>
        </div>
      </div>

      {/* Items List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
        {kot.items?.map((i) => (
          <div key={i.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#ffffff", padding: "6px 10px", borderRadius: "6px", border: "1px solid #f1f5f9" }}>
            <span style={{ fontSize: "14px", fontWeight: "700", color: "#0f172a" }}>
              {i.quantity}x {i.menuItem?.name || "Dish"}
            </span>
          </div>
        ))}
      </div>

      {/* Special Kitchen Notes */}
      {kot.notes && (
        <div style={{ backgroundColor: "#fef3c7", border: "1px solid #fde68a", padding: "8px 12px", borderRadius: "6px", fontSize: "12px", color: "#92400e", fontWeight: "600", marginBottom: "16px" }}>
          Note: {kot.notes}
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={onAction}
        style={{
          width: "100%",
          padding: "10px",
          backgroundColor: actionColor,
          color: "#ffffff",
          border: "none",
          borderRadius: "8px",
          fontWeight: "800",
          fontSize: "13px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          boxShadow: `0 4px 6px -1px ${actionColor}33`,
        }}
      >
        <Icon size={16} />
        <span>{actionText}</span>
      </button>
    </div>
  );
}
