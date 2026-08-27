"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import apiClient from "@/services/apiClient";
import { restaurantService } from "@/services/restaurantService";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
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
  FiUsers,
  FiPackage,
  FiPieChart,
  FiBarChart2,
  FiBox,
  FiCheckSquare,
  FiXCircle,
  FiArrowRight,
  FiLayers,
  FiActivity,
  FiFileText,
  FiRefreshCw,
  FiPlus,
  FiMapPin,
  FiCreditCard,
  FiPercent,
  FiTrendingDown,
  FiTruck,
  FiGrid,
  FiFilter,
} from "react-icons/fi";

const PIE_COLORS = ["#2563eb", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4"];

export default function SingleRestaurantDashboard() {
  const router = useRouter();

  // Loading & Filter States
  const [loading, setLoading] = useState(true);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedOutletId, setSelectedOutletId] = useState("ALL"); // ALL or restaurantId
  const [dateFilter, setDateFilter] = useState("TODAY"); // TODAY, YESTERDAY, WEEK, MONTH, CUSTOM
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [salesChartView, setSalesChartView] = useState("DAILY"); // DAILY, WEEKLY, MONTHLY

  // Raw Database Data States
  const [tables, setTables] = useState([]);
  const [orders, setOrders] = useState([]);
  const [kitchenOrders, setKitchenOrders] = useState([]);
  const [wastages, setWastages] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [products, setProducts] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [customersCount, setCustomersCount] = useState(0);
  const [foodCostReport, setFoodCostReport] = useState([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchDashboardMetrics();
  }, [selectedOutletId]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const res = await restaurantService.getRestaurants();
      const list = res.data || [];
      setRestaurants(list);
    } catch (err) {
      console.error("Failed to load restaurants list:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardMetrics = async () => {
    try {
      setLoading(true);
      const targetOutletId = selectedOutletId === "ALL" ? "" : selectedOutletId;

      const results = await Promise.allSettled([
        restaurantService.getTables(targetOutletId),
        restaurantService.getOrders({ restaurantId: targetOutletId }),
        restaurantService.getKitchenOrders(targetOutletId),
        restaurantService.getWastages(targetOutletId),
        restaurantService.getReservations(targetOutletId),
        restaurantService.getFoodCostReport(targetOutletId),
        restaurantService.getMenuItems(targetOutletId),
        apiClient.get("/products"),
        apiClient.get("/admin/expenses").catch(() => apiClient.get("/expenses")),
        apiClient.get("/customers"),
      ]);

      const [
        tableRes,
        orderRes,
        kotRes,
        wasteRes,
        resvRes,
        foodCostRes,
        menuItemsRes,
        productRes,
        expenseRes,
        customerRes,
      ] = results;

      if (tableRes.status === "fulfilled") setTables(tableRes.value.data || []);
      if (orderRes.status === "fulfilled") setOrders(orderRes.value.data || []);
      if (kotRes.status === "fulfilled") setKitchenOrders(kotRes.value.data || []);
      if (wasteRes.status === "fulfilled") setWastages(wasteRes.value.data || []);
      if (resvRes.status === "fulfilled") setReservations(resvRes.value.data || []);
      if (foodCostRes.status === "fulfilled") setFoodCostReport(foodCostRes.value.data || []);
      if (menuItemsRes.status === "fulfilled") setMenuItems(menuItemsRes.value.data || []);

      if (productRes.status === "fulfilled") {
        setProducts(productRes.value.data?.data || productRes.value.data || []);
      }
      if (expenseRes.status === "fulfilled") {
        setExpenses(expenseRes.value.data?.data || expenseRes.value.data || []);
      }
      if (customerRes.status === "fulfilled") {
        const custs = customerRes.value.data?.data || customerRes.value.data || [];
        setCustomersCount(Array.isArray(custs) ? custs.length : 0);
      }
    } catch (err) {
      console.error("Error fetching restaurant dashboard metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // DYNAMIC FILTERING LOGIC
  // ==========================================
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);

  const yesterdayStr = new Date(new Date().setDate(now.getDate() - 1)).toISOString().slice(0, 10);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (!o.createdAt) return false;
      const orderDateStr = new Date(o.createdAt).toISOString().slice(0, 10);
      const orderDate = new Date(o.createdAt);
      const hour = orderDate.getHours();

      // Outlet filter check
      if (selectedOutletId !== "ALL" && o.restaurantId !== selectedOutletId) {
        return false;
      }

      // Date range filter check
      if (dateFilter === "TODAY") return orderDateStr === todayStr;
      if (dateFilter === "YESTERDAY") return orderDateStr === yesterdayStr;
      if (dateFilter === "WEEK") {
        const weekAgo = new Date(new Date().setDate(now.getDate() - 7));
        return orderDate >= weekAgo;
      }
      if (dateFilter === "MONTH") {
        const monthAgo = new Date(new Date().setMonth(now.getMonth() - 1));
        return orderDate >= monthAgo;
      }
      if (dateFilter === "CUSTOM") {
        if (customStartDate && orderDateStr < customStartDate) return false;
        if (customEndDate && orderDateStr > customEndDate) return false;
      }
      return true;
    });
  }, [orders, selectedOutletId, dateFilter, todayStr, yesterdayStr, customStartDate, customEndDate]);

  // Previous Period Orders for Comparison
  const prevPeriodOrders = useMemo(() => {
    return orders.filter((o) => {
      if (!o.createdAt) return false;
      const orderDateStr = new Date(o.createdAt).toISOString().slice(0, 10);
      if (dateFilter === "TODAY") return orderDateStr === yesterdayStr;
      return false;
    });
  }, [orders, dateFilter, yesterdayStr]);

  // ==========================================
  // SECTION 3: TOP SUMMARY CARDS CALCULATIONS
  // ==========================================

  // 1. Total Sales & Comparison
  const totalSales = useMemo(() => {
    return filteredOrders
      .filter((o) => o.status === "COMPLETED" || o.status === "SERVED" || o.status === "DELIVERED" || o.paymentStatus === "PAID")
      .reduce((sum, o) => sum + (parseFloat(o.totalAmount) || 0), 0);
  }, [filteredOrders]);

  const prevTotalSales = useMemo(() => {
    return prevPeriodOrders
      .filter((o) => o.status === "COMPLETED" || o.status === "SERVED" || o.status === "DELIVERED" || o.paymentStatus === "PAID")
      .reduce((sum, o) => sum + (parseFloat(o.totalAmount) || 0), 0);
  }, [prevPeriodOrders]);

  const salesGrowthPct = useMemo(() => {
    if (prevTotalSales === 0) return totalSales > 0 ? "+100.0" : "0.0";
    const diff = totalSales - prevTotalSales;
    return ((diff / prevTotalSales) * 100).toFixed(1);
  }, [totalSales, prevTotalSales]);

  // 2. Total Orders (Completed & Pending)
  const totalOrdersCount = filteredOrders.length;
  const completedOrdersCount = useMemo(
    () => filteredOrders.filter((o) => o.status === "COMPLETED" || o.status === "SERVED" || o.status === "DELIVERED").length,
    [filteredOrders]
  );
  const pendingOrdersCount = useMemo(
    () => filteredOrders.filter((o) => o.status === "PENDING" || o.status === "NEW" || o.status === "CONFIRMED" || o.status === "PREPARING").length,
    [filteredOrders]
  );

  // 3. Net Sales (Gross - Discounts - Returns)
  const grossSales = useMemo(
    () => filteredOrders.reduce((sum, o) => sum + (parseFloat(o.subtotal) || parseFloat(o.totalAmount) || 0), 0),
    [filteredOrders]
  );
  const totalDiscounts = useMemo(
    () => filteredOrders.reduce((sum, o) => sum + (parseFloat(o.discountAmount) || 0), 0),
    [filteredOrders]
  );
  const totalReturns = useMemo(
    () => filteredOrders.filter((o) => o.status === "CANCELLED" || o.status === "VOID").reduce((sum, o) => sum + (parseFloat(o.totalAmount) || 0), 0),
    [filteredOrders]
  );
  const netSales = useMemo(() => Math.max(0, grossSales - totalDiscounts - totalReturns), [grossSales, totalDiscounts, totalReturns]);

  // 4. Net Profit (Revenue - Food Cost - Expenses)
  const foodCostMap = useMemo(() => {
    const map = {};
    if (Array.isArray(foodCostReport)) {
      foodCostReport.forEach((fc) => {
        if (fc.menuItemId) map[fc.menuItemId] = fc.recipeCost;
      });
    }
    return map;
  }, [foodCostReport]);

  const totalFoodCost = useMemo(() => {
    let cost = 0;
    filteredOrders.forEach((o) => {
      o.items?.forEach((it) => {
        const itemRecipeCost = foodCostMap[it.menuItemId] || parseFloat(it.menuItem?.costPrice) || parseFloat(it.costPrice) || 0;
        cost += itemRecipeCost * (it.quantity || 1);
      });
    });
    return cost;
  }, [filteredOrders, foodCostMap]);

  const totalExpensesPeriod = useMemo(() => {
    const directExpenses = Array.isArray(expenses)
      ? expenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0)
      : 0;
    const wastageCost = wastages.reduce((sum, w) => sum + (parseFloat(w.totalCost) || 0), 0);
    return directExpenses + wastageCost;
  }, [expenses, wastages]);

  const grossProfit = Math.max(0, totalSales - totalFoodCost);
  const netProfit = grossProfit - totalExpensesPeriod;

  // 5. Customers (Total, New, Returning)
  const customerStats = useMemo(() => {
    const custMap = {};
    filteredOrders.forEach((o) => {
      const cId = o.customerId || o.customerName || "Guest";
      custMap[cId] = (custMap[cId] || 0) + 1;
    });

    let newCust = 0;
    let retCust = 0;
    Object.values(custMap).forEach((cnt) => {
      if (cnt === 1) newCust++;
      else retCust++;
    });

    return {
      total: Math.max(customersCount, Object.keys(custMap).length),
      newCust,
      retCust,
    };
  }, [filteredOrders, customersCount]);

  // 6. Average Order Value (AOV)
  const averageOrderValue = totalOrdersCount > 0 ? (totalSales / totalOrdersCount).toFixed(2) : "0.00";

  // 7. Table Status
  const tableStats = useMemo(() => {
    const total = tables.length;
    const available = tables.filter((t) => t.status === "AVAILABLE").length;
    const occupied = tables.filter((t) => t.status === "OCCUPIED").length;
    const reserved = tables.filter((t) => t.status === "RESERVED").length;
    const cleaning = tables.filter((t) => t.status === "CLEANING" || t.status === "DIRTY").length;
    const maintenance = tables.filter((t) => t.status === "MAINTENANCE").length;
    return { total, available, occupied, reserved, cleaning, maintenance };
  }, [tables]);

  // 8. Low Stock
  const lowStockIngredientsCount = useMemo(() => {
    return Array.isArray(products)
      ? products.filter((p) => {
          const qty = p.stock ?? p.quantity ?? 0;
          const min = p.minStockThreshold ?? p.minStock ?? 5;
          return qty <= min;
        }).length
      : 0;
  }, [products]);

  // ==========================================
  // SECTION 4: LIVE ORDER STATUS (7 CARDS)
  // ==========================================
  const liveOrderCounts = useMemo(() => {
    return {
      newOrders: orders.filter((o) => o.status === "NEW" || o.status === "PENDING").length,
      confirmedOrders: orders.filter((o) => o.status === "CONFIRMED" || o.status === "ACCEPTED").length,
      preparing: orders.filter((o) => o.status === "PREPARING" || o.status === "COOKING").length,
      ready: orders.filter((o) => o.status === "READY" || o.status === "PLATED").length,
      served: orders.filter((o) => o.status === "SERVED").length,
      completed: orders.filter((o) => o.status === "COMPLETED" || o.status === "DELIVERED").length,
      cancelled: orders.filter((o) => o.status === "CANCELLED" || o.status === "VOID").length,
    };
  }, [orders]);

  // ==========================================
  // SECTION 8: KITCHEN KDS & DELAYED ORDERS
  // ==========================================
  const delayedOrdersList = useMemo(() => {
    const delayed = [];
    kitchenOrders.forEach((k) => {
      if (k.status === "PREPARING" || k.status === "NEW") {
        const orderTime = new Date(k.createdAt || Date.now());
        const elapsedMins = Math.floor((Date.now() - orderTime.getTime()) / (1000 * 60));
        const expectedMins = k.expectedTime || 20; // 20 mins threshold
        if (elapsedMins >= expectedMins) {
          delayed.push({
            id: k.id,
            kotNumber: k.kotNumber || k.orderNumber || "KOT-OLD",
            tableNumber: k.tableNumber || "N/A",
            orderType: k.orderType || "DINE_IN",
            orderTime: orderTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            waitingTime: `${elapsedMins} mins`,
            status: k.status,
          });
        }
      }
    });
    return delayed;
  }, [kitchenOrders]);

  // ==========================================
  // SECTION 5: SALES OVERVIEW CHART DATA
  // ==========================================
  const salesOverviewChartData = useMemo(() => {
    if (salesChartView === "DAILY") {
      const hoursSlots = ["08 AM", "10 AM", "12 PM", "02 PM", "04 PM", "06 PM", "08 PM", "10 PM"];
      const map = {};
      hoursSlots.forEach((h) => (map[h] = { gross: 0, discount: 0, tax: 0, net: 0 }));

      filteredOrders.forEach((o) => {
        if (o.createdAt) {
          const hour = new Date(o.createdAt).getHours();
          let slot = "08 AM";
          if (hour >= 10 && hour < 12) slot = "10 AM";
          else if (hour >= 12 && hour < 14) slot = "12 PM";
          else if (hour >= 14 && hour < 16) slot = "02 PM";
          else if (hour >= 16 && hour < 18) slot = "04 PM";
          else if (hour >= 18 && hour < 20) slot = "06 PM";
          else if (hour >= 20 && hour < 22) slot = "08 PM";
          else if (hour >= 22) slot = "10 PM";

          const sub = parseFloat(o.subtotal) || parseFloat(o.totalAmount) || 0;
          const disc = parseFloat(o.discountAmount) || 0;
          const tx = parseFloat(o.taxAmount) || 0;
          const net = sub - disc;

          map[slot].gross += sub;
          map[slot].discount += disc;
          map[slot].tax += tx;
          map[slot].net += net;
        }
      });

      return hoursSlots.map((h) => ({
        label: h,
        GrossSales: map[h].gross,
        Discounts: map[h].discount,
        Tax: map[h].tax,
        NetSales: map[h].net,
      }));
    } else if (salesChartView === "WEEKLY") {
      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      const map = {};
      days.forEach((d) => (map[d] = { gross: 0, discount: 0, tax: 0, net: 0 }));

      filteredOrders.forEach((o) => {
        if (o.createdAt) {
          let idx = new Date(o.createdAt).getDay() - 1;
          if (idx < 0) idx = 6;
          const dName = days[idx];

          const sub = parseFloat(o.subtotal) || parseFloat(o.totalAmount) || 0;
          const disc = parseFloat(o.discountAmount) || 0;
          const tx = parseFloat(o.taxAmount) || 0;
          const net = sub - disc;

          map[dName].gross += sub;
          map[dName].discount += disc;
          map[dName].tax += tx;
          map[dName].net += net;
        }
      });

      return days.map((d) => ({
        label: d,
        GrossSales: map[d].gross,
        Discounts: map[d].discount,
        Tax: map[d].tax,
        NetSales: map[d].net,
      }));
    } else {
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const map = {};
      months.forEach((m) => (map[m] = { gross: 0, discount: 0, tax: 0, net: 0 }));

      filteredOrders.forEach((o) => {
        if (o.createdAt) {
          const mIdx = new Date(o.createdAt).getMonth();
          const mName = months[mIdx];

          const sub = parseFloat(o.subtotal) || parseFloat(o.totalAmount) || 0;
          const disc = parseFloat(o.discountAmount) || 0;
          const tx = parseFloat(o.taxAmount) || 0;
          const net = sub - disc;

          map[mName].gross += sub;
          map[mName].discount += disc;
          map[mName].tax += tx;
          map[mName].net += net;
        }
      });

      return months.map((m) => ({
        label: m,
        GrossSales: map[m].gross,
        Discounts: map[m].discount,
        Tax: map[m].tax,
        NetSales: map[m].net,
      }));
    }
  }, [filteredOrders, salesChartView]);

  // ==========================================
  // SECTION 6: ORDER TYPE SUMMARY
  // ==========================================
  const orderTypeSummary = useMemo(() => {
    const map = {
      DINE_IN: { name: "Dine In", count: 0, sales: 0, color: "#2563eb" },
      TAKEAWAY: { name: "Takeaway", count: 0, sales: 0, color: "#10b981" },
      DELIVERY: { name: "Delivery", count: 0, sales: 0, color: "#f59e0b" },
      ONLINE: { name: "Online Orders", count: 0, sales: 0, color: "#8b5cf6" },
    };

    filteredOrders.forEach((o) => {
      const type = (o.orderType || "DINE_IN").toUpperCase();
      const targetKey = map[type] ? type : "DINE_IN";
      const amt = parseFloat(o.totalAmount) || 0;
      map[targetKey].count += 1;
      map[targetKey].sales += amt;
    });

    const grandSales = totalSales || 1;
    return Object.values(map).map((item) => ({
      ...item,
      pct: ((item.sales / grandSales) * 100).toFixed(1),
    }));
  }, [filteredOrders, totalSales]);

  // ==========================================
  // SECTION 9: TOP SELLING MENU ITEMS
  // ==========================================
  const topSellingItemsList = useMemo(() => {
    const map = {};
    filteredOrders.forEach((o) => {
      o.items?.forEach((it) => {
        const name = it.menuItem?.name || it.name || "Menu Dish";
        const cat = it.menuItem?.category?.name || "Main Course";
        const qty = it.quantity || 1;
        const total = parseFloat(it.total) || parseFloat(it.unitPrice || 0) * qty;

        if (!map[name]) {
          map[name] = { name, category: cat, qty: 0, sales: 0 };
        }
        map[name].qty += qty;
        map[name].sales += total;
      });
    });

    const list = Object.values(map);
    list.sort((a, b) => b.qty - a.qty);
    return list.slice(0, 5).map((item, idx) => ({ ...item, rank: idx + 1 }));
  }, [filteredOrders]);

  // ==========================================
  // SECTION 10: LOW STOCK ALERTS
  // ==========================================
  const lowStockAlertsList = useMemo(() => {
    if (!Array.isArray(products)) return [];
    return products
      .filter((p) => {
        const qty = p.stock ?? p.quantity ?? 0;
        const min = p.minStockThreshold ?? p.minStock ?? 5;
        return qty <= min;
      })
      .map((p) => {
        const qty = p.stock ?? p.quantity ?? 0;
        const min = p.minStockThreshold ?? p.minStock ?? 5;
        let status = "Low Stock";
        if (qty === 0) status = "Out of Stock";
        else if (qty <= min / 2) status = "Critical";

        return {
          id: p.id,
          name: p.name,
          code: p.sku || p.code || "ING-01",
          stock: qty,
          minStock: min,
          reorderLevel: min * 2,
          unit: p.unit?.code || p.stockUnit || "Unit",
          status,
        };
      })
      .slice(0, 6);
  }, [products]);

  // ==========================================
  // SECTION 13: PAYMENT SUMMARY
  // ==========================================
  const paymentSummaryData = useMemo(() => {
    const methods = {
      Cash: { count: 0, amount: 0 },
      Card: { count: 0, amount: 0 },
      UPI: { count: 0, amount: 0 },
      "Online Payment": { count: 0, amount: 0 },
      "Bank Transfer": { count: 0, amount: 0 },
      "Split Payment": { count: 0, amount: 0 },
    };

    let totalPaid = 0;
    let pendingPayments = 0;

    filteredOrders.forEach((o) => {
      const amt = parseFloat(o.totalAmount) || 0;
      const m = (o.paymentMethod || o.paymentMode || "CASH").toUpperCase();

      if (o.paymentStatus === "PAID" || o.status === "COMPLETED") {
        totalPaid += amt;
      } else {
        pendingPayments += amt;
      }

      if (m.includes("CARD")) {
        methods.Card.count++;
        methods.Card.amount += amt;
      } else if (m.includes("UPI")) {
        methods.UPI.count++;
        methods.UPI.amount += amt;
      } else if (m.includes("ONLINE")) {
        methods["Online Payment"].count++;
        methods["Online Payment"].amount += amt;
      } else if (m.includes("BANK")) {
        methods["Bank Transfer"].count++;
        methods["Bank Transfer"].amount += amt;
      } else if (m.includes("SPLIT")) {
        methods["Split Payment"].count++;
        methods["Split Payment"].amount += amt;
      } else {
        methods.Cash.count++;
        methods.Cash.amount += amt;
      }
    });

    return { methods, totalPaid, pendingPayments, refunded: totalReturns };
  }, [filteredOrders, totalReturns]);

  // ==========================================
  // SECTION 15: WASTAGE SUMMARY
  // ==========================================
  const wastageSummaryData = useMemo(() => {
    const totalEntries = wastages.length;
    const totalQty = wastages.reduce((sum, w) => sum + (parseFloat(w.quantity) || 0), 0);
    const totalCost = wastages.reduce((sum, w) => sum + (parseFloat(w.totalCost) || 0), 0);

    const wasteMap = {};
    wastages.forEach((w) => {
      const name = w.product?.name || w.ingredientName || "Raw Item";
      wasteMap[name] = (wasteMap[name] || 0) + (parseFloat(w.totalCost) || 0);
    });

    let mostWasted = "None";
    let maxCost = 0;
    Object.entries(wasteMap).forEach(([name, cost]) => {
      if (cost > maxCost) {
        maxCost = cost;
        mostWasted = name;
      }
    });

    return { totalEntries, totalQty, totalCost, mostWasted, list: wastages.slice(0, 5) };
  }, [wastages]);

  if (loading) {
    return (
      <div style={{ padding: "60px", textAlign: "center", color: "#64748b", fontFamily: "Inter, sans-serif" }}>
        <FiRefreshCw className="animate-spin" size={32} style={{ marginBottom: "16px", color: "#2563eb" }} />
        <h2 style={{ fontSize: "20px", color: "#0f172a", margin: "0 0 8px 0" }}>Loading Restaurant Main Operations Dashboard...</h2>
        <p style={{ margin: 0 }}>Aggregating Outlet Data, Live Table Status, KDS Queue, and Financial Summaries...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px", maxWidth: "1550px", margin: "0 auto", fontFamily: "Inter, sans-serif", backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      
      {/* ==========================================
          SECTION 17: DASHBOARD HEADER & FILTERS
      ========================================== */}
      <div style={{ background: "#ffffff", borderRadius: "16px", padding: "20px 24px", border: "1px solid #e2e8f0", marginBottom: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 style={{ fontSize: "26px", fontWeight: "800", color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
              <FiCoffee style={{ color: "#d97706" }} /> Restaurant ERP Operations & Intelligence Dashboard
            </h1>
            <p style={{ color: "#64748b", margin: "4px 0 0 0", fontSize: "14px" }}>
              Unified Real-Time Overview of Sales, Orders, Tables, KDS Kitchen, Stock Alerts & Financial Performance.
            </p>
          </div>

          <button
            onClick={fetchDashboardMetrics}
            style={{
              padding: "9px 14px",
              background: "#ffffff",
              border: "1px solid #cbd5e1",
              borderRadius: "8px",
              color: "#475569",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <FiRefreshCw size={15} /> Refresh Operations
          </button>
        </div>

        {/* FILTERS BAR: Outlet Filter | Date Range Filter */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "20px", paddingTop: "16px", borderTop: "1px solid #f1f5f9", flexWrap: "wrap" }}>
          
          {/* Outlet Filter */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "13px", fontWeight: "700", color: "#334155" }}>Outlet:</span>
            {restaurants.length === 0 ? (
              <button
                onClick={() => router.push("/restaurant/manage")}
                style={{
                  padding: "6px 14px",
                  borderRadius: "8px",
                  backgroundColor: "#fee2e2",
                  border: "1px solid #fca5a5",
                  color: "#991b1b",
                  fontWeight: "700",
                  fontSize: "12px",
                  cursor: "pointer",
                }}
              >
                ⚠️ No restaurant outlet found (+ Create Outlet)
              </button>
            ) : (
              <select
                value={selectedOutletId}
                onChange={(e) => setSelectedOutletId(e.target.value)}
                style={{
                  padding: "8px 14px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  backgroundColor: "#ffffff",
                  fontWeight: "700",
                  color: "#1e293b",
                  fontSize: "13px",
                }}
              >
                <option value="ALL">🏢 All Outlets ({restaurants.length})</option>
                {restaurants.map((r) => (
                  <option key={r.id} value={r.id}>
                    🏬 {r.name} ({r.code || "OUTLET"})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Date Range Filter */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "13px", fontWeight: "700", color: "#334155" }}>Date Range:</span>
            <div style={{ display: "inline-flex", background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "8px", padding: "2px" }}>
              {["TODAY", "YESTERDAY", "WEEK", "MONTH", "CUSTOM"].map((df) => (
                <button
                  key={df}
                  onClick={() => setDateFilter(df)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "6px",
                    border: "none",
                    background: dateFilter === df ? "#2563eb" : "transparent",
                    color: dateFilter === df ? "#ffffff" : "#64748b",
                    fontWeight: "700",
                    fontSize: "12px",
                    cursor: "pointer",
                  }}
                >
                  {df}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Date Pickers */}
          {dateFilter === "CUSTOM" && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12px" }}
              />
              <span style={{ fontSize: "12px", color: "#64748b" }}>to</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12px" }}
              />
            </div>
          )}

        </div>
      </div>

      {/* ==========================================
          SECTION 3: TOP SUMMARY CARDS (8 CARDS)
      ========================================== */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "16px", marginBottom: "28px" }}>
        
        {/* Card 1: Total Sales */}
        <div style={{ backgroundColor: "#ffffff", borderRadius: "14px", padding: "18px", border: "1px solid #e2e8f0", borderLeft: "4px solid #10b981", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "13px", fontWeight: "700", color: "#64748b" }}>Total Sales</span>
            <div style={{ background: "#d1fae5", color: "#059669", padding: "6px", borderRadius: "8px" }}><FiDollarSign size={18} /></div>
          </div>
          <div style={{ fontSize: "24px", fontWeight: "800", color: "#0f172a", marginTop: "8px" }}>
            ₹{totalSales.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: "11px", color: parseFloat(salesGrowthPct) >= 0 ? "#16a34a" : "#dc2626", fontWeight: "700", marginTop: "4px" }}>
            {parseFloat(salesGrowthPct) >= 0 ? `↑ ${salesGrowthPct}% vs prev period` : `↓ ${salesGrowthPct}% vs prev period`}
          </div>
        </div>

        {/* Card 2: Total Orders */}
        <div style={{ backgroundColor: "#ffffff", borderRadius: "14px", padding: "18px", border: "1px solid #e2e8f0", borderLeft: "4px solid #2563eb", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "13px", fontWeight: "700", color: "#64748b" }}>Total Orders</span>
            <div style={{ background: "#dbeafe", color: "#2563eb", padding: "6px", borderRadius: "8px" }}><FiShoppingCart size={18} /></div>
          </div>
          <div style={{ fontSize: "24px", fontWeight: "800", color: "#0f172a", marginTop: "8px" }}>
            {totalOrdersCount} Orders
          </div>
          <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>
            {completedOrdersCount} Completed | {pendingOrdersCount} Pending
          </div>
        </div>

        {/* Card 3: Net Sales */}
        <div style={{ backgroundColor: "#ffffff", borderRadius: "14px", padding: "18px", border: "1px solid #e2e8f0", borderLeft: "4px solid #06b6d4", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "13px", fontWeight: "700", color: "#64748b" }}>Net Sales</span>
            <div style={{ background: "#cffaff", color: "#0891b2", padding: "6px", borderRadius: "8px" }}><FiTrendingUp size={18} /></div>
          </div>
          <div style={{ fontSize: "24px", fontWeight: "800", color: "#0f172a", marginTop: "8px" }}>
            ₹{netSales.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>
            Gross ₹{grossSales.toFixed(0)} - Disc ₹{totalDiscounts.toFixed(0)}
          </div>
        </div>

        {/* Card 4: Net Profit */}
        <div style={{ backgroundColor: "#ffffff", borderRadius: "14px", padding: "18px", border: "1px solid #e2e8f0", borderLeft: "4px solid #8b5cf6", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "13px", fontWeight: "700", color: "#64748b" }}>Net Profit</span>
            <div style={{ background: "#f3e8ff", color: "#7e22ce", padding: "6px", borderRadius: "8px" }}><FiActivity size={18} /></div>
          </div>
          <div style={{ fontSize: "24px", fontWeight: "800", color: netProfit >= 0 ? "#15803d" : "#dc2626", marginTop: "8px" }}>
            ₹{netProfit.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: "11px", color: "#7e22ce", fontWeight: "700", marginTop: "4px" }}>
            Food Cost ₹{totalFoodCost.toFixed(0)} | Exp ₹{totalExpensesPeriod.toFixed(0)}
          </div>
        </div>

        {/* Card 5: Customers */}
        <div style={{ backgroundColor: "#ffffff", borderRadius: "14px", padding: "18px", border: "1px solid #e2e8f0", borderLeft: "4px solid #f59e0b", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "13px", fontWeight: "700", color: "#64748b" }}>Customers</span>
            <div style={{ background: "#fef3c7", color: "#d97706", padding: "6px", borderRadius: "8px" }}><FiUsers size={18} /></div>
          </div>
          <div style={{ fontSize: "24px", fontWeight: "800", color: "#0f172a", marginTop: "8px" }}>
            {customerStats.total} Profiles
          </div>
          <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>
            {customerStats.newCust} New | {customerStats.retCust} Returning
          </div>
        </div>

        {/* Card 6: Average Order Value */}
        <div style={{ backgroundColor: "#ffffff", borderRadius: "14px", padding: "18px", border: "1px solid #e2e8f0", borderLeft: "4px solid #ec4899", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "13px", fontWeight: "700", color: "#64748b" }}>Avg Order Value (AOV)</span>
            <div style={{ background: "#fce7f3", color: "#db2777", padding: "6px", borderRadius: "8px" }}><FiPercent size={18} /></div>
          </div>
          <div style={{ fontSize: "24px", fontWeight: "800", color: "#0f172a", marginTop: "8px" }}>
            ₹{averageOrderValue}
          </div>
          <div style={{ fontSize: "11px", color: "#db2777", fontWeight: "700", marginTop: "4px" }}>
            Average spend per order
          </div>
        </div>

        {/* Card 7: Table Status */}
        <div style={{ backgroundColor: "#ffffff", borderRadius: "14px", padding: "18px", border: "1px solid #e2e8f0", borderLeft: "4px solid #3b82f6", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "13px", fontWeight: "700", color: "#64748b" }}>Table Status</span>
            <div style={{ background: "#dbeafe", color: "#2563eb", padding: "6px", borderRadius: "8px" }}><FiCoffee size={18} /></div>
          </div>
          <div style={{ fontSize: "24px", fontWeight: "800", color: "#0f172a", marginTop: "8px" }}>
            {tableStats.occupied} / {tableStats.total} Occupied
          </div>
          <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>
            {tableStats.available} Available | {tableStats.reserved} Reserved
          </div>
        </div>

        {/* Card 8: Low Stock */}
        <div style={{ backgroundColor: "#ffffff", borderRadius: "14px", padding: "18px", border: "1px solid #e2e8f0", borderLeft: "4px solid #ef4444", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "13px", fontWeight: "700", color: "#64748b" }}>Low Stock Ingredients</span>
            <div style={{ background: "#fee2e2", color: "#dc2626", padding: "6px", borderRadius: "8px" }}><FiAlertCircle size={18} /></div>
          </div>
          <div style={{ fontSize: "24px", fontWeight: "800", color: "#dc2626", marginTop: "8px" }}>
            {lowStockIngredientsCount} Ingredients
          </div>
          <div style={{ fontSize: "11px", color: "#dc2626", fontWeight: "700", marginTop: "4px" }}>
            Below min reorder threshold
          </div>
        </div>

      </div>

      {/* ==========================================
          SECTION 4: LIVE ORDER STATUS (7 CLICKABLE CARDS)
      ========================================== */}
      <div style={{ marginBottom: "28px" }}>
        <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
          <FiShoppingCart style={{ color: "#2563eb" }} /> Live Order Status (7 Clickable Status Cards)
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "14px" }}>
          
          <div onClick={() => router.push("/restaurant/orders?status=NEW")} style={{ backgroundColor: "#ffffff", borderRadius: "12px", padding: "16px", border: "1px solid #e2e8f0", borderLeft: "4px solid #3b82f6", cursor: "pointer" }}>
            <span style={{ fontSize: "12px", fontWeight: "700", color: "#64748b" }}>New Orders</span>
            <div style={{ fontSize: "22px", fontWeight: "800", color: "#2563eb", marginTop: "4px" }}>{liveOrderCounts.newOrders}</div>
            <span style={{ fontSize: "11px", color: "#3b82f6" }}>View New Orders →</span>
          </div>

          <div onClick={() => router.push("/restaurant/orders?status=CONFIRMED")} style={{ backgroundColor: "#ffffff", borderRadius: "12px", padding: "16px", border: "1px solid #e2e8f0", borderLeft: "4px solid #06b6d4", cursor: "pointer" }}>
            <span style={{ fontSize: "12px", fontWeight: "700", color: "#64748b" }}>Confirmed Orders</span>
            <div style={{ fontSize: "22px", fontWeight: "800", color: "#0891b2", marginTop: "4px" }}>{liveOrderCounts.confirmedOrders}</div>
            <span style={{ fontSize: "11px", color: "#0891b2" }}>View Confirmed →</span>
          </div>

          <div onClick={() => router.push("/restaurant/orders?status=PREPARING")} style={{ backgroundColor: "#ffffff", borderRadius: "12px", padding: "16px", border: "1px solid #e2e8f0", borderLeft: "4px solid #f59e0b", cursor: "pointer" }}>
            <span style={{ fontSize: "12px", fontWeight: "700", color: "#64748b" }}>Preparing</span>
            <div style={{ fontSize: "22px", fontWeight: "800", color: "#d97706", marginTop: "4px" }}>{liveOrderCounts.preparing}</div>
            <span style={{ fontSize: "11px", color: "#d97706" }}>View KDS Cooking →</span>
          </div>

          <div onClick={() => router.push("/restaurant/orders?status=READY")} style={{ backgroundColor: "#ffffff", borderRadius: "12px", padding: "16px", border: "1px solid #e2e8f0", borderLeft: "4px solid #10b981", cursor: "pointer" }}>
            <span style={{ fontSize: "12px", fontWeight: "700", color: "#64748b" }}>Ready</span>
            <div style={{ fontSize: "22px", fontWeight: "800", color: "#059669", marginTop: "4px" }}>{liveOrderCounts.ready}</div>
            <span style={{ fontSize: "11px", color: "#059669" }}>View Plated Ready →</span>
          </div>

          <div onClick={() => router.push("/restaurant/orders?status=SERVED")} style={{ backgroundColor: "#ffffff", borderRadius: "12px", padding: "16px", border: "1px solid #e2e8f0", borderLeft: "4px solid #8b5cf6", cursor: "pointer" }}>
            <span style={{ fontSize: "12px", fontWeight: "700", color: "#64748b" }}>Served</span>
            <div style={{ fontSize: "22px", fontWeight: "800", color: "#7e22ce", marginTop: "4px" }}>{liveOrderCounts.served}</div>
            <span style={{ fontSize: "11px", color: "#7e22ce" }}>View Served →</span>
          </div>

          <div onClick={() => router.push("/restaurant/orders?status=COMPLETED")} style={{ backgroundColor: "#ffffff", borderRadius: "12px", padding: "16px", border: "1px solid #e2e8f0", borderLeft: "4px solid #16a34a", cursor: "pointer" }}>
            <span style={{ fontSize: "12px", fontWeight: "700", color: "#64748b" }}>Completed</span>
            <div style={{ fontSize: "22px", fontWeight: "800", color: "#16a34a", marginTop: "4px" }}>{liveOrderCounts.completed}</div>
            <span style={{ fontSize: "11px", color: "#16a34a" }}>View History →</span>
          </div>

          <div onClick={() => router.push("/restaurant/orders?status=CANCELLED")} style={{ backgroundColor: "#ffffff", borderRadius: "12px", padding: "16px", border: "1px solid #e2e8f0", borderLeft: "4px solid #ef4444", cursor: "pointer" }}>
            <span style={{ fontSize: "12px", fontWeight: "700", color: "#64748b" }}>Cancelled</span>
            <div style={{ fontSize: "22px", fontWeight: "800", color: "#dc2626", marginTop: "4px" }}>{liveOrderCounts.cancelled}</div>
            <span style={{ fontSize: "11px", color: "#dc2626" }}>View Voided →</span>
          </div>

        </div>
      </div>

      {/* ==========================================
          ANALYTICS SECTION: SALES OVERVIEW & ORDER TYPE
      ========================================== */}
      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "20px", marginBottom: "28px" }}>
        
        {/* SECTION 5: SALES OVERVIEW CHART */}
        <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", padding: "20px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
            <div>
              <h4 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "#0f172a" }}>Sales Overview Chart</h4>
              <span style={{ fontSize: "12px", color: "#64748b" }}>Gross Sales, Discounts, Tax & Net Sales Comparison</span>
            </div>

            {/* Daily, Weekly, Monthly Toggle */}
            <div style={{ display: "inline-flex", background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "6px", padding: "2px" }}>
              {["DAILY", "WEEKLY", "MONTHLY"].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setSalesChartView(mode)}
                  style={{
                    padding: "5px 10px",
                    borderRadius: "4px",
                    border: "none",
                    background: salesChartView === mode ? "#2563eb" : "transparent",
                    color: salesChartView === mode ? "#ffffff" : "#64748b",
                    fontWeight: "700",
                    fontSize: "11px",
                    cursor: "pointer",
                  }}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div style={{ width: "100%", height: 270 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesOverviewChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <XAxis dataKey="label" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip formatter={(val) => [`₹${Number(val).toFixed(2)}`]} />
                <Legend verticalAlign="top" height={30} />
                <Bar dataKey="GrossSales" name="Gross Sales" fill="#2563eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="NetSales" name="Net Sales" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Discounts" name="Discounts" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Tax" name="Tax" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* SECTION 6: ORDER TYPE SUMMARY */}
        <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", padding: "20px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <div style={{ marginBottom: "16px" }}>
            <h4 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "#0f172a" }}>Order Type Summary</h4>
            <span style={{ fontSize: "12px", color: "#64748b" }}>Dine In vs Takeaway vs Delivery vs Online Orders</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "16px" }}>
            {orderTypeSummary.map((item) => (
              <div key={item.name} style={{ background: "#f8fafc", padding: "10px 12px", borderRadius: "8px", borderLeft: `3px solid ${item.color}` }}>
                <div style={{ fontSize: "12px", fontWeight: "700", color: "#475569" }}>{item.name}</div>
                <div style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a", marginTop: "2px" }}>₹{item.sales.toFixed(2)}</div>
                <div style={{ fontSize: "11px", color: "#64748b" }}>{item.count} orders ({item.pct}%)</div>
              </div>
            ))}
          </div>

          <div style={{ width: "100%", height: 140 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={orderTypeSummary} dataKey="sales" nameKey="name" cx="50%" cy="50%" innerRadius={35} outerRadius={60}>
                  {orderTypeSummary.map((entry, idx) => (
                    <Cell key={`cell-ot-${idx}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(val) => [`₹${Number(val).toFixed(2)}`, "Sales"]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* ==========================================
          LIVE OPERATIONS: KITCHEN KDS & TABLE STATUS & RESERVATIONS
      ========================================== */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "28px" }}>
        
        {/* SECTION 8: KITCHEN STATUS & DELAYED ORDERS */}
        <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", padding: "20px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <h4 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "#0f172a" }}>Kitchen Status (KDS)</h4>
              <span style={{ fontSize: "12px", color: "#64748b" }}>Active Kitchen Preparation Queue</span>
            </div>
            <Link href="/restaurant/kitchen" style={{ color: "#059669", fontWeight: "700", fontSize: "12px", textDecoration: "none" }}>
              Open KDS Display →
            </Link>
          </div>

          {/* KDS Status Counters */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", marginBottom: "16px" }}>
            <div style={{ background: "#eff6ff", padding: "8px", borderRadius: "8px", textAlign: "center" }}>
              <div style={{ fontSize: "11px", color: "#1e40af", fontWeight: "700" }}>New</div>
              <div style={{ fontSize: "16px", fontWeight: "800", color: "#1e40af" }}>{liveOrderCounts.newOrders}</div>
            </div>
            <div style={{ background: "#fef3c7", padding: "8px", borderRadius: "8px", textAlign: "center" }}>
              <div style={{ fontSize: "11px", color: "#92400e", fontWeight: "700" }}>Preparing</div>
              <div style={{ fontSize: "16px", fontWeight: "800", color: "#92400e" }}>{liveOrderCounts.preparing}</div>
            </div>
            <div style={{ background: "#d1fae5", padding: "8px", borderRadius: "8px", textAlign: "center" }}>
              <div style={{ fontSize: "11px", color: "#065f46", fontWeight: "700" }}>Ready</div>
              <div style={{ fontSize: "16px", fontWeight: "800", color: "#065f46" }}>{liveOrderCounts.ready}</div>
            </div>
            <div style={{ background: "#fee2e2", padding: "8px", borderRadius: "8px", textAlign: "center" }}>
              <div style={{ fontSize: "11px", color: "#991b1b", fontWeight: "700" }}>Delayed</div>
              <div style={{ fontSize: "16px", fontWeight: "800", color: "#991b1b" }}>{delayedOrdersList.length}</div>
            </div>
          </div>

          {/* Delayed Orders List */}
          <h5 style={{ margin: "0 0 8px 0", fontSize: "13px", fontWeight: "700", color: "#dc2626" }}>Delayed KOT Preparation Alerts</h5>
          {delayedOrdersList.length === 0 ? (
            <p style={{ color: "#94a3b8", fontSize: "13px", margin: 0, textAlign: "center", padding: "16px" }}>No delayed kitchen preparation orders right now. All KOTs are on time.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "180px", overflowY: "auto" }}>
              {delayedOrdersList.map((d) => (
                <div key={d.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fef2f2", border: "1px solid #fca5a5", padding: "8px 12px", borderRadius: "8px", fontSize: "12px" }}>
                  <div>
                    <strong style={{ color: "#991b1b" }}>{d.kotNumber}</strong> (Table {d.tableNumber}) - {d.orderType}
                    <div style={{ fontSize: "11px", color: "#7f1d1d" }}>Time: {d.orderTime}</div>
                  </div>
                  <span style={{ fontWeight: "800", color: "#dc2626", background: "#fee2e2", padding: "2px 8px", borderRadius: "4px" }}>
                    ⚠️ {d.waitingTime}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION 7: LIVE TABLE STATUS */}
        <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", padding: "20px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <h4 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "#0f172a" }}>Live Table Floor Plan ({tables.length} Tables)</h4>
              <span style={{ fontSize: "12px", color: "#64748b" }}>Available, Occupied, Reserved, Cleaning & Maintenance</span>
            </div>
            <Link href="/restaurant/tables" style={{ color: "#2563eb", fontWeight: "700", fontSize: "12px", textDecoration: "none" }}>
              View All Tables →
            </Link>
          </div>

          {tables.length === 0 ? (
            <p style={{ color: "#94a3b8", textAlign: "center", padding: "24px" }}>No dining tables configured yet.</p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: "10px", maxHeight: "240px", overflowY: "auto" }}>
              {tables.map((tbl) => {
                const isOccupied = tbl.status === "OCCUPIED";
                const isReserved = tbl.status === "RESERVED";
                const isAvailable = tbl.status === "AVAILABLE";
                const isCleaning = tbl.status === "CLEANING" || tbl.status === "DIRTY";

                const bg = isOccupied ? "#fef2f2" : isReserved ? "#eff6ff" : isAvailable ? "#f0fdf4" : isCleaning ? "#fffbeb" : "#f8fafc";
                const border = isOccupied ? "#ef4444" : isReserved ? "#3b82f6" : isAvailable ? "#22c55e" : isCleaning ? "#f59e0b" : "#cbd5e1";
                const text = isOccupied ? "#991b1b" : isReserved ? "#1e40af" : isAvailable ? "#166534" : isCleaning ? "#92400e" : "#475569";

                return (
                  <div
                    key={tbl.id}
                    onClick={() => router.push(`/restaurant/tables`)}
                    style={{
                      backgroundColor: bg,
                      border: `2px solid ${border}`,
                      borderRadius: "8px",
                      padding: "8px",
                      textAlign: "center",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ fontSize: "13px", fontWeight: "800", color: text }}>{tbl.tableNumber}</div>
                    <div style={{ fontSize: "10px", color: text, opacity: 0.8 }}>{tbl.capacity} Seats</div>
                    <div style={{ fontSize: "9px", fontWeight: "800", color: text, marginTop: "4px", textTransform: "uppercase" }}>
                      {tbl.status}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* ==========================================
          SECTION 12 & 9 & 10: RESERVATIONS & TOP SELLING & LOW STOCK
      ========================================== */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px", marginBottom: "28px" }}>
        
        {/* SECTION 12: TODAY'S RESERVATIONS */}
        <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", padding: "20px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <h4 style={{ margin: 0, fontSize: "15px", fontWeight: "800", color: "#0f172a" }}>Today's Reservations</h4>
            <Link href="/restaurant/reservations" style={{ color: "#8b5cf6", fontWeight: "700", fontSize: "11px", textDecoration: "none" }}>
              View All →
            </Link>
          </div>

          {reservations.length === 0 ? (
            <p style={{ color: "#94a3b8", fontSize: "12px", textAlign: "center", padding: "30px 0" }}>No table reservations for this date.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "220px", overflowY: "auto" }}>
              {reservations.slice(0, 5).map((r) => (
                <div key={r.id} style={{ background: "#f8fafc", padding: "8px 10px", borderRadius: "6px", fontSize: "12px", borderLeft: "3px solid #8b5cf6" }}>
                  <div style={{ fontWeight: "700", color: "#0f172a" }}>{r.customerName || "Guest"} ({r.guestCount || 2} Guests)</div>
                  <div style={{ fontSize: "11px", color: "#64748b" }}>Time: {r.reservationTime || "07:30 PM"} | Phone: {r.phone || "N/A"}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION 9: TOP SELLING MENU ITEMS */}
        <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", padding: "20px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <div style={{ marginBottom: "14px" }}>
            <h4 style={{ margin: 0, fontSize: "15px", fontWeight: "800", color: "#0f172a" }}>Top Selling Menu Items</h4>
            <span style={{ fontSize: "11px", color: "#64748b" }}>Highest grossing dish menu items</span>
          </div>

          {topSellingItemsList.length === 0 ? (
            <p style={{ color: "#94a3b8", fontSize: "12px", textAlign: "center", padding: "30px 0" }}>No order sales recorded yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {topSellingItemsList.map((item) => (
                <div key={item.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc", padding: "8px 10px", borderRadius: "6px", fontSize: "12px" }}>
                  <div>
                    <span style={{ fontWeight: "800", color: "#2563eb", marginRight: "6px" }}>#{item.rank}</span>
                    <span style={{ fontWeight: "700", color: "#0f172a" }}>{item.name}</span>
                  </div>
                  <div style={{ textAlign: "right", fontWeight: "700", color: "#059669" }}>
                    ₹{item.sales.toFixed(2)} ({item.qty} sold)
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION 10: LOW STOCK ALERTS */}
        <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", padding: "20px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <h4 style={{ margin: 0, fontSize: "15px", fontWeight: "800", color: "#0f172a" }}>Low Stock Ingredient Alerts</h4>
            <Link href="/purchases/add" style={{ color: "#dc2626", fontWeight: "700", fontSize: "11px", textDecoration: "none" }}>
              + PO →
            </Link>
          </div>

          {lowStockAlertsList.length === 0 ? (
            <p style={{ color: "#94a3b8", fontSize: "12px", textAlign: "center", padding: "30px 0" }}>All ingredient stock levels normal.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "220px", overflowY: "auto" }}>
              {lowStockAlertsList.map((ing) => (
                <div key={ing.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fef2f2", border: "1px solid #fee2e2", padding: "8px 10px", borderRadius: "6px", fontSize: "12px" }}>
                  <div>
                    <div style={{ fontWeight: "700", color: "#991b1b" }}>{ing.name} ({ing.code})</div>
                    <div style={{ fontSize: "10px", color: "#7f1d1d" }}>Stock: {ing.stock} {ing.unit} (Min: {ing.minStock})</div>
                  </div>
                  <span style={{ fontSize: "10px", fontWeight: "800", color: "#dc2626", background: "#fee2e2", padding: "2px 6px", borderRadius: "4px" }}>
                    {ing.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* ==========================================
          SECTION 13 & 14 & 15: FINANCIAL & WASTAGE SUMMARIES
      ========================================== */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px", marginBottom: "28px" }}>
        
        {/* SECTION 13: PAYMENT SUMMARY */}
        <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", padding: "20px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <h4 style={{ margin: "0 0 12px 0", fontSize: "15px", fontWeight: "800", color: "#0f172a" }}>Payment Summary</h4>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "12px", marginBottom: "14px" }}>
            {Object.entries(paymentSummaryData.methods).map(([mName, data]) => (
              <div key={mName} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid #f1f5f9" }}>
                <span style={{ color: "#475569" }}>{mName}</span>
                <span style={{ fontWeight: "700", color: "#0f172a" }}>₹{data.amount.toFixed(2)} ({data.count} txns)</span>
              </div>
            ))}
          </div>

          <div style={{ background: "#f8fafc", padding: "10px", borderRadius: "8px", fontSize: "11px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
            <div>Total Paid: <strong style={{ color: "#16a34a" }}>₹{paymentSummaryData.totalPaid.toFixed(2)}</strong></div>
            <div>Pending: <strong style={{ color: "#d97706" }}>₹{paymentSummaryData.pendingPayments.toFixed(2)}</strong></div>
          </div>
        </div>

        {/* SECTION 14: FOOD COST & PROFIT SUMMARY */}
        <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", padding: "20px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <h4 style={{ margin: "0 0 12px 0", fontSize: "15px", fontWeight: "800", color: "#0f172a" }}>Food Cost & Profit Summary</h4>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748b" }}>Total Sales:</span>
              <strong style={{ color: "#0f172a" }}>₹{totalSales.toFixed(2)}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748b" }}>Food Cost (COGS):</span>
              <strong style={{ color: "#d97706" }}>₹{totalFoodCost.toFixed(2)} ({totalSales > 0 ? ((totalFoodCost / totalSales) * 100).toFixed(1) : 0}%)</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748b" }}>Gross Profit:</span>
              <strong style={{ color: "#2563eb" }}>₹{grossProfit.toFixed(2)}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748b" }}>Total Expenses:</span>
              <strong style={{ color: "#dc2626" }}>₹{totalExpensesPeriod.toFixed(2)}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "8px", borderTop: "1px solid #e2e8f0", fontWeight: "800" }}>
              <span>Net Profit:</span>
              <span style={{ color: netProfit >= 0 ? "#16a34a" : "#dc2626" }}>₹{netProfit.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* SECTION 15: WASTAGE SUMMARY */}
        <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", padding: "20px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <h4 style={{ margin: 0, fontSize: "15px", fontWeight: "800", color: "#0f172a" }}>Wastage Summary</h4>
            <Link href="/restaurant/wastage" style={{ color: "#ef4444", fontWeight: "700", fontSize: "11px", textDecoration: "none" }}>
              Manage →
            </Link>
          </div>

          <div style={{ fontSize: "12px", display: "flex", flexDirection: "column", gap: "4px", marginBottom: "12px" }}>
            <div>Total Entries: <strong>{wastageSummaryData.totalEntries}</strong></div>
            <div>Total Cost: <strong style={{ color: "#dc2626" }}>₹{wastageSummaryData.totalCost.toFixed(2)}</strong></div>
            <div>Most Wasted: <strong style={{ color: "#d97706" }}>{wastageSummaryData.mostWasted}</strong></div>
          </div>

          {wastageSummaryData.list.length === 0 ? (
            <p style={{ color: "#94a3b8", fontSize: "11px", margin: 0 }}>No recent wastage records.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "11px", color: "#475569" }}>
              {wastageSummaryData.list.map((w) => (
                <div key={w.id} style={{ display: "flex", justifyContent: "space-between", background: "#f8fafc", padding: "4px 8px", borderRadius: "4px" }}>
                  <span>{w.product?.name || w.reason || "Wastage"}</span>
                  <span style={{ fontWeight: "700", color: "#dc2626" }}>₹{parseFloat(w.totalCost || 0).toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* ==========================================
          SECTION 11: RECENT ORDERS TABLE
      ========================================== */}
      <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", padding: "20px", border: "1px solid #e2e8f0", marginBottom: "28px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <h4 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "#0f172a" }}>Recent Orders</h4>
            <span style={{ fontSize: "12px", color: "#64748b" }}>Latest 5 to 10 live restaurant transactions</span>
          </div>
          <Link href="/restaurant/orders" style={{ color: "#2563eb", fontWeight: "700", fontSize: "13px", textDecoration: "none" }}>
            View All Orders →
          </Link>
        </div>

        {filteredOrders.length === 0 ? (
          <p style={{ color: "#94a3b8", textAlign: "center", padding: "24px" }}>No orders found for the selected filter.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ backgroundColor: "#f8fafc", borderBottom: "2px solid #e2e8f0", textAlign: "left" }}>
                  <th style={{ padding: "10px 12px", color: "#475569", fontWeight: "700" }}>Order #</th>
                  <th style={{ padding: "10px 12px", color: "#475569", fontWeight: "700" }}>Time</th>
                  <th style={{ padding: "10px 12px", color: "#475569", fontWeight: "700" }}>Customer</th>
                  <th style={{ padding: "10px 12px", color: "#475569", fontWeight: "700" }}>Table</th>
                  <th style={{ padding: "10px 12px", color: "#475569", fontWeight: "700" }}>Type</th>
                  <th style={{ padding: "10px 12px", color: "#475569", fontWeight: "700" }}>Amount</th>
                  <th style={{ padding: "10px 12px", color: "#475569", fontWeight: "700" }}>Payment</th>
                  <th style={{ padding: "10px 12px", color: "#475569", fontWeight: "700" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.slice(0, 8).map((o) => (
                  <tr key={o.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "10px 12px", fontWeight: "700", color: "#2563eb" }}>{o.orderNumber}</td>
                    <td style={{ padding: "10px 12px", color: "#64748b" }}>
                      {o.createdAt ? new Date(o.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "N/A"}
                    </td>
                    <td style={{ padding: "10px 12px", color: "#0f172a" }}>{o.customerName || o.customer?.name || "Guest Customer"}</td>
                    <td style={{ padding: "10px 12px", color: "#64748b" }}>{o.table?.tableNumber || o.tableNumber || "N/A"}</td>
                    <td style={{ padding: "10px 12px", fontWeight: "600", color: "#334155" }}>{o.orderType}</td>
                    <td style={{ padding: "10px 12px", fontWeight: "700", color: "#0f172a" }}>₹{parseFloat(o.totalAmount || 0).toFixed(2)}</td>
                    <td style={{ padding: "10px 12px" }}>
                      <span style={{ fontSize: "11px", fontWeight: "700", padding: "2px 8px", borderRadius: "12px", backgroundColor: o.paymentStatus === "PAID" ? "#d1fae5" : "#fef3c7", color: o.paymentStatus === "PAID" ? "#065f46" : "#92400e" }}>
                        {o.paymentStatus || "PENDING"}
                      </span>
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      <span style={{ fontSize: "11px", fontWeight: "700", padding: "2px 8px", borderRadius: "12px", backgroundColor: o.status === "COMPLETED" ? "#d1fae5" : o.status === "CANCELLED" ? "#fee2e2" : "#dbeafe", color: o.status === "COMPLETED" ? "#065f46" : o.status === "CANCELLED" ? "#991b1b" : "#1e40af" }}>
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ==========================================
          SECTION 16: QUICK ACTIONS
      ========================================== */}
      <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", padding: "20px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        <h4 style={{ margin: "0 0 14px 0", fontSize: "16px", fontWeight: "800", color: "#0f172a" }}>Operational Quick Actions</h4>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: "12px" }}>
          <Link href="/restaurant/pos" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 14px", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "10px", color: "#1d4ed8", fontWeight: "700", fontSize: "13px", textDecoration: "none" }}>
            <FiMonitor size={16} /> New Order (POS)
          </Link>
          <Link href="/restaurant/tables" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 14px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "10px", color: "#15803d", fontWeight: "700", fontSize: "13px", textDecoration: "none" }}>
            <FiGrid size={16} /> Manage Tables
          </Link>
          <Link href="/restaurant/reservations" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 14px", background: "#f3e8ff", border: "1px solid #e9d5ff", borderRadius: "10px", color: "#7e22ce", fontWeight: "700", fontSize: "13px", textDecoration: "none" }}>
            <FiCalendar size={16} /> New Reservation
          </Link>
          <Link href="/restaurant/menu" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 14px", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "10px", color: "#b45309", fontWeight: "700", fontSize: "13px", textDecoration: "none" }}>
            <FiBox size={16} /> Manage Menu
          </Link>
          <Link href="/warehouse/add" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 14px", background: "#f0fdfa", border: "1px solid #99f6e4", borderRadius: "10px", color: "#0f766e", fontWeight: "700", fontSize: "13px", textDecoration: "none" }}>
            <FiPackage size={16} /> Add Stock
          </Link>
          <Link href="/purchases/add" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 14px", background: "#fdf2f8", border: "1px solid #fbcfe8", borderRadius: "10px", color: "#be185d", fontWeight: "700", fontSize: "13px", textDecoration: "none" }}>
            <FiShoppingCart size={16} /> Create PO
          </Link>
          <Link href="/restaurant/wastage" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "10px", color: "#b91c1c", fontWeight: "700", fontSize: "13px", textDecoration: "none" }}>
            <FiTrash2 size={16} /> Add Wastage
          </Link>
          <Link href="/restaurant/kitchen" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 14px", background: "#f0fdf4", border: "1px solid #86efac", borderRadius: "10px", color: "#047857", fontWeight: "700", fontSize: "13px", textDecoration: "none" }}>
            <FiTv size={16} /> Open KDS Display
          </Link>
        </div>
      </div>

    </div>
  );
}
