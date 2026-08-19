"use client";

import React from "react";
import DashboardNav from "@/components/adminPanel/DashboardNav/DashboardNav";
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
   DATA
========================= */

const monthlySales = [
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

const salesReturns = [
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

const categoryData = [
  { category: "Appliances", value: 72 },
  { category: "Headphones", value: 95 },
  { category: "Footwear", value: 76 },
  { category: "Furniture", value: 63 },
  { category: "Apparel", value: 82 },
  { category: "Smartphones", value: 90 },
  { category: "Computers", value: 77 },
  { category: "Watches", value: 58 },
];

const metricData = {
  sales: [5, 8, 7, 13, 11, 18, 15, 23, 19, 28, 24, 31],
  customers: [8, 5, 10, 7, 14, 11, 17, 14, 20, 17, 25, 20],
  transactions: [12, 15, 14, 19, 18, 24, 21, 28, 24, 30, 27, 35],
  profit: [8, 12, 9, 17, 13, 22, 18, 27, 22, 31, 26, 34],
};

const topProducts = [
  {
    id: "#PRD0020",
    name: "Apple iPhone 15",
    icon: "●",
    sales: "200",
    amount: "$12,800",
  },
  {
    id: "#PRD0019",
    name: "Dell XPS 13 9310",
    icon: "▱",
    sales: "170",
    amount: "$12000",
  },
  {
    id: "#PRD0018",
    name: "Bose QuietComfort 45",
    icon: "◉",
    sales: "150",
    amount: "$11500",
  },
  {
    id: "#PRD0017",
    name: "Adidas Running Shoe",
    icon: "⌁",
    sales: "120",
    amount: "$11000",
  },
  {
    id: "#PRD0012",
    name: "OnePlus 11 5G",
    icon: "▯",
    sales: "100",
    amount: "$10000",
  },
];

const recentOrders = [
  {
    id: "#ORD0020",
    customer: "Alexander Kenn",
    email: "alexan@example.com",
    date: "11 Sep 2025",
    items: "05",
    total: "$2000",
    payment: "Cash",
    status: "Completed",
    avatar: "👩🏻",
  },
  {
    id: "#ORD0019",
    customer: "Gabriella White",
    email: "gabrie@example.com",
    date: "11 Sep 2025",
    items: "03",
    total: "$1600",
    payment: "Credit Card",
    status: "Completed",
    avatar: "👩🏼",
  },
  {
    id: "#ORD0018",
    customer: "Christopher Rey",
    email: "christ@example.com",
    date: "10 Sep 2025",
    items: "01",
    total: "$1300",
    payment: "Debit Card",
    status: "Completed",
    avatar: "👩🏻",
  },
  {
    id: "#ORD0017",
    customer: "Penelope Ton",
    email: "penelope@example.com",
    date: "10 Sep 2025",
    items: "02",
    total: "$1500",
    payment: "Cash",
    status: "Completed",
    avatar: "👨🏻",
  },
];

/* =========================
   SMALL CHART DATA
========================= */

const makeChartData = (values) =>
  values.map((value, index) => ({
    name: index + 1,
    value,
  }));

/* =========================
   TOOLTIP
========================= */

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

/* =========================
   MINI AREA CHART
========================= */

function MiniChart({ data, type = "green" }) {
  const chartData = makeChartData(data);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData}>
        <defs>
          <linearGradient id={`${type}Gradient`} x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor={
                type === "green"
                  ? "#079574"
                  : type === "purple"
                  ? "#7625b5"
                  : type === "blue"
                  ? "#09a7eb"
                  : "#d329ac"
              }
              stopOpacity={0.22}
            />

            <stop
              offset="100%"
              stopColor={
                type === "green"
                  ? "#079574"
                  : type === "purple"
                  ? "#7625b5"
                  : type === "blue"
                  ? "#09a7eb"
                  : "#d329ac"
              }
              stopOpacity={0}
            />
          </linearGradient>
        </defs>

        <XAxis dataKey="name" hide />
        <YAxis hide />

        <Tooltip content={<ChartTooltip />} />

        <Area
          type="monotone"
          dataKey="value"
          stroke={
            type === "green"
              ? "#079574"
              : type === "purple"
              ? "#7625b5"
              : type === "blue"
              ? "#09a7eb"
              : "#d329ac"
          }
          strokeWidth={2.5}
          fill={`url(#${type}Gradient)`}
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/* =========================
   MAIN COMPONENT
========================= */

export default function POSDashboard() {
  return (
    <main className={styles.dashboard}>
      <DashboardNav />
      {/* ================= HEADER ================= */}

      <header className={styles.topbar}>
        <h1>POS Dashboard</h1>

        <div className={styles.headerActions}>
          <button className={styles.dateButton}>
            <span>▣</span>
            <span>01 Jan 26 to 20 Jan 26</span>
          </button>

          <button className={styles.exportButton}>
            <span>⇩</span>
            <span>Export</span>
            <span>⌄</span>
          </button>
        </div>
      </header>

      {/* ================= TOP SECTION ================= */}

      <section className={styles.topGrid}>
        {/* TOP PRODUCTS */}

        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>Top Products</h2>

            <button className={styles.viewButton}>
              View All <span>›</span>
            </button>
          </div>

          <div className={styles.productList}>
            {topProducts.map((product) => (
              <div className={styles.productRow} key={product.id}>
                <div className={styles.productIcon}>{product.icon}</div>

                <div className={styles.productInfo}>
                  <small>{product.id}</small>
                  <strong>{product.name}</strong>
                </div>

                <div className={styles.salesInfo}>
                  <small>No of Sales</small>
                  <strong>{product.sales}</strong>
                </div>

                <div className={styles.amountInfo}>
                  <small>Amount</small>
                  <strong>{product.amount}</strong>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* PRODUCT SALES */}

        <section className={`${styles.card} ${styles.salesCard}`}>
          <div className={styles.cardHeader}>
            <h2>Product Sales</h2>

            <button className={styles.yearButton}>
              2026 <span>⌄</span>
            </button>
          </div>

          <div className={styles.salesSummary}>
            <div>
              <span>Total Sales</span>

              <div className={styles.totalSales}>
                $2,458,900

                <small>↗</small>
              </div>
            </div>

            <div className={styles.updated}>
              Updated : 15 Jan 2025
            </div>
          </div>

          <div className={styles.salesChart}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlySales}
                margin={{
                  top: 10,
                  right: 5,
                  left: 10,
                  bottom: 5,
                }}
              >
                <defs>
                  <linearGradient
                    id="salesBarGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#3ba98d"
                      stopOpacity={0.95}
                    />

                    <stop
                      offset="100%"
                      stopColor="#c9e8df"
                      stopOpacity={0.8}
                    />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  stroke="#e1e7eb"
                  strokeDasharray="5 5"
                  vertical={false}
                />

                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "#708198",
                    fontSize: 12,
                  }}
                />

                <YAxis
                  domain={[0, 60]}
                  ticks={[0, 20, 40, 60]}
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "#708198",
                    fontSize: 12,
                  }}
                  tickFormatter={(value) => `${value}K`}
                />

                <Tooltip content={<ChartTooltip />} />

                <Bar
                  dataKey="sales"
                  name="Sales"
                  fill="url(#salesBarGradient)"
                  radius={[5, 5, 2, 2]}
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </section>

      {/* ================= METRICS ================= */}

      <section className={styles.metricsGrid}>
        {/* TOTAL SALES */}

        <div className={styles.metricCard}>
          <div className={`${styles.metricIcon} ${styles.green}`}>
            ▣
          </div>

          <div className={styles.metricContent}>
            <span>Total Sales</span>
            <strong>$45,230</strong>

            <div className={styles.metricGrowth}>
              ↑ +12.4%
              <small>Last 30 days</small>
            </div>
          </div>

          <div className={styles.metricChart}>
            <MiniChart data={metricData.sales} type="green" />
          </div>
        </div>

        {/* REPEAT CUSTOMERS */}

        <div className={styles.metricCard}>
          <div className={`${styles.metricIcon} ${styles.purple}`}>
            ↻
          </div>

          <div className={styles.metricContent}>
            <span>Repeat Customers</span>
            <strong>42%</strong>

            <div className={styles.metricGrowth}>
              ↑ +4.33%
              <small>Last 30 days</small>
            </div>
          </div>

          <div className={styles.metricChart}>
            <MiniChart data={metricData.customers} type="purple" />
          </div>
        </div>

        {/* TRANSACTIONS */}

        <div className={styles.metricCard}>
          <div className={`${styles.metricIcon} ${styles.blue}`}>
            ≡
          </div>

          <div className={styles.metricContent}>
            <span>Total Transactions</span>
            <strong>1,645</strong>

            <div className={styles.metricGrowth}>
              ↑ +5.87%
              <small>Last 30 days</small>
            </div>
          </div>

          <div className={styles.metricChart}>
            <MiniChart data={metricData.transactions} type="blue" />
          </div>
        </div>

        {/* GROSS PROFIT */}

        <div className={styles.metricCard}>
          <div className={`${styles.metricIcon} ${styles.pink}`}>
            $
          </div>

          <div className={styles.metricContent}>
            <span>Gross Profit</span>
            <strong>$18,450</strong>

            <div className={styles.metricGrowth}>
              ↑ +2.68%
              <small>Last 30 days</small>
            </div>
          </div>

          <div className={styles.metricChart}>
            <MiniChart data={metricData.profit} type="pink" />
          </div>
        </div>
      </section>

      {/* ================= CHART SECTION ================= */}

      <section className={styles.chartGrid}>
        {/* SALES VS RETURNS */}

        <section className={`${styles.card} ${styles.salesReturnsCard}`}>
          <div className={styles.cardHeader}>
            <h2>Sales Vs Returns</h2>

            <button className={styles.yearButton}>
              2026 <span>⌄</span>
            </button>
          </div>

          <div className={styles.salesReturnsChart}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={salesReturns}
                margin={{
                  top: 15,
                  right: 20,
                  left: 15,
                  bottom: 25,
                }}
              >
                <CartesianGrid
                  stroke="#e1e7eb"
                  strokeDasharray="5 5"
                  vertical={false}
                />

                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "#61738b",
                    fontSize: 12,
                  }}
                />

                <YAxis
                  domain={[-400, 400]}
                  ticks={[-400, -300, -200, -100, 0, 100, 200, 300, 400]}
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "#61738b",
                    fontSize: 12,
                  }}
                />

                <Tooltip content={<ChartTooltip />} />

                <Bar
                  dataKey="sales"
                  name="Sales"
                  fill="#4c978d"
                  radius={[3, 3, 0, 0]}
                  barSize={28}
                />

                <Bar
                  dataKey="returns"
                  name="Returns"
                  fill="#e6954e"
                  radius={[0, 0, 3, 3]}
                  barSize={28}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className={styles.chartLegend}>
            <span>
              <i className={styles.greenDot}></i>
              Sales
            </span>

            <span>
              <i className={styles.orangeDot}></i>
              Returns
            </span>
          </div>
        </section>

        {/* HIGH SELLING CATEGORIES */}

        <section className={`${styles.card} ${styles.categoryCard}`}>
          <div className={styles.cardHeader}>
            <h2>High Selling Categories</h2>

            <button className={styles.yearButton}>
              Weekly <span>⌄</span>
            </button>
          </div>

          <div className={styles.radarChart}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart
                cx="50%"
                cy="52%"
                outerRadius="65%"
                data={categoryData}
              >
                <PolarGrid stroke="#e0e5e9" />

                <PolarAngleAxis
                  dataKey="category"
                  tick={{
                    fill: "#718199",
                    fontSize: 11,
                  }}
                />

                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 100]}
                  tick={false}
                  axisLine={false}
                />

                <Radar
                  name="Sales"
                  dataKey="value"
                  stroke="#eb5b00"
                  fill="#eb9b5d"
                  fillOpacity={0.48}
                  strokeWidth={2.5}
                />

                <Tooltip content={<ChartTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </section>

      {/* ================= RECENT ORDERS ================= */}

      <section className={`${styles.card} ${styles.ordersCard}`}>
        <div className={styles.cardHeader}>
          <h2>Recent Orders</h2>

          <button className={styles.viewButton}>
            View Orders <span>›</span>
          </button>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.ordersTable}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Email</th>
                <th>Date</th>
                <th>Items</th>
                <th>Total</th>
                <th>Payment Method</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>

                  <td>
                    <div className={styles.customer}>
                      <span className={styles.avatar}>
                        {order.avatar}
                      </span>

                      <strong>{order.customer}</strong>
                    </div>
                  </td>

                  <td>{order.email}</td>

                  <td>{order.date}</td>

                  <td>{order.items}</td>

                  <td className={styles.orderTotal}>
                    {order.total}
                  </td>

                  <td>{order.payment}</td>

                  <td>
                    <span className={styles.completed}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}