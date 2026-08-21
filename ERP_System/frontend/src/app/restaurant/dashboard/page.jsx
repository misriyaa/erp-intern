"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { restaurantService } from "@/services/restaurantService";
import {
  FiCoffee,
  FiShoppingCart,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiDollarSign,
  FiCalendar,
  FiTrash2,
  FiTrendingUp,
  FiTv,
  FiMonitor,
} from "react-icons/fi";

export default function RestaurantDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState("");
  const [tables, setTables] = useState([]);
  const [orders, setOrders] = useState([]);
  const [kitchenOrders, setKitchenOrders] = useState([]);
  const [wastages, setWastages] = useState([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedRestaurantId) {
      fetchRestaurantMetrics(selectedRestaurantId);
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
      console.error("Failed to load restaurants:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRestaurantMetrics = async (restaurantId) => {
    try {
      const [tableRes, orderRes, kotRes, wasteRes] = await Promise.all([
        restaurantService.getTables(restaurantId),
        restaurantService.getOrders({ restaurantId }),
        restaurantService.getKitchenOrders(restaurantId),
        restaurantService.getWastages(restaurantId),
      ]);
      setTables(tableRes.data || []);
      setOrders(orderRes.data || []);
      setKitchenOrders(kotRes.data || []);
      setWastages(wasteRes.data || []);
    } catch (err) {
      console.error("Error fetching metrics:", err);
    }
  };

  // Metrics Calculations
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayOrders = orders.filter(
    (o) => o.createdAt && o.createdAt.slice(0, 10) === todayStr
  );
  const todaySales = todayOrders
    .filter((o) => o.status === "COMPLETED")
    .reduce((sum, o) => sum + (parseFloat(o.totalAmount) || 0), 0);

  const availableTables = tables.filter((t) => t.status === "AVAILABLE").length;
  const occupiedTables = tables.filter((t) => t.status === "OCCUPIED").length;
  const reservedTables = tables.filter((t) => t.status === "RESERVED").length;

  const pendingKOT = kitchenOrders.filter((k) => k.status === "NEW").length;
  const preparingKOT = kitchenOrders.filter((k) => k.status === "PREPARING").length;
  const readyKOT = kitchenOrders.filter((k) => k.status === "READY").length;

  const todayWastageCost = wastages
    .filter((w) => w.createdAt && w.createdAt.slice(0, 10) === todayStr)
    .reduce((sum, w) => sum + (parseFloat(w.totalCost) || 0), 0);

  if (loading) {
    return (
      <div style={{ padding: "32px", textAlign: "center", color: "#64748b" }}>
        Loading Restaurant Dashboard...
      </div>
    );
  }

  return (
    <div style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto" }}>
      {/* Header Bar */}
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
          <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#0f172a", margin: 0 }}>
            Restaurant Operations Dashboard
          </h1>
          <p style={{ color: "#64748b", margin: "4px 0 0 0" }}>
            Real-time management for tables, kitchen orders, sales & wastage.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {restaurants.length > 1 && (
            <select
              value={selectedRestaurantId}
              onChange={(e) => setSelectedRestaurantId(e.target.value)}
              style={{
                padding: "10px 14px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                backgroundColor: "#fff",
                fontWeight: "600",
                color: "#1e293b",
              }}
            >
              {restaurants.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          )}

          <Link
            href="/restaurant/pos"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 18px",
              backgroundColor: "#2563eb",
              color: "#fff",
              borderRadius: "8px",
              fontWeight: "600",
              textDecoration: "none",
              boxShadow: "0 4px 6px -1px rgba(37, 99, 235, 0.2)",
            }}
          >
            <FiMonitor size={18} />
            <span>Open Restaurant POS</span>
          </Link>

          <Link
            href="/restaurant/kitchen"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 18px",
              backgroundColor: "#059669",
              color: "#fff",
              borderRadius: "8px",
              fontWeight: "600",
              textDecoration: "none",
            }}
          >
            <FiTv size={18} />
            <span>Kitchen KDS Screen</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "20px",
          marginBottom: "28px",
        }}
      >
        <div
          style={{
            backgroundColor: "#fff",
            padding: "20px",
            borderRadius: "12px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            borderLeft: "4px solid #10b981",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "#64748b", fontSize: "14px", fontWeight: "600" }}>Today's Sales</span>
            <FiDollarSign size={20} color="#10b981" />
          </div>
          <div style={{ fontSize: "28px", fontWeight: "700", color: "#0f172a", marginTop: "8px" }}>
            ₹{todaySales.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>
            {todayOrders.length} orders total today
          </div>
        </div>

        <div
          style={{
            backgroundColor: "#fff",
            padding: "20px",
            borderRadius: "12px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            borderLeft: "4px solid #3b82f6",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "#64748b", fontSize: "14px", fontWeight: "600" }}>Live Tables</span>
            <FiCoffee size={20} color="#3b82f6" />
          </div>
          <div style={{ fontSize: "28px", fontWeight: "700", color: "#0f172a", marginTop: "8px" }}>
            {occupiedTables} / {tables.length} Occupied
          </div>
          <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>
            {availableTables} Available | {reservedTables} Reserved
          </div>
        </div>

        <div
          style={{
            backgroundColor: "#fff",
            padding: "20px",
            borderRadius: "12px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            borderLeft: "4px solid #f59e0b",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "#64748b", fontSize: "14px", fontWeight: "600" }}>Kitchen KOT Status</span>
            <FiClock size={20} color="#f59e0b" />
          </div>
          <div style={{ fontSize: "28px", fontWeight: "700", color: "#0f172a", marginTop: "8px" }}>
            {pendingKOT + preparingKOT} Active KOT
          </div>
          <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>
            {pendingKOT} New | {preparingKOT} Preparing | {readyKOT} Ready
          </div>
        </div>

        <div
          style={{
            backgroundColor: "#fff",
            padding: "20px",
            borderRadius: "12px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            borderLeft: "4px solid #ef4444",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "#64748b", fontSize: "14px", fontWeight: "600" }}>Today's Wastage</span>
            <FiTrash2 size={20} color="#ef4444" />
          </div>
          <div style={{ fontSize: "28px", fontWeight: "700", color: "#0f172a", marginTop: "8px" }}>
            ₹{todayWastageCost.toFixed(2)}
          </div>
          <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>
            Total food & ingredient waste cost
          </div>
        </div>
      </div>

      {/* Main Content Sections */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        {/* Table Overview Card */}
        <div style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#0f172a", margin: 0 }}>
              Live Table Floor Plan
            </h3>
            <Link href="/restaurant/tables" style={{ color: "#2563eb", fontWeight: "600", fontSize: "14px", textDecoration: "none" }}>
              View All Tables →
            </Link>
          </div>

          {tables.length === 0 ? (
            <p style={{ color: "#94a3b8", textAlign: "center", padding: "24px" }}>No tables found. Add tables in settings.</p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: "12px" }}>
              {tables.slice(0, 8).map((tbl) => {
                const isOccupied = tbl.status === "OCCUPIED";
                const isReserved = tbl.status === "RESERVED";
                const isAvailable = tbl.status === "AVAILABLE";

                const bg = isOccupied ? "#fef2f2" : isReserved ? "#eff6ff" : isAvailable ? "#f0fdf4" : "#f8fafc";
                const borderColor = isOccupied ? "#ef4444" : isReserved ? "#3b82f6" : isAvailable ? "#22c55e" : "#cbd5e1";
                const textColor = isOccupied ? "#991b1b" : isReserved ? "#1e40af" : isAvailable ? "#166534" : "#475569";

                return (
                  <div
                    key={tbl.id}
                    style={{
                      backgroundColor: bg,
                      border: `2px solid ${borderColor}`,
                      borderRadius: "10px",
                      padding: "12px",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: "14px", fontWeight: "700", color: textColor }}>{tbl.tableNumber}</div>
                    <div style={{ fontSize: "11px", color: textColor, opacity: 0.8, marginTop: "2px" }}>
                      {tbl.capacity} Seats
                    </div>
                    <div
                      style={{
                        fontSize: "10px",
                        fontWeight: "700",
                        color: textColor,
                        marginTop: "6px",
                        textTransform: "uppercase",
                      }}
                    >
                      {tbl.status}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Live KOT Queue */}
        <div style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#0f172a", margin: 0 }}>
              Recent Kitchen KOTs
            </h3>
            <Link href="/restaurant/kitchen" style={{ color: "#059669", fontWeight: "600", fontSize: "14px", textDecoration: "none" }}>
              Go to KDS Screen →
            </Link>
          </div>

          {kitchenOrders.length === 0 ? (
            <p style={{ color: "#94a3b8", textAlign: "center", padding: "24px" }}>No active kitchen orders right now.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {kitchenOrders.slice(0, 5).map((kot) => (
                <div
                  key={kot.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 16px",
                    backgroundColor: "#f8fafc",
                    borderRadius: "8px",
                    borderLeft: `4px solid ${
                      kot.status === "NEW" ? "#3b82f6" : kot.status === "PREPARING" ? "#f59e0b" : "#10b981"
                    }`,
                  }}
                >
                  <div>
                    <div style={{ fontWeight: "700", color: "#0f172a", fontSize: "14px" }}>
                      {kot.kotNumber} {kot.tableNumber ? `(Table ${kot.tableNumber})` : `(${kot.orderType})`}
                    </div>
                    <div style={{ fontSize: "12px", color: "#64748b" }}>
                      {kot.items?.map((i) => `${i.quantity}x ${i.menuItem?.name || "Item"}`).join(", ")}
                    </div>
                  </div>
                  <span
                    style={{
                      padding: "4px 10px",
                      borderRadius: "12px",
                      fontSize: "11px",
                      fontWeight: "700",
                      backgroundColor:
                        kot.status === "NEW"
                          ? "#dbeafe"
                          : kot.status === "PREPARING"
                          ? "#fef3c7"
                          : "#d1fae5",
                      color:
                        kot.status === "NEW"
                          ? "#1e40af"
                          : kot.status === "PREPARING"
                          ? "#92400e"
                          : "#065f46",
                    }}
                  >
                    {kot.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
