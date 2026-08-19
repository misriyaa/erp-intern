"use client";

import React, { useState, useEffect } from "react";
import DashboardNav from "../DashboardNav/DashboardNav";
import apiClient from "@/services/apiClient";
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
} from "recharts";

import {
  Truck,
  Calendar,
  Clock,
  Bell,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  Boxes,
  ShoppingCart,
  Building2,
  FileBarChart2,
  ChevronDown,
} from "lucide-react";

import styles from "./DashboardHome.module.css";

/* =========================
   MOCK DATA
========================= */

const deliveries = [
  {
    title: "Supplier Restock — Main Warehouse",
    date: "18 Aug 2026",
    time: "09:10 AM – 10:30 AM",
    tone: "blue",
  },
  {
    title: "Stock Audit — Main Branch",
    date: "21 Aug 2026",
    time: "11:00 AM – 01:00 PM",
    tone: "rose",
  },
];

const revenueByQuarter = [
  { q: "Q1 '25", collected: 62, target: 100 },
  { q: "Q2 '25", collected: 78, target: 100 },
  { q: "Q3 '25", collected: 55, target: 100 },
  { q: "Q4 '25", collected: 70, target: 100 },
  { q: "Q1 '26", collected: 84, target: 100 },
  { q: "Q2 '26", collected: 60, target: 100 },
  { q: "Q3 '26", collected: 91, target: 100 },
];

const earnings = [
  { m: "Feb", v: 32 },
  { m: "Mar", v: 48 },
  { m: "Apr", v: 30 },
  { m: "May", v: 55 },
  { m: "Jun", v: 41 },
  { m: "Jul", v: 60 },
  { m: "Aug", v: 52 },
];

const stockStatus = [
  {
    name: "In stock",
    value: 412,
    color: "#3B4CCA",
  },
  {
    name: "Low stock",
    value: 34,
    color: "#F5A623",
  },
  {
    name: "Out of stock",
    value: 9,
    color: "#E11D48",
  },
];

const topCategories = [
  {
    name: "Groceries",
    pct: 88,
    color: "#3B4CCA",
  },
  {
    name: "Electronics",
    pct: 71,
    color: "#0F9D77",
  },
  {
    name: "Home & Living",
    pct: 64,
    color: "#3B4CCA",
  },
  {
    name: "Beauty",
    pct: 52,
    color: "#16A34A",
  },
  {
    name: "Apparel",
    pct: 45,
    color: "#F5A623",
  },
  {
    name: "Stationery",
    pct: 30,
    color: "#E11D48",
  },
];

const activity = [
  {
    title: "New PO approved",
    sub: "PO-2291 to Al Rai Trading Co.",
    img: "🧾",
  },
  {
    title: "Stock received",
    sub: "412 units — Salmiya branch",
    img: "📦",
  },
  {
    title: "Return processed",
    sub: "Order #10432, 3 items",
    img: "↩️",
  },
  {
    title: "New supplier onboarded",
    sub: "Gulf Fresh Distributors",
    img: "🤝",
  },
];

const notices = [
  {
    title: "New pricing policy rollout",
    added: "11 Aug 2026",
    chip: "3 Days",
  },
  {
    title: "Ramadan stock planning kickoff",
    added: "05 Aug 2026",
    chip: "9 Days",
  },
  {
    title: "Supplier contract renewals due",
    added: "28 Jul 2026",
    chip: "16 Days",
  },
];

const todos = [
  {
    title: "Confirm delivery slot — Al Rai",
    time: "01:00 PM",
    status: "Completed",
    done: true,
  },
  {
    title: "Review low-stock alerts",
    time: "03:30 PM",
    status: "In progress",
    done: false,
  },
  {
    title: "Approve leave — 2 employees",
    time: "04:50 PM",
    status: "Yet to start",
    done: false,
  },
];

const approvals = [
  {
    name: "Fahad K.",
    role: "Warehouse Lead",
    tag: "Leave",
    tagTone: "rose",
    detail: "12–13 May",
  },
  {
    name: "Meera S.",
    role: "Cashier",
    tag: "Shift swap",
    tagTone: "amber",
    detail: "14 May",
  },
];

const quickActions = [
  {
    label: "Inventory",
    icon: Boxes,
    tone: "amber",
  },
  {
    label: "Orders",
    icon: ShoppingCart,
    tone: "green",
  },
  {
    label: "Suppliers",
    icon: Building2,
    tone: "rose",
  },
  {
    label: "Reports",
    icon: FileBarChart2,
    tone: "sky",
  },
];

const toneMap = {
  amber: {
    bg: "#FCEFD9",
    fg: "#8A5A00",
    icon: "#F5A623",
  },
  green: {
    bg: "#E1F5EC",
    fg: "#0F6E4E",
    icon: "#16A34A",
  },
  rose: {
    bg: "#FBE7EA",
    fg: "#9A1B34",
    icon: "#E11D48",
  },
  sky: {
    bg: "#E6F0FD",
    fg: "#134487",
    icon: "#3B4CCA",
  },
};

/* =========================
   CARD HEADER
========================= */

function CardHeader({ title, control }) {
  return (
    <div className={styles.cardHeader}>
      <h3 className={styles.cardTitle}>{title}</h3>

      {control && (
        <button className={styles.cardControl}>
          {control}
          <ChevronDown size={14} />
        </button>
      )}
    </div>
  );
}

/* =========================
   STAT CARD
========================= */

function Stat({ label, value, delta, tone = "green" }) {
  const good = tone === "green";

  return (
    <div className={styles.statCard}>
      <div>
        <p className={styles.statLabel}>{label}</p>
        <p className={styles.statValue}>{value}</p>
      </div>

      <span
        className={`${styles.statDelta} ${
          good ? styles.statPositive : styles.statNegative
        }`}
      >
        <ArrowUpRight size={13} />
        {delta}
      </span>
    </div>
  );
}

/* =========================
   MAIN DASHBOARD
========================= */

export default function DashboardHome() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalEmployees: 0,
    totalCategories: 0,
    totalValue: 0,
    inStock: 0,
    lowStock: 0,
    outOfStock: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const [prodRes, empRes, catRes, invRes] = await Promise.all([
        apiClient.get("/products").catch(() => ({ data: { data: [] } })),
        apiClient.get("/employees").catch(() => ({ data: { data: [] } })),
        apiClient.get("/categories").catch(() => ({ data: { data: [] } })),
        apiClient.get("/inventory").catch(() => ({ data: { data: [] } })),
      ]);

      const products = prodRes.data?.data || [];
      const employees = empRes.data?.data || [];
      const categories = catRes.data?.data || [];
      const inventories = invRes.data?.data || [];

      let totalVal = 0;
      let inStk = 0;
      let lowStk = 0;
      let outStk = 0;

      products.forEach((p) => {
        const qty = p.inventories?.reduce((a, b) => a + (b.quantity || 0), 0) || 0;
        totalVal += qty * (parseFloat(p.sellingPrice) || 0);
        if (qty === 0) outStk++;
        else if (qty < 10) lowStk++;
        else inStk++;
      });

      setStats({
        totalProducts: products.length,
        totalEmployees: employees.length,
        totalCategories: categories.length,
        totalValue: totalVal,
        inStock: inStk || products.length,
        lowStock: lowStk,
        outOfStock: outStk,
      });
    } catch (err) {
      console.error("Dashboard stats fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const dynamicStockStatus = [
    { name: "In stock", value: stats.inStock || 412, color: "#3B4CCA" },
    { name: "Low stock", value: stats.lowStock || 34, color: "#F5A623" },
    { name: "Out of stock", value: stats.outOfStock || 9, color: "#E11D48" },
  ];

  const donutTotal = dynamicStockStatus.reduce(
    (total, item) => total + item.value,
    0
  );

  return (
    <div className={styles.dashboard}>
      <div className={styles.container}>
        <DashboardNav />

        {/* HEADER */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.pageTitle}>Retail Executive Overview</h1>

            <p className={styles.pageSubtitle}>
              Live System Telemetry & Operations
            </p>
          </div>

          <button className={styles.notificationButton}>
            <Bell size={18} />
          </button>
        </div>

        {/* KPI */}
        <div className={styles.kpiGrid}>
          <Stat
            label="Total Active Products"
            value={stats.totalProducts ? `${stats.totalProducts} Items` : "0 Items"}
            delta="+12.4%"
          />

          <Stat
            label="Active Staff Members"
            value={stats.totalEmployees ? `${stats.totalEmployees} Staff` : "0 Staff"}
            delta="+4.1%"
          />

          <Stat
            label="Low Stock Warnings"
            value={stats.lowStock ? `${stats.lowStock} Items` : "0 Items"}
            delta="-2.1%"
            tone="red"
          />

          <Stat
            label="Total Inventory Value"
            value={stats.totalValue ? `₹${stats.totalValue.toLocaleString()}` : "₹0.00"}
            delta="+8.2%"
          />
        </div>

        {/* DELIVERY / HIGHLIGHTS / STOCK */}
        <div className={styles.threeColumnGrid}>

          {/* DELIVERY */}
          <div className={styles.card}>
            <div className={styles.deliveryList}>
              {deliveries.map((delivery, index) => (
                <div
                  key={delivery.title}
                  className={`${styles.deliveryItem} ${
                    delivery.tone === "rose"
                      ? styles.deliveryRose
                      : ""
                  }`}
                >
                  <p className={styles.deliveryTitle}>
                    <Truck size={14} />
                    {delivery.title}
                  </p>

                  <p className={styles.deliveryMeta}>
                    <Calendar size={12} />
                    {delivery.date}
                  </p>

                  <p className={styles.deliveryMeta}>
                    <Clock size={12} />
                    {delivery.time}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* HIGHLIGHTS */}
          <div className={styles.highlightGrid}>

            <div
              className={`${styles.highlightCard} ${styles.highlightGreen}`}
            >
              <div>
                <p className={styles.highlightLabel}>
                  Top performer
                </p>

                <p className={styles.highlightTitle}>
                  Rasha M.
                </p>

                <p className={styles.highlightDescription}>
                  Store Manager, Hawally
                </p>
              </div>

              <div className={styles.highlightIcon}>
                🏆
              </div>
            </div>

            <div
              className={`${styles.highlightCard} ${styles.highlightBlue}`}
            >
              <div>
                <p className={styles.highlightLabel}>
                  Best-selling SKU
                </p>

                <p className={styles.highlightTitle}>
                  Al Marai Milk 1L
                </p>

                <p className={styles.highlightDescription}>
                  Groceries · 1,204 units
                </p>
              </div>

              <div className={styles.highlightIcon}>
                🛒
              </div>
            </div>

          </div>

          {/* STOCK */}
          <div className={styles.card}>

            <CardHeader
              title="Stock health"
              control="All branches"
            />

            <div className={styles.stockHealth}>

              <div className={styles.stockChart}>
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <PieChart>
                    <Pie
                      data={stockStatus}
                      dataKey="value"
                      innerRadius={34}
                      outerRadius={52}
                      paddingAngle={2}
                    >
                      {stockStatus.map((item) => (
                        <Cell
                          key={item.name}
                          fill={item.color}
                          stroke="none"
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className={styles.stockList}>
                {stockStatus.map((item) => (
                  <div
                    key={item.name}
                    className={styles.stockRow}
                  >
                    <span className={styles.stockName}>
                      <span
                        className={styles.stockDot}
                        style={{
                          background: item.color,
                        }}
                      />

                      {item.name}
                    </span>

                    <span className={styles.stockValue}>
                      {item.value}
                    </span>
                  </div>
                ))}

                <p className={styles.stockTotal}>
                  {donutTotal} SKUs tracked
                </p>
              </div>

            </div>
          </div>
        </div>

        {/* REVENUE / APPROVALS */}
        <div className={styles.twoColumnGrid}>

          <div className={styles.card}>
            <CardHeader
              title="Revenue collection"
              control="Last 7 quarters"
            />

            <div className={styles.revenueChart}>
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart
                  data={revenueByQuarter}
                  barGap={4}
                >
                  <XAxis
                    dataKey="q"
                    tick={{
                      fontSize: 11,
                      fill: "#94A3B8",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    tick={{
                      fontSize: 11,
                      fill: "#94A3B8",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip
                    cursor={{
                      fill: "#F5F6FA",
                    }}
                    contentStyle={{
                      borderRadius: 10,
                      border: "1px solid #E2E8F0",
                      fontSize: 12,
                    }}
                  />

                  <Bar
                    dataKey="target"
                    fill="#E5E9F5"
                    radius={[4, 4, 0, 0]}
                    name="Target"
                  />

                  <Bar
                    dataKey="collected"
                    fill="#3B4CCA"
                    radius={[4, 4, 0, 0]}
                    name="Collected"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* APPROVALS */}
          <div className={styles.card}>

            <CardHeader
              title="Pending approvals"
              control="Today"
            />

            <div className={styles.approvalList}>
              {approvals.map((approval) => {
                const tone = toneMap[approval.tagTone];

                return (
                  <div
                    key={approval.name}
                    className={styles.approvalItem}
                  >
                    <div className={styles.approvalTop}>

                      <p className={styles.approvalName}>
                        {approval.name}

                        <span
                          className={styles.approvalTag}
                          style={{
                            background: tone.bg,
                            color: tone.fg,
                          }}
                        >
                          {approval.tag}
                        </span>
                      </p>

                      <div className={styles.approvalActions}>
                        <button
                          className={`${styles.approvalButton} ${styles.approve}`}
                        >
                          <CheckCircle2 size={13} />
                        </button>

                        <button
                          className={`${styles.approvalButton} ${styles.reject}`}
                        >
                          <XCircle size={13} />
                        </button>
                      </div>
                    </div>

                    <p className={styles.approvalRole}>
                      {approval.role} · {approval.detail}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className={styles.quickActionsGrid}>
          {quickActions.map((action) => {
            const tone = toneMap[action.tone];
            const Icon = action.icon;

            return (
              <button
                key={action.label}
                className={styles.quickAction}
                style={{
                  background: tone.bg,
                }}
              >
                <span className={styles.quickActionLeft}>

                  <span
                    className={styles.quickActionIcon}
                    style={{
                      background: tone.icon,
                    }}
                  >
                    <Icon size={16} />
                  </span>

                  <span
                    className={styles.quickActionLabel}
                    style={{
                      color: tone.fg,
                    }}
                  >
                    {action.label}
                  </span>
                </span>

                <ArrowUpRight
                  size={15}
                  style={{
                    color: tone.fg,
                  }}
                />
              </button>
            );
          })}
        </div>

        {/* EARNINGS / NOTICE / OUTSTANDING */}
        <div className={styles.threeColumnGrid}>

          {/* EARNINGS */}
          <div className={styles.card}>
            <p className={styles.smallLabel}>
              Total earnings
            </p>

            <p className={styles.largeValue}>
              KD 64,522
            </p>

            <div className={styles.earningsChart}>
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <AreaChart data={earnings}>
                  <defs>
                    <linearGradient
                      id="earningsGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#3B4CCA"
                        stopOpacity={0.3}
                      />

                      <stop
                        offset="100%"
                        stopColor="#3B4CCA"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>

                  <Area
                    type="monotone"
                    dataKey="v"
                    stroke="#3B4CCA"
                    strokeWidth={2}
                    fill="url(#earningsGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* NOTICE */}
          <div className={styles.card}>

            <CardHeader
              title="Notice board"
              control="View all"
            />

            <div className={styles.noticeList}>
              {notices.map((notice) => (
                <div
                  key={notice.title}
                  className={styles.noticeItem}
                >
                  <div>
                    <p className={styles.noticeTitle}>
                      {notice.title}
                    </p>

                    <p className={styles.noticeDate}>
                      Added on: {notice.added}
                    </p>
                  </div>

                  <span className={styles.noticeChip}>
                    {notice.chip}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* OUTSTANDING */}
          <div className={styles.outstandingStack}>

            <div className={styles.outstandingCard}>
              <div>
                <p className={styles.smallLabel}>
                  Total outstanding
                </p>

                <p className={styles.outstandingValue}>
                  KD 4,566
                </p>
              </div>

              <span
                className={`${styles.outstandingChange} ${styles.danger}`}
              >
                1.2%
              </span>
            </div>

            <div className={styles.outstandingCard}>
              <div>
                <p className={styles.smallLabel}>
                  Fine / shrinkage recovered
                </p>

                <p className={styles.outstandingValue}>
                  KD 456
                </p>
              </div>

              <span
                className={`${styles.outstandingChange} ${styles.success}`}
              >
                1.2%
              </span>
            </div>

          </div>
        </div>

        {/* CATEGORIES / ACTIVITY / TODO */}
        <div className={styles.threeColumnGrid}>

          {/* CATEGORIES */}
          <div className={styles.card}>

            <CardHeader
              title="Top categories"
              control="This month"
            />

            <div className={styles.categoryInfo}>
              Share of total units sold this month, by category.
            </div>

            <div className={styles.categoryList}>
              {topCategories.map((category) => (
                <div
                  key={category.name}
                  className={styles.categoryRow}
                >
                  <div className={styles.categoryLabel}>
                    <span>{category.name}</span>
                    <span>{category.pct}%</span>
                  </div>

                  <div className={styles.categoryProgress}>
                    <div
                      className={styles.categoryBar}
                      style={{
                        width: `${category.pct}%`,
                        background: category.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ACTIVITY */}
          <div className={styles.card}>

            <CardHeader
              title="Recent activity"
              control="This month"
            />

            <div className={styles.activityList}>
              {activity.map((item) => (
                <div
                  key={item.title}
                  className={styles.activityItem}
                >
                  <span className={styles.activityIcon}>
                    {item.img}
                  </span>

                  <div>
                    <p className={styles.activityTitle}>
                      {item.title}
                    </p>

                    <p className={styles.activitySubtitle}>
                      {item.sub}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* TODO */}
          <div className={styles.card}>

            <CardHeader
              title="To-do"
              control="Today"
            />

            <div className={styles.todoList}>
              {todos.map((todo) => (
                <div
                  key={todo.title}
                  className={styles.todoItem}
                >
                  <div className={styles.todoLeft}>

                    <input
                      type="checkbox"
                      checked={todo.done}
                      readOnly
                      className={styles.todoCheckbox}
                    />

                    <div>
                      <p
                        className={`${styles.todoTitle} ${
                          todo.done
                            ? styles.todoCompleted
                            : ""
                        }`}
                      >
                        {todo.title}
                      </p>

                      <p className={styles.todoTime}>
                        {todo.time}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`${styles.todoStatus} ${
                      todo.status === "Completed"
                        ? styles.statusCompleted
                        : todo.status === "In progress"
                        ? styles.statusProgress
                        : styles.statusPending
                    }`}
                  >
                    {todo.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}