"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import DashboardNav from "../DashboardNav/DashboardNav";
import apiClient from "@/services/apiClient";
import { useCompany } from "@/context/CompanyContext";
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
  ArrowDownRight,
  Boxes,
  ShoppingCart,
  Building2,
  FileBarChart2,
  ChevronDown,
  Plus,
  Inbox,
  AlertCircle,
  RefreshCw,
  Award,
  PackageX,
  PlusCircle,
  CheckSquare,
} from "lucide-react";

import styles from "./DashboardHome.module.css";

/* =========================
   STAT CARD COMPONENT
========================= */
function StatCard({ label, value, delta, isPositive = true, onClick, interactive = false }) {
  return (
    <div
      className={`${styles.statCard} ${interactive ? styles.interactiveCard : ""}`}
      onClick={onClick}
      style={{ cursor: interactive ? "pointer" : "default" }}
    >
      <div>
        <p className={styles.statLabel}>{label}</p>
        <p className={styles.statValue}>{value}</p>
      </div>

      {delta && (
        <span
          className={`${styles.statDelta} ${
            isPositive ? styles.statPositive : styles.statNegative
          }`}
        >
          {isPositive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
          {delta}
        </span>
      )}
    </div>
  );
}

/* =========================
   EMPTY STATE COMPONENT
========================= */
function EmptyState({ icon: Icon = Inbox, title = "No data available", subtitle = "" }) {
  return (
    <div className={styles.emptyState}>
      <Icon size={28} style={{ color: "#94a3b8", opacity: 0.7 }} />
      <p className={styles.emptyStateText}>{title}</p>
      {subtitle && <p className={styles.emptyStateSubtext}>{subtitle}</p>}
    </div>
  );
}

/* =========================
   MAIN COMPONENT
========================= */
export default function DashboardHome() {
  const router = useRouter();
  const { user } = useCompany();

  // State Management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [selectedBranch, setSelectedBranch] = useState("ALL");
  const [datePeriod, setDatePeriod] = useState("30days");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  // Data States (All strictly dynamic, starting from null/empty)
  const [summary, setSummary] = useState({
    activeProductsFormatted: "0 Items",
    productDelta: "0.0%",
    productDeltaPositive: true,
    activeStaffFormatted: "0 Staff",
    staffDelta: "0.0%",
    staffDeltaPositive: true,
    lowStockFormatted: "0 Items",
    lowStockDelta: "0.0%",
    totalInventoryValueFormatted: "₹0",
    inventoryDelta: "0.0%",
    totalEarningsFormatted: "₹0",
    earningsDelta: "0.0%",
    earningsDeltaPositive: true,
    totalOutstandingFormatted: "₹0",
    shrinkageCost: 0,
    currency: "₹",
  });

  const [stockHealth, setStockHealth] = useState({
    inStock: 0,
    lowStock: 0,
    outOfStock: 0,
    totalSkus: 0,
    branches: [{ id: "ALL", name: "All Branches" }],
  });

  const [topPerformer, setTopPerformer] = useState(null);
  const [bestSellingProduct, setBestSellingProduct] = useState(null);
  const [revenueChart, setRevenueChart] = useState([]);
  const [earningsTrend, setEarningsTrend] = useState([]);
  const [topCategories, setTopCategories] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [notices, setNotices] = useState([]);
  const [todos, setTodos] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);

  // Modals for creating quick Notice or Todo
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [newNoticeTitle, setNewNoticeTitle] = useState("");
  const [newNoticeDesc, setNewNoticeDesc] = useState("");
  const [newNoticeDays, setNewNoticeDays] = useState(7);

  const [showTodoModal, setShowTodoModal] = useState(false);
  const [newTodoTitle, setNewTodoTitle] = useState("");
  const [newTodoPriority, setNewTodoPriority] = useState("Medium");

  // Fetch complete dynamic dashboard overview from backend
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        branchId: selectedBranch,
        period: datePeriod,
      };

      if (datePeriod === "custom" && customStart && customEnd) {
        params.startDate = customStart;
        params.endDate = customEnd;
      }

      const res = await apiClient.get("/dashboard/overview", { params });

      if (res.data?.success && res.data?.data) {
        const d = res.data.data;
        if (d.summary) setSummary(d.summary);
        if (d.stockHealth) setStockHealth(d.stockHealth);
        setTopPerformer(d.topPerformer || null);
        setBestSellingProduct(d.bestSellingProduct || null);
        setRevenueChart(d.revenueChart || []);
        setEarningsTrend(d.earningsTrend || []);
        setTopCategories(d.topCategories || []);
        setUpcomingEvents(d.upcomingEvents || []);
        setPendingApprovals(d.pendingApprovals || []);
        setNotices(d.notices || []);
        setTodos(d.todos || []);
        setRecentActivities(d.recentActivities || []);
      }
    } catch (err) {
      console.error("Dashboard overview fetch error:", err);
      setError("Unable to load live dashboard data. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }, [selectedBranch, datePeriod, customStart, customEnd]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Handle task checkbox toggle
  const handleToggleTodo = async (todoId, currentStatus) => {
    const newStatus = currentStatus === "Completed" ? "Pending" : "Completed";
    try {
      // Optimistic update
      setTodos((prev) =>
        prev.map((t) =>
          t.id === todoId ? { ...t, status: newStatus, done: newStatus === "Completed" } : t
        )
      );
      await apiClient.patch(`/dashboard/todos/${todoId}/toggle`, { status: newStatus });
    } catch (err) {
      console.error("Failed to toggle todo status:", err);
      fetchDashboardData();
    }
  };

  // Handle Create Notice
  const handleCreateNotice = async (e) => {
    e.preventDefault();
    if (!newNoticeTitle.trim()) return;

    try {
      const expDate = new Date();
      expDate.setDate(expDate.getDate() + Number(newNoticeDays || 7));

      await apiClient.post("/dashboard/notices", {
        title: newNoticeTitle,
        description: newNoticeDesc,
        branchId: selectedBranch,
        expiryDate: expDate.toISOString(),
      });

      setShowNoticeModal(false);
      setNewNoticeTitle("");
      setNewNoticeDesc("");
      fetchDashboardData();
    } catch (err) {
      console.error("Failed to create notice:", err);
    }
  };

  // Handle Create Todo
  const handleCreateTodo = async (e) => {
    e.preventDefault();
    if (!newTodoTitle.trim()) return;

    try {
      await apiClient.post("/dashboard/todos", {
        title: newTodoTitle,
        priority: newTodoPriority,
        branchId: selectedBranch,
      });

      setShowTodoModal(false);
      setNewTodoTitle("");
      fetchDashboardData();
    } catch (err) {
      console.error("Failed to create todo:", err);
    }
  };

  // Stock status pie data
  const dynamicStockStatus = [
    { name: "In stock", value: stockHealth.inStock || 0, color: "#3B4CCA" },
    { name: "Low stock", value: stockHealth.lowStock || 0, color: "#F5A623" },
    { name: "Out of stock", value: stockHealth.outOfStock || 0, color: "#E11D48" },
  ];

  const totalStockItems =
    (stockHealth.inStock || 0) + (stockHealth.lowStock || 0) + (stockHealth.outOfStock || 0);

  return (
    <div className={styles.dashboard}>
      <div className={styles.container}>
        <DashboardNav />

        {/* HEADER & FILTERS */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.pageTitle}>Retail Executive Overview</h1>
            <p className={styles.pageSubtitle}>
              Live System Telemetry & Operations • {user?.companyName || "Enterprise"}
            </p>
          </div>

          <div className={styles.controlsBar}>
            {/* Branch Selector */}
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className={styles.selectControl}
              aria-label="Filter by branch"
            >
              {(stockHealth.branches || [{ id: "ALL", name: "All Branches" }]).map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>

            {/* Date Range Selector */}
            <select
              value={datePeriod}
              onChange={(e) => setDatePeriod(e.target.value)}
              className={styles.selectControl}
              aria-label="Filter by date period"
            >
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="this_month">This Month</option>
              <option value="last_month">Last Month</option>
              <option value="this_year">This Year</option>
              <option value="custom">Custom Range</option>
            </select>

            {datePeriod === "custom" && (
              <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className={styles.selectControl}
                />
                <span style={{ fontSize: "12px", color: "#64748b" }}>to</span>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className={styles.selectControl}
                />
              </div>
            )}

            <button
              className={styles.notificationButton}
              onClick={fetchDashboardData}
              title="Refresh Dashboard Data"
            >
              <RefreshCw size={18} className={loading ? styles.skeletonPulse : ""} />
            </button>
          </div>
        </div>

        {/* ERROR STATE BANNER */}
        {error && (
          <div
            style={{
              padding: "16px",
              marginBottom: "24px",
              borderRadius: "12px",
              background: "#fef2f2",
              border: "1px solid #fecaca",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              color: "#991b1b",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
            <button
              onClick={fetchDashboardData}
              style={{
                padding: "6px 12px",
                background: "#dc2626",
                color: "#ffffff",
                border: "none",
                borderRadius: "6px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* 1. TOP 4 DYNAMIC KPIS */}
        <div className={styles.kpiGrid}>
          <StatCard
            label="Total Active Products"
            value={summary.activeProductsFormatted}
            delta={summary.productDelta}
            isPositive={summary.productDeltaPositive}
            onClick={() => router.push("/admin/products")}
            interactive={true}
          />

          <StatCard
            label="Active Staff Members"
            value={summary.activeStaffFormatted}
            delta={summary.staffDelta}
            isPositive={summary.staffDeltaPositive}
            onClick={() => router.push("/admin/employees")}
            interactive={true}
          />

          <StatCard
            label="Low Stock Warnings"
            value={summary.lowStockFormatted}
            delta={summary.lowStockDelta}
            isPositive={false}
            onClick={() => router.push("/admin/inventory")}
            interactive={true}
          />

          <StatCard
            label="Total Inventory Value"
            value={summary.totalInventoryValueFormatted}
            delta={summary.inventoryDelta}
            isPositive={true}
            onClick={() => router.push("/admin/inventory")}
            interactive={true}
          />
        </div>

        {/* 2. UPCOMING DELIVERIES / TOP HIGHLIGHTS / STOCK HEALTH */}
        <div className={styles.threeColumnGrid}>
          {/* UPCOMING EVENTS / DELIVERIES */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Upcoming Schedule</h3>
              <span style={{ fontSize: "12px", color: "#64748b" }}>Live</span>
            </div>

            <div className={styles.deliveryList}>
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map((delivery, index) => (
                  <div
                    key={index}
                    className={`${styles.deliveryItem} ${
                      delivery.tone === "rose" ? styles.deliveryRose : ""
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
                ))
              ) : (
                <EmptyState
                  icon={Calendar}
                  title="No upcoming events"
                  subtitle="No supplier deliveries or stock audits scheduled"
                />
              )}
            </div>
          </div>

          {/* HIGHLIGHTS (TOP PERFORMER & BEST-SELLING SKU) */}
          <div className={styles.highlightGrid}>
            {/* TOP PERFORMER */}
            <div className={`${styles.highlightCard} ${styles.highlightGreen}`}>
              {topPerformer ? (
                <div>
                  <p className={styles.highlightLabel}>Top performer</p>
                  <p className={styles.highlightTitle}>{topPerformer.name}</p>
                  <p className={styles.highlightDescription}>
                    {topPerformer.role} · {topPerformer.branch}
                  </p>
                  <p style={{ fontSize: "12px", color: "#065f46", marginTop: "8px", fontWeight: "600" }}>
                    {topPerformer.detail}
                  </p>
                </div>
              ) : (
                <div>
                  <p className={styles.highlightLabel}>Top performer</p>
                  <p className={styles.highlightTitle} style={{ fontSize: "16px", color: "#64748b" }}>
                    No performance data
                  </p>
                  <p className={styles.highlightDescription}>
                    Transactions will rank top staff automatically.
                  </p>
                </div>
              )}
              <div className={styles.highlightIcon}>🏆</div>
            </div>

            {/* BEST-SELLING SKU */}
            <div className={`${styles.highlightCard} ${styles.highlightBlue}`}>
              {bestSellingProduct ? (
                <div>
                  <p className={styles.highlightLabel}>Best-selling SKU</p>
                  <p className={styles.highlightTitle}>{bestSellingProduct.name}</p>
                  <p className={styles.highlightDescription}>
                    {bestSellingProduct.category} · {bestSellingProduct.unitsSold} units sold
                  </p>
                </div>
              ) : (
                <div>
                  <p className={styles.highlightLabel}>Best-selling SKU</p>
                  <p className={styles.highlightTitle} style={{ fontSize: "16px", color: "#64748b" }}>
                    No sales data available
                  </p>
                  <p className={styles.highlightDescription}>
                    Completed sales will identify top products.
                  </p>
                </div>
              )}
              <div className={styles.highlightIcon}>🛒</div>
            </div>
          </div>

          {/* STOCK HEALTH */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Stock health</h3>
              <span style={{ fontSize: "12px", color: "#64748b" }}>
                {selectedBranch === "ALL" ? "All Branches" : "Selected Outlet"}
              </span>
            </div>

            <div className={styles.stockHealth}>
              <div className={styles.stockChart}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dynamicStockStatus}
                      dataKey="value"
                      innerRadius={34}
                      outerRadius={52}
                      paddingAngle={2}
                    >
                      {dynamicStockStatus.map((item) => (
                        <Cell key={item.name} fill={item.color} stroke="none" />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className={styles.stockList}>
                {dynamicStockStatus.map((item) => (
                  <div key={item.name} className={styles.stockRow}>
                    <span className={styles.stockName}>
                      <span className={styles.stockDot} style={{ background: item.color }} />
                      {item.name}
                    </span>
                    <span className={styles.stockValue}>{item.value}</span>
                  </div>
                ))}
                <p className={styles.stockTotal}>
                  {stockHealth.totalSkus || totalStockItems} SKUs tracked
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 3. REVENUE COLLECTION CHART & PENDING APPROVALS */}
        <div className={styles.twoColumnGrid}>
          {/* REVENUE CHART */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Revenue collection</h3>
              <span style={{ fontSize: "12px", color: "#64748b" }}>Quarterly Trends</span>
            </div>

            <div className={styles.revenueChart}>
              {revenueChart.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueChart} barGap={4}>
                    <XAxis
                      dataKey="q"
                      tick={{ fontSize: 11, fill: "#94A3B8" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#94A3B8" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: "#F5F6FA" }}
                      contentStyle={{
                        borderRadius: 10,
                        border: "1px solid #E2E8F0",
                        fontSize: 12,
                      }}
                      formatter={(val) => [`₹${Number(val).toLocaleString()}`, "Amount"]}
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
              ) : (
                <EmptyState
                  icon={FileBarChart2}
                  title="No revenue data available"
                  subtitle="Complete sales and invoices to generate telemetry"
                />
              )}
            </div>
          </div>

          {/* PENDING APPROVALS */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Pending approvals</h3>
              <span style={{ fontSize: "12px", color: "#64748b" }}>
                {pendingApprovals.length} pending
              </span>
            </div>

            <div className={styles.approvalList}>
              {pendingApprovals.length > 0 ? (
                pendingApprovals.map((approval) => (
                  <div key={approval.id} className={styles.approvalItem}>
                    <div className={styles.approvalTop}>
                      <p className={styles.approvalName}>
                        {approval.name}
                        <span
                          className={styles.approvalTag}
                          style={{
                            background: approval.tagTone === "rose" ? "#FBE7EA" : "#FCEFD9",
                            color: approval.tagTone === "rose" ? "#9A1B34" : "#8A5A00",
                          }}
                        >
                          {approval.tag}
                        </span>
                      </p>

                      <div className={styles.approvalActions}>
                        <button
                          className={`${styles.approvalButton} ${styles.approve}`}
                          onClick={() => router.push("/admin/purchases")}
                          title="View & Approve"
                        >
                          <CheckCircle2 size={13} />
                        </button>
                      </div>
                    </div>

                    <p className={styles.approvalRole}>
                      {approval.role} · {approval.detail} · {approval.date}
                    </p>
                  </div>
                ))
              ) : (
                <EmptyState
                  icon={CheckCircle2}
                  title="No pending approvals"
                  subtitle="All orders and requests are approved"
                />
              )}
            </div>
          </div>
        </div>

        {/* 4. QUICK ACTIONS */}
        <div className={styles.quickActionsGrid}>
          <button
            className={styles.quickAction}
            style={{ background: "#FCEFD9" }}
            onClick={() => router.push("/admin/inventory")}
          >
            <span className={styles.quickActionLeft}>
              <span className={styles.quickActionIcon} style={{ background: "#F5A623" }}>
                <Boxes size={16} />
              </span>
              <span className={styles.quickActionLabel} style={{ color: "#8A5A00" }}>
                Inventory
              </span>
            </span>
            <ArrowUpRight size={15} style={{ color: "#8A5A00" }} />
          </button>

          <button
            className={styles.quickAction}
            style={{ background: "#E1F5EC" }}
            onClick={() => router.push("/admin/sales")}
          >
            <span className={styles.quickActionLeft}>
              <span className={styles.quickActionIcon} style={{ background: "#16A34A" }}>
                <ShoppingCart size={16} />
              </span>
              <span className={styles.quickActionLabel} style={{ color: "#0F6E4E" }}>
                Orders & Sales
              </span>
            </span>
            <ArrowUpRight size={15} style={{ color: "#0F6E4E" }} />
          </button>

          <button
            className={styles.quickAction}
            style={{ background: "#FBE7EA" }}
            onClick={() => router.push("/admin/suppliers")}
          >
            <span className={styles.quickActionLeft}>
              <span className={styles.quickActionIcon} style={{ background: "#E11D48" }}>
                <Building2 size={16} />
              </span>
              <span className={styles.quickActionLabel} style={{ color: "#9A1B34" }}>
                Suppliers
              </span>
            </span>
            <ArrowUpRight size={15} style={{ color: "#9A1B34" }} />
          </button>

          <button
            className={styles.quickAction}
            style={{ background: "#E6F0FD" }}
            onClick={() => router.push("/admin/reports")}
          >
            <span className={styles.quickActionLeft}>
              <span className={styles.quickActionIcon} style={{ background: "#3B4CCA" }}>
                <FileBarChart2 size={16} />
              </span>
              <span className={styles.quickActionLabel} style={{ color: "#134487" }}>
                Reports & Audit
              </span>
            </span>
            <ArrowUpRight size={15} style={{ color: "#134487" }} />
          </button>
        </div>

        {/* 5. EARNINGS / NOTICE BOARD / OUTSTANDING */}
        <div className={styles.threeColumnGrid}>
          {/* TOTAL EARNINGS */}
          <div className={styles.card}>
            <p className={styles.smallLabel}>Total earnings (Period)</p>
            <p className={styles.largeValue}>{summary.totalEarningsFormatted}</p>

            <div className={styles.earningsChart}>
              {earningsTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={earningsTrend}>
                    <defs>
                      <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3B4CCA" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#3B4CCA" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" hide />
                    <Area
                      type="monotone"
                      dataKey="earnings"
                      stroke="#3B4CCA"
                      strokeWidth={2}
                      fill="url(#earningsGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState icon={FileBarChart2} title="No earnings data" />
              )}
            </div>
          </div>

          {/* NOTICE BOARD */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Notice board</h3>
              <button
                className={styles.addInlineBtn}
                onClick={() => setShowNoticeModal(true)}
              >
                <Plus size={13} /> Add
              </button>
            </div>

            <div className={styles.noticeList}>
              {notices.length > 0 ? (
                notices.map((notice) => (
                  <div key={notice.id} className={styles.noticeItem}>
                    <div>
                      <p className={styles.noticeTitle}>{notice.title}</p>
                      <p className={styles.noticeDate}>Added on: {notice.added}</p>
                    </div>
                    <span className={styles.noticeChip}>{notice.chip}</span>
                  </div>
                ))
              ) : (
                <EmptyState
                  icon={Inbox}
                  title="No active notices"
                  subtitle="Add announcements for staff and branch members"
                />
              )}
            </div>
          </div>

          {/* OUTSTANDING / SHRINKAGE */}
          <div className={styles.outstandingStack}>
            <div className={styles.outstandingCard}>
              <div>
                <p className={styles.smallLabel}>Total outstanding</p>
                <p className={styles.outstandingValue}>{summary.totalOutstandingFormatted}</p>
              </div>
              <span className={`${styles.outstandingChange} ${styles.danger}`}>
                Unpaid Invoices
              </span>
            </div>

            <div className={styles.outstandingCard}>
              <div>
                <p className={styles.smallLabel}>Damage / Shrinkage loss</p>
                <p className={styles.outstandingValue}>
                  {summary.currency}
                  {(summary.shrinkageCost || 0).toLocaleString("en-IN")}
                </p>
              </div>
              <span className={`${styles.outstandingChange} ${styles.success}`}>
                {summary.shrinkageCost > 0 ? "Recorded" : "Zero Loss"}
              </span>
            </div>
          </div>
        </div>

        {/* 6. TOP CATEGORIES / RECENT ACTIVITY / TODO */}
        <div className={styles.threeColumnGrid}>
          {/* CATEGORIES */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Top categories</h3>
              <span style={{ fontSize: "12px", color: "#64748b" }}>Units Sold Share</span>
            </div>

            <div className={styles.categoryInfo}>
              Share of total units sold in the selected period.
            </div>

            <div className={styles.categoryList}>
              {topCategories.length > 0 ? (
                topCategories.map((category) => (
                  <div key={category.name} className={styles.categoryRow}>
                    <div className={styles.categoryLabel}>
                      <span>{category.name}</span>
                      <span>
                        {category.units} units ({category.pct}%)
                      </span>
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
                ))
              ) : (
                <EmptyState
                  icon={Inbox}
                  title="No category sales data available"
                  subtitle="Category volume will calculate upon sales completion"
                />
              )}
            </div>
          </div>

          {/* RECENT ACTIVITY */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Recent activity</h3>
              <span style={{ fontSize: "12px", color: "#64748b" }}>Live Audit Log</span>
            </div>

            <div className={styles.activityList}>
              {recentActivities.length > 0 ? (
                recentActivities.map((item, index) => (
                  <div key={item.id || index} className={styles.activityItem}>
                    <span className={styles.activityIcon}>{item.icon}</span>
                    <div>
                      <p className={styles.activityTitle}>{item.title}</p>
                      <p className={styles.activitySubtitle}>{item.sub}</p>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState
                  icon={Inbox}
                  title="No recent activity"
                  subtitle="System actions will log here in real-time"
                />
              )}
            </div>
          </div>

          {/* TODO LIST */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>To-do list</h3>
              <button
                className={styles.addInlineBtn}
                onClick={() => setShowTodoModal(true)}
              >
                <Plus size={13} /> Add
              </button>
            </div>

            <div className={styles.todoList}>
              {todos.length > 0 ? (
                todos.map((todo) => (
                  <div key={todo.id} className={styles.todoItem}>
                    <div className={styles.todoLeft}>
                      <input
                        type="checkbox"
                        checked={todo.done}
                        onChange={() => handleToggleTodo(todo.id, todo.status)}
                        className={styles.todoCheckbox}
                        aria-label={`Mark ${todo.title} as completed`}
                      />

                      <div>
                        <p
                          className={`${styles.todoTitle} ${
                            todo.done ? styles.todoCompleted : ""
                          }`}
                        >
                          {todo.title}
                        </p>
                        <p className={styles.todoTime}>{todo.time}</p>
                      </div>
                    </div>

                    <span
                      className={`${styles.todoStatus} ${
                        todo.done
                          ? styles.statusCompleted
                          : todo.status === "In progress"
                          ? styles.statusProgress
                          : styles.statusPending
                      }`}
                    >
                      {todo.status}
                    </span>
                  </div>
                ))
              ) : (
                <EmptyState
                  icon={CheckSquare}
                  title="No tasks for today"
                  subtitle="Add operational tasks and reminders above"
                />
              )}
            </div>
          </div>
        </div>

        {/* MODAL: ADD NOTICE */}
        {showNoticeModal && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(15, 23, 42, 0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 100,
              padding: "16px",
            }}
          >
            <div
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "16px",
                padding: "24px",
                maxWidth: "480px",
                width: "100%",
                boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
              }}
            >
              <h3 style={{ margin: "0 0 16px 0", fontSize: "18px", color: "#0f172a" }}>
                Add Company Notice
              </h3>
              <form onSubmit={handleCreateNotice}>
                <div style={{ marginBottom: "12px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>
                    Notice Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. New pricing policy rollout"
                    value={newNoticeTitle}
                    onChange={(e) => setNewNoticeTitle(e.target.value)}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                  />
                </div>

                <div style={{ marginBottom: "12px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>
                    Description
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Notice details..."
                    value={newNoticeDesc}
                    onChange={(e) => setNewNoticeDesc(e.target.value)}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                  />
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>
                    Expires In (Days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newNoticeDays}
                    onChange={(e) => setNewNoticeDays(e.target.value)}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                  />
                </div>

                <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                  <button
                    type="button"
                    onClick={() => setShowNoticeModal(false)}
                    style={{ padding: "8px 16px", background: "#f1f5f9", border: "none", borderRadius: "8px", cursor: "pointer" }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{ padding: "8px 16px", background: "#3b4cca", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }}
                  >
                    Post Notice
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: ADD TODO */}
        {showTodoModal && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(15, 23, 42, 0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 100,
              padding: "16px",
            }}
          >
            <div
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "16px",
                padding: "24px",
                maxWidth: "440px",
                width: "100%",
                boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
              }}
            >
              <h3 style={{ margin: "0 0 16px 0", fontSize: "18px", color: "#0f172a" }}>
                Add New Task / To-Do
              </h3>
              <form onSubmit={handleCreateTodo}>
                <div style={{ marginBottom: "12px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>
                    Task Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Review supplier inventory restock"
                    value={newTodoTitle}
                    onChange={(e) => setNewTodoTitle(e.target.value)}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                  />
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>
                    Priority
                  </label>
                  <select
                    value={newTodoPriority}
                    onChange={(e) => setNewTodoPriority(e.target.value)}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                  >
                    <option value="Low">Low Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="High">High Priority</option>
                  </select>
                </div>

                <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                  <button
                    type="button"
                    onClick={() => setShowTodoModal(false)}
                    style={{ padding: "8px 16px", background: "#f1f5f9", border: "none", borderRadius: "8px", cursor: "pointer" }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{ padding: "8px 16px", background: "#3b4cca", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }}
                  >
                    Create Task
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}