"use client";

import { useState, useEffect } from "react";
import { restaurantService } from "@/services/restaurantService";
import { FiTv, FiClock, FiCheck, FiPlay, FiRefreshCw, FiCheckCircle } from "react-icons/fi";

export default function KitchenDisplayPage() {
  const [loading, setLoading] = useState(true);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState("");
  const [kotOrders, setKotOrders] = useState([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedRestaurantId) {
      fetchKOTs();
      const interval = setInterval(fetchKOTs, 10000); // Auto refresh every 10 seconds
      return () => clearInterval(interval);
    }
  }, [selectedRestaurantId]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const res = await restaurantService.getRestaurants();
      const list = res.data || [];
      setRestaurants(list);
      if (list.length > 0) {
        setSelectedRestaurantId(list[0].id);
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
    } catch (err) { alert(err.message); }
  };

  const handleMarkReady = async (id) => {
    try {
      await restaurantService.markReady(id);
      fetchKOTs();
    } catch (err) { alert(err.message); }
  };

  const handleMarkServed = async (id) => {
    try {
      await restaurantService.markServed(id);
      fetchKOTs();
    } catch (err) { alert(err.message); }
  };

  const newKOTs = kotOrders.filter((k) => k.status === "NEW");
  const preparingKOTs = kotOrders.filter((k) => k.status === "PREPARING");
  const readyKOTs = kotOrders.filter((k) => k.status === "READY");

  if (loading) {
    return <div style={{ padding: "32px", textAlign: "center", color: "#64748b" }}>Loading Kitchen Display System...</div>;
  }

  return (
    <div style={{ padding: "24px", maxWidth: "1600px", margin: "0 auto", backgroundColor: "#0f172a", minHeight: "100vh", color: "#fff" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <FiTv size={28} color="#10b981" />
          <div>
            <h1 style={{ fontSize: "26px", fontWeight: "800", margin: 0, color: "#f8fafc" }}>Kitchen Display System (KDS)</h1>
            <p style={{ color: "#94a3b8", margin: "2px 0 0 0", fontSize: "13px" }}>Live KOT order queue & preparation management.</p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {restaurants.length > 0 && (
            <select
              value={selectedRestaurantId}
              onChange={(e) => setSelectedRestaurantId(e.target.value)}
              style={{
                padding: "10px 14px",
                borderRadius: "8px",
                border: "1px solid #334155",
                backgroundColor: "#1e293b",
                color: "#fff",
                fontWeight: "600",
              }}
            >
              {restaurants.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          )}

          <button
            onClick={fetchKOTs}
            style={{
              padding: "10px 16px",
              backgroundColor: "#1e293b",
              border: "1px solid #334155",
              color: "#f8fafc",
              borderRadius: "8px",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <FiRefreshCw /> Refresh
          </button>
        </div>
      </div>

      {/* Columns Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px", alignItems: "start" }}>
        {/* COLUMN 1: NEW KOTs */}
        <div style={{ backgroundColor: "#1e293b", borderRadius: "12px", padding: "16px", borderTop: "4px solid #3b82f6" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: "#60a5fa" }}>NEW KOT ({newKOTs.length})</h3>
            <span style={{ fontSize: "12px", color: "#94a3b8" }}>Pending Start</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {newKOTs.map((kot) => (
              <KOTCard key={kot.id} kot={kot} onAction={() => handleStartPreparing(kot.id)} actionText="[START PREPARING]" actionColor="#3b82f6" icon={FiPlay} />
            ))}
          </div>
        </div>

        {/* COLUMN 2: PREPARING KOTs */}
        <div style={{ backgroundColor: "#1e293b", borderRadius: "12px", padding: "16px", borderTop: "4px solid #f59e0b" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: "#fbbf24" }}>PREPARING ({preparingKOTs.length})</h3>
            <span style={{ fontSize: "12px", color: "#94a3b8" }}>In Cooking</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {preparingKOTs.map((kot) => (
              <KOTCard key={kot.id} kot={kot} onAction={() => handleMarkReady(kot.id)} actionText="[MARK READY]" actionColor="#f59e0b" icon={FiCheck} />
            ))}
          </div>
        </div>

        {/* COLUMN 3: READY KOTs */}
        <div style={{ backgroundColor: "#1e293b", borderRadius: "12px", padding: "16px", borderTop: "4px solid #10b981" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: "#34d399" }}>READY TO SERVE ({readyKOTs.length})</h3>
            <span style={{ fontSize: "12px", color: "#94a3b8" }}>Pass to Waiter</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {readyKOTs.map((kot) => (
              <KOTCard key={kot.id} kot={kot} onAction={() => handleMarkServed(kot.id)} actionText="[SERVE ORDER]" actionColor="#10b981" icon={FiCheckCircle} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function KOTCard({ kot, onAction, actionText, actionColor, icon: Icon }) {
  const createdTime = kot.createdAt ? new Date(kot.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "";

  return (
    <div
      style={{
        backgroundColor: "#0f172a",
        borderRadius: "10px",
        padding: "16px",
        border: "1px solid #334155",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.3)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", paddingBottom: "8px", borderBottom: "1px solid #1e293b" }}>
        <div>
          <span style={{ fontSize: "18px", fontWeight: "800", color: "#f8fafc" }}>{kot.kotNumber}</span>
          <div style={{ fontSize: "13px", fontWeight: "700", color: "#60a5fa", marginTop: "2px" }}>
            {kot.tableNumber ? `Table ${kot.tableNumber}` : `(${kot.orderType})`}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#94a3b8" }}>
          <FiClock size={14} />
          <span>{createdTime}</span>
        </div>
      </div>

      {/* Items List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
        {kot.items?.map((i) => (
          <div key={i.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <span style={{ fontSize: "15px", fontWeight: "700", color: "#f1f5f9" }}>
              {i.quantity}x {i.menuItem?.name || "Dish"}
            </span>
          </div>
        ))}
      </div>

      {kot.notes && (
        <div style={{ backgroundColor: "#1e293b", padding: "8px 12px", borderRadius: "6px", fontSize: "12px", color: "#fbbf24", marginBottom: "16px" }}>
          Note: {kot.notes}
        </div>
      )}

      <button
        onClick={onAction}
        style={{
          width: "100%",
          padding: "12px",
          backgroundColor: actionColor,
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          fontWeight: "800",
          fontSize: "14px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
        }}
      >
        <Icon size={18} />
        <span>{actionText}</span>
      </button>
    </div>
  );
}
