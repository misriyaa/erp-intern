"use client";

import { useState, useEffect } from "react";
import { restaurantService } from "@/services/restaurantService";
import { FiBarChart2, FiDollarSign, FiCoffee, FiShoppingBag, FiTruck } from "react-icons/fi";

export default function RestaurantReportsPage() {
  const [loading, setLoading] = useState(true);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState("");
  const [orders, setOrders] = useState([]);
  const [foodCostData, setFoodCostData] = useState([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedRestaurantId) {
      fetchReportData();
    }
  }, [selectedRestaurantId]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const res = await restaurantService.getRestaurants();
      const list = res.data || [];
      setRestaurants(list);
      if (list.length > 0) setSelectedRestaurantId(list[0].id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReportData = async () => {
    try {
      const [orderRes, costRes] = await Promise.all([
        restaurantService.getOrders({ restaurantId: selectedRestaurantId }),
        restaurantService.getFoodCostReport(selectedRestaurantId),
      ]);
      setOrders(orderRes.data || []);
      setFoodCostData(costRes.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const completedOrders = orders.filter((o) => o.status === "COMPLETED");
  const totalSales = completedOrders.reduce((sum, o) => sum + (parseFloat(o.totalAmount) || 0), 0);

  const dineInSales = completedOrders.filter((o) => o.orderType === "DINE_IN").reduce((sum, o) => sum + (parseFloat(o.totalAmount) || 0), 0);
  const takeawaySales = completedOrders.filter((o) => o.orderType === "TAKEAWAY").reduce((sum, o) => sum + (parseFloat(o.totalAmount) || 0), 0);
  const deliverySales = completedOrders.filter((o) => o.orderType === "DELIVERY").reduce((sum, o) => sum + (parseFloat(o.totalAmount) || 0), 0);

  if (loading) {
    return <div style={{ padding: "32px", textAlign: "center", color: "#64748b" }}>Loading Restaurant Reports...</div>;
  }

  return (
    <div style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#0f172a", margin: 0 }}>Restaurant Reports & Analytics</h1>
          <p style={{ color: "#64748b", margin: "4px 0 0 0" }}>Comprehensive financial & operational performance reports.</p>
        </div>

        {restaurants.length > 0 && (
          <select
            value={selectedRestaurantId}
            onChange={(e) => setSelectedRestaurantId(e.target.value)}
            style={{ padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontWeight: "600" }}
          >
            {restaurants.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", marginBottom: "28px" }}>
        <div style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", borderLeft: "4px solid #10b981" }}>
          <div style={{ color: "#64748b", fontSize: "13px", fontWeight: "600" }}>Total Sales</div>
          <div style={{ fontSize: "26px", fontWeight: "800", color: "#0f172a", marginTop: "8px" }}>₹{totalSales.toFixed(2)}</div>
        </div>

        <div style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", borderLeft: "4px solid #2563eb" }}>
          <div style={{ color: "#64748b", fontSize: "13px", fontWeight: "600" }}>Dine-In Sales</div>
          <div style={{ fontSize: "26px", fontWeight: "800", color: "#2563eb", marginTop: "8px" }}>₹{dineInSales.toFixed(2)}</div>
        </div>

        <div style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", borderLeft: "4px solid #f59e0b" }}>
          <div style={{ color: "#64748b", fontSize: "13px", fontWeight: "600" }}>Takeaway Sales</div>
          <div style={{ fontSize: "26px", fontWeight: "800", color: "#f59e0b", marginTop: "8px" }}>₹{takeawaySales.toFixed(2)}</div>
        </div>

        <div style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", borderLeft: "4px solid #8b5cf6" }}>
          <div style={{ color: "#64748b", fontSize: "13px", fontWeight: "600" }}>Delivery Sales</div>
          <div style={{ fontSize: "26px", fontWeight: "800", color: "#8b5cf6", marginTop: "8px" }}>₹{deliverySales.toFixed(2)}</div>
        </div>
      </div>
    </div>
  );
}
