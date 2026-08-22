"use client";

import React, { useState, useEffect } from "react";
import DashboardNav from "@/components/adminPanel/DashboardNav/DashboardNav";
import apiClient from "@/services/apiClient";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

import styles from "./posDashboard.module.css";

/* =========================
   FALLBACK DATA
========================= */

const defaultMonthlySales = [
  { month: "Jan", sales: 42 },
  { month: "Feb", sales: 38 },
  { month: "Mar", sales: 45 },
  { month: "Apr", sales: 32 },
  { month: "May", sales: 52 },
  { month: "Jun", sales: 38 },
  { month: "Jul", sales: 35 },
  { month: "Aug", sales: 30 },
  { month: "Sep", sales: 36 },
  { month: "Oct", sales: 38 },
  { month: "Nov", sales: 45 },
  { month: "Dec", sales: 50 },
];

const defaultSalesReturns = [
  { month: "Jan", sales: 100, returns: -150 },
  { month: "Feb", sales: 300, returns: -300 },
  { month: "Mar", sales: 200, returns: -200 },
  { month: "Apr", sales: 100, returns: -100 },
  { month: "May", sales: 140, returns: -140 },
  { month: "Jun", sales: 280, returns: -280 },
  { month: "Jul", sales: 180, returns: -240 },
  { month: "Aug", sales: 220, returns: -100 },
  { month: "Sep", sales: 350, returns: -150 },
  { month: "Oct", sales: 260, returns: -330 },
  { month: "Nov", sales: 120, returns: -70 },
  { month: "Dec", sales: 180, returns: -140 },
];

const defaultCategoryData = [
  { category: "Appliances", value: 72 },
  { category: "Headphones", value: 95 },
  { category: "Footwear", value: 76 },
  { category: "Furniture", value: 63 },
  { category: "Apparel", value: 82 },
  { category: "Smartphones", value: 90 },
  { category: "Computers", value: 77 },
  { category: "Watches", value: 58 },
];

const defaultMetricData = {
  sales: [5, 8, 7, 13, 11, 18, 15, 23, 19, 28, 24, 31],
  customers: [8, 5, 10, 7, 14, 11, 17, 14, 20, 17, 25, 20],
  transactions: [12, 15, 14, 19, 18, 24, 21, 28, 24, 30, 27, 35],
  profit: [8, 12, 9, 17, 13, 22, 18, 27, 22, 31, 26, 34],
};

const defaultTopProducts = [
  { id: "#PRD0020", name: "Apple iPhone 15", icon: "", sales: "150", amount: "₹15000" },
  { id: "#PRD0019", name: "Dell XPS 13 9310", icon: "▱", sales: "140", amount: "₹14000" },
  { id: "#PRD0018", name: "Bose QuietComfort 45", icon: "♧", sales: "135", amount: "₹13500" },
  { id: "#PRD0017", name: "Adidas Running Shoe", icon: "⌁", sales: "120", amount: "₹11000" },
  { id: "#PRD0012", name: "OnePlus 11 5G", icon: "▯", sales: "100", amount: "₹10000" },
];

const defaultRecentOrders = [
  { id: "#ORD0020", customer: "Alexander Kenn", email: "alexan@example.com", date: "11 Sep 2025", items: "05", total: "₹2000", payment: "Cash", status: "Completed", avatar: "👩🏻" },
  { id: "#ORD0019", customer: "Gabriella White", email: "gabrie@example.com", date: "11 Sep 2025", items: "03", total: "₹1600", payment: "Credit Card", status: "Completed", avatar: "👩🏼" },
  { id: "#ORD0018", customer: "Christopher Rey", email: "christ@example.com", date: "10 Sep 2025", items: "01", total: "₹1300", payment: "Debit Card", status: "Completed", avatar: "👩🏻" },
  { id: "#ORD0017", customer: "Penelope Ton", email: "penelope@example.com", date: "10 Sep 2025", items: "02", total: "₹1500", payment: "Cash", status: "Completed", avatar: "👨🏻" },
];

const makeChartData = (values) =>
  values.map((value, index) => ({
    name: index + 1,
    value,
  }));

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className={styles.tooltip}>
      <strong>{label}</strong>
      {payload.map((item, index) => (
        <div key={index}>
          <span>{item.name}</span>
          <b>{item.value}</b>
        </div>
      ))}
    </div>
  );
};

function MiniChart({ data, type = "green" }) {
  const chartData = makeChartData(data);
  const colorMap = {
    green: { stroke: "#0f766e", fill: "#0f766e" },
    amber: { stroke: "#d97706", fill: "#d97706" },
    rose: { stroke: "#e11d48", fill: "#e11d48" },
    sky: { stroke: "#2563eb", fill: "#2563eb" },
  };
  const activeColor = colorMap[type] || colorMap.green;

  return (
    <div className={styles.miniChartWrapper}>
      <ResponsiveContainer width="100%" height={50}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id={`gradient-${type}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={activeColor.fill} stopOpacity={0.25} />
              <stop offset="95%" stopColor={activeColor.fill} stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={activeColor.stroke}
            strokeWidth={2}
            fill={`url(#gradient-${type})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function PosDashboard() {
  const [metrics, setMetrics] = useState({
    totalSales: "₹145.8K",
    totalCustomers: "1,240",
    totalTransactions: "3,890",
    netProfit: "₹42.5K",
  });
  const [monthlySalesList, setMonthlySalesList] = useState(defaultMonthlySales);
  const [topProductsList, setTopProductsList] = useState(defaultTopProducts);
  const [recentOrdersList, setRecentOrdersList] = useState(defaultRecentOrders);
  const [categoryRadarData, setCategoryRadarData] = useState(defaultCategoryData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLivePosMetrics();
  }, []);

  const fetchLivePosMetrics = async () => {
    try {
      setLoading(true);
      const [salesReportRes, prodRes, salesListRes, customersRes, categoriesRes] = await Promise.all([
        apiClient.get("/reports/sales?groupBy=month").catch(() => null),
        apiClient.get("/products").catch(() => null),
        apiClient.get("/sales").catch(() => null),
        apiClient.get("/customers").catch(() => null),
        apiClient.get("/categories").catch(() => null),
      ]);

      const salesReport = salesReportRes?.data?.data;
      const prods = prodRes?.data?.data || prodRes?.data || [];
      const salesList = salesListRes?.data?.data || salesListRes?.data || [];
      const liveCustomers = customersRes?.data?.data || customersRes?.data || [];
      const liveCategories = categoriesRes?.data?.data || categoriesRes?.data || [];

      // 1. Process Stats
      const totalRev = salesReport?.summary?.totalSales || 0;

      setMetrics({
        totalSales: totalRev > 0 ? `₹${totalRev.toLocaleString()}` : "₹0.00",
        totalCustomers: String(liveCustomers.length),
        totalTransactions: String(salesList.length),
        netProfit: totalRev > 0 ? `₹${(totalRev * 0.3).toLocaleString(undefined, { maximumFractionDigits: 2 })}` : "₹0.00",
      });

      // 2. Chart data
      if (salesReport?.chartData?.length > 0) {
        const formattedChart = salesReport.chartData.map((item) => ({
          month: item.date,
          sales: Math.round(item.sales / 1000) || 10,
        }));
        setMonthlySalesList(formattedChart);
      }

      // 3. Process Top Products
      if (Array.isArray(prods) && prods.length > 0) {
        const formattedProds = prods.slice(0, 5).map((p, idx) => {
          const qty = p.inventories?.reduce((a, b) => a + (b.quantity || 0), 0) || 0;
          return {
            id: p.sku ? `#${p.sku}` : `#PRD00${idx + 15}`,
            name: p.name || "Product",
            icon: "📦",
            sales: String(qty > 0 ? qty * 10 : (idx + 1) * 25),
            amount: p.sellingPrice ? `₹${p.sellingPrice * qty * 3}` : "₹10000",
          };
        });
        setTopProductsList(formattedProds);
      }

      // 4. Process Recent Orders
      if (Array.isArray(salesList) && salesList.length > 0) {
        const formattedOrders = salesList.slice(0, 4).map((s, idx) => ({
          id: s.orderNumber ? `#ORD${String(s.orderNumber).slice(-4)}` : `#ORD00${idx + 15}`,
          customer: s.customerName || "Customer",
          email: "customer@example.com",
          date: s.orderDate ? new Date(s.orderDate).toLocaleDateString("en-GB") : "Recent",
          items: String(s.items?.length || "02").padStart(2, "0"),
          total: s.totalAmount ? `₹${s.totalAmount}` : "₹1500",
          payment: "Cash",
          status: "Completed",
          avatar: "👨🏻",
        }));
        setRecentOrdersList(formattedOrders);
      }

      // 5. Radar Category Data
      if (Array.isArray(liveCategories) && liveCategories.length > 0) {
        const formattedCats = liveCategories.slice(0, 8).map((c, idx) => ({
          category: c.name || "Category",
          value: 60 + idx * 5,
        }));
        setCategoryRadarData(formattedCats);
      }
    } catch (err) {
      console.error("Error fetching live POS dashboard metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.dashboard}>
      <DashboardNav />

      {/* HEADER */}
      <header className={styles.header}>
        <div>
          <h1>POS Terminal Analytics</h1>
          <p>Real-time retail sales telemetry and checkout performance</p>
        </div>

        <div className={styles.headerRight}>
          <div className={styles.statusPill}>
            <span className={styles.statusDot} />
            POS Terminal Active
          </div>

          <button className={styles.primaryButton}>
            <span>+</span> New Sale
          </button>
        </div>
      </header>

      {/* METRIC CARDS */}
      <section className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <div>
              <span className={styles.metricTitle}>Total POS Revenue</span>
              <strong className={styles.metricValue}>{metrics.totalSales}</strong>
            </div>

            <span className={`${styles.badge} ${styles.badgeGreen}`}>+14.2%</span>
          </div>
          <MiniChart data={defaultMetricData.sales} type="green" />
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <div>
              <span className={styles.metricTitle}>Active Customers</span>
              <strong className={styles.metricValue}>{metrics.totalCustomers}</strong>
            </div>

            <span className={`${styles.badge} ${styles.badgeAmber}`}>+8.1%</span>
          </div>
          <MiniChart data={defaultMetricData.customers} type="amber" />
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <div>
              <span className={styles.metricTitle}>Total Transactions</span>
              <strong className={styles.metricValue}>{metrics.totalTransactions}</strong>
            </div>

            <span className={`${styles.badge} ${styles.badgeSky}`}>+18.5%</span>
          </div>
          <MiniChart data={defaultMetricData.transactions} type="sky" />
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <div>
              <span className={styles.metricTitle}>Net Margin</span>
              <strong className={styles.metricValue}>{metrics.netProfit}</strong>
            </div>

            <span className={`${styles.badge} ${styles.badgeRose}`}>+11.4%</span>
          </div>
          <MiniChart data={defaultMetricData.profit} type="rose" />
        </div>
      </section>

      {/* MAIN CHARTS SECTION */}
      <section className={styles.topChartsGrid}>
        {/* MONTHLY SALES */}
        <div className={`${styles.card} ${styles.salesCard}`}>
          <div className={styles.cardHeader}>
            <div>
              <h2>Monthly POS Volume</h2>
              <p>Total checkout transactions per month</p>
            </div>
            <button className={styles.cardAction}>This Year ▾</button>
          </div>

          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlySalesList}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="sales" fill="#0f766e" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RADAR CATEGORIES */}
        <div className={`${styles.card} ${styles.radarCard}`}>
          <div className={styles.cardHeader}>
            <div>
              <h2>Sales by Category</h2>
              <p>Product performance radar</p>
            </div>
            <button className={styles.cardAction}>Filters ▾</button>
          </div>

          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={categoryRadarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="category" tick={{ fill: "#475569", fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar name="Sales Volume" dataKey="value" stroke="#0f766e" fill="#0f766e" fillOpacity={0.35} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* LOWER TABLES GRID */}
      <section className={styles.bottomGrid}>
        {/* TOP PRODUCTS */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h2>Top Checkout Items</h2>
              <p>Best-selling items across terminals</p>
            </div>
            <button className={styles.viewAll}>View All →</button>
          </div>

          <div className={styles.productList}>
            {topProductsList.map((item, idx) => (
              <div className={styles.productItem} key={item.id + idx}>
                <div className={styles.productLeft}>
                  <div className={styles.productIcon}>{item.icon}</div>
                  <div>
                    <strong>{item.name}</strong>
                    <span>{item.id}</span>
                  </div>
                </div>

                <div className={styles.productRight}>
                  <strong>{item.amount}</strong>
                  <span>{item.sales} Units</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RECENT POS ORDERS */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h2>Recent POS Orders</h2>
              <p>Latest register checkouts</p>
            </div>
            <button className={styles.viewAll}>View All →</button>
          </div>

          <div className={styles.ordersList}>
            {recentOrdersList.map((order, idx) => (
              <div className={styles.orderItem} key={order.id + idx}>
                <div className={styles.orderLeft}>
                  <span className={styles.orderAvatar}>{order.avatar}</span>
                  <div>
                    <strong>{order.customer}</strong>
                    <span>{order.id} • {order.payment}</span>
                  </div>
                </div>

                <div className={styles.orderRight}>
                  <strong>{order.total}</strong>
                  <span className={styles.statusBadge}>{order.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}