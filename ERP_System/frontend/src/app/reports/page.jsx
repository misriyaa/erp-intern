"use client";

import { useState, useEffect } from "react";
import {
  FiTrendingUp,
  FiShoppingBag,
  FiFileText,
  FiDollarSign,
  FiPackage,
  FiAlertTriangle,
  FiSearch,
  FiGrid,
} from "react-icons/fi";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import toast from "react-hot-toast";

import {
  getSalesReport,
  getPurchaseReport,
  getInventoryReport,
  getReportFilters,
} from "@/services/reportService";

import DateFilter from "./components/DateFilter";
import ReportCard from "./components/ReportCard";
import ExportButton from "./components/ExportButton";
import { useCompany } from "@/context/CompanyContext";
import apiClient from "@/services/apiClient";
import "./reports.css";

export default function ReportsPage() {
  const { isGym } = useCompany();
  const [activeTab, setActiveTab] = useState("sales"); // 'sales' | 'purchases' | 'inventory' for retail, 'memberships' | 'payments' | 'attendance' for gym

  // Read URL search params safely without Suspense issues
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    if (isGym) {
      if (tab && ["memberships", "payments", "attendance"].includes(tab)) {
        setActiveTab(tab);
      } else {
        setActiveTab("memberships");
      }
    } else {
      if (tab && ["sales", "purchases", "inventory"].includes(tab)) {
        setActiveTab(tab);
      } else {
        setActiveTab("sales");
      }
    }
  }, [isGym]);

  // Date and grouping states
  const [dateState, setDateState] = useState({
    startDate: "",
    endDate: "",
    preset: "last30",
    groupBy: "day",
  });

  // Dynamic filter states
  const [selectedFilters, setSelectedFilters] = useState({
    customerId: "",
    supplierId: "",
    warehouseId: "",
  });

  // Filter dropdown data
  const [filtersData, setFiltersData] = useState({
    customers: [],
    suppliers: [],
    warehouses: [],
  });

  // Report results state
  const [reportData, setReportData] = useState(null);
  const [gymMembers, setGymMembers] = useState([]);
  const [gymPayments, setGymPayments] = useState([]);
  const [gymAttendance, setGymAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Initialize dates to last 30 days
  useEffect(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 30);

    const formatDate = (d) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    setDateState({
      startDate: formatDate(start),
      endDate: formatDate(end),
      preset: "last30",
      groupBy: "day",
    });

    // Load filter lookups
    const loadFilters = async () => {
      if (isGym) return;
      try {
        const response = await getReportFilters();
        if (response.success) {
          setFiltersData(response.data);
        }
      } catch (err) {
        console.error("Failed to load filter dropdowns", err);
      }
    };
    loadFilters();
  }, [isGym]);

  // Fetch Gym data when in Gym mode
  useEffect(() => {
    if (!isGym) return;

    const fetchGymData = async () => {
      setLoading(true);
      try {
        if (activeTab === "memberships") {
          const res = await apiClient.get("/gym/members");
          if (res.data.success) {
            setGymMembers(res.data.data || []);
          }
        } else if (activeTab === "payments") {
          const res = await apiClient.get("/gym/payments");
          if (res.data.success) {
            setGymPayments(res.data.data || []);
          }
        } else if (activeTab === "attendance") {
          const res = await apiClient.get("/gym/attendance");
          if (res.data.success) {
            setGymAttendance(res.data.data || []);
          }
        }
      } catch (err) {
        console.error("Failed to load Gym reports data:", err);
        toast.error("Failed to load Gym reports data");
      } finally {
        setLoading(false);
      }
    };

    fetchGymData();
  }, [isGym, activeTab]);

  // Fetch report data on tab, date, or filter changes (Retail / Textile)
  useEffect(() => {
    if (isGym) return;
    if (!dateState.startDate || !dateState.endDate) return;

    const fetchReport = async () => {
      setLoading(true);
      try {
        let response;
        if (activeTab === "sales") {
          response = await getSalesReport({
            startDate: dateState.startDate,
            endDate: dateState.endDate,
            groupBy: dateState.groupBy,
            customerId: selectedFilters.customerId,
          });
        } else if (activeTab === "purchases") {
          response = await getPurchaseReport({
            startDate: dateState.startDate,
            endDate: dateState.endDate,
            groupBy: dateState.groupBy,
            supplierId: selectedFilters.supplierId,
          });
        } else if (activeTab === "inventory") {
          response = await getInventoryReport({
            warehouseId: selectedFilters.warehouseId,
          });
        }

        if (response?.success) {
          setReportData(response.data);
        } else {
          toast.error("Failed to fetch report data");
        }
      } catch (err) {
        console.error(err);
        toast.error(err.response?.data?.message || "An error occurred while fetching reports");
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [isGym, activeTab, dateState, selectedFilters]);

  // Reset local queries when switching tabs
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchQuery("");
  };

  // Helper: format currency
  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(val || 0);
  };

  // Summary Metrics calculations
  const summary = reportData?.summary || {};
  const items = reportData?.items || [];
  const chartData = reportData?.chartData || [];

  // Client side search filter for the details table
  const filteredItems = isGym
    ? (activeTab === "memberships"
        ? gymMembers
            .filter((m) => {
              const q = searchQuery.toLowerCase();
              return (
                m.fullName?.toLowerCase().includes(q) ||
                m.memberId?.toLowerCase().includes(q) ||
                m.phone?.toLowerCase().includes(q) ||
                m.plan?.name?.toLowerCase().includes(q) ||
                m.status?.toLowerCase().includes(q)
              );
            })
            .map((m) => ({
              ...m,
              planName: m.plan?.name || "No Plan",
            }))
        : activeTab === "payments"
        ? gymPayments
            .filter((p) => {
              const q = searchQuery.toLowerCase();
              return (
                p.receiptNumber?.toLowerCase().includes(q) ||
                p.paymentNumber?.toLowerCase().includes(q) ||
                p.member?.fullName?.toLowerCase().includes(q) ||
                p.plan?.name?.toLowerCase().includes(q) ||
                p.status?.toLowerCase().includes(q)
              );
            })
            .map((p) => ({
              ...p,
              memberName: p.member?.fullName || "Unknown Member",
              planName: p.plan?.name || "No Plan",
            }))
        : gymAttendance
            .filter((a) => {
              const q = searchQuery.toLowerCase();
              return (
                a.member?.fullName?.toLowerCase().includes(q) ||
                a.member?.memberId?.toLowerCase().includes(q) ||
                a.status?.toLowerCase().includes(q)
              );
            })
            .map((a) => ({
              ...a,
              memberName: a.member?.fullName || "Unknown Member",
              memberId: a.member?.memberId || "N/A",
            }))
      )
    : items.filter((item) => {
        const query = searchQuery.toLowerCase();
        if (activeTab === "sales") {
          return (
            item.orderNumber?.toLowerCase().includes(query) ||
            item.customerName?.toLowerCase().includes(query) ||
            item.status?.toLowerCase().includes(query)
          );
        }
        if (activeTab === "purchases") {
          return (
            item.purchaseNo?.toLowerCase().includes(query) ||
            item.supplierName?.toLowerCase().includes(query) ||
            item.warehouseName?.toLowerCase().includes(query) ||
            item.status?.toLowerCase().includes(query)
          );
        }
        if (activeTab === "inventory") {
          return (
            item.productName?.toLowerCase().includes(query) ||
            item.sku?.toLowerCase().includes(query) ||
            item.categoryName?.toLowerCase().includes(query) ||
            item.warehouseName?.toLowerCase().includes(query) ||
            item.status?.toLowerCase().includes(query)
          );
        }
        return true;
      });

  // Table columns definition for exporting
  const getExportColumns = () => {
    if (isGym) {
      if (activeTab === "memberships") {
        return [
          { header: "Member Name", key: "fullName" },
          { header: "Member ID", key: "memberId" },
          { header: "Phone", key: "phone" },
          { header: "Email", key: "email" },
          { header: "Join Date", key: "joinDate", isDate: true },
          { header: "Plan", key: "planName" },
          { header: "Status", key: "status" },
        ];
      }
      if (activeTab === "payments") {
        return [
          { header: "Receipt Number", key: "receiptNumber" },
          { header: "Member Name", key: "memberName" },
          { header: "Plan Name", key: "planName" },
          { header: "Paid Amount", key: "paidAmount", isCurrency: true },
          { header: "Pending Amount", key: "pendingAmount", isCurrency: true },
          { header: "Payment Date", key: "paymentDate", isDate: true },
          { header: "Payment Method", key: "paymentMethod" },
          { header: "Status", key: "status" },
        ];
      }
      if (activeTab === "attendance") {
        return [
          { header: "Member Name", key: "memberName" },
          { header: "Member ID", key: "memberId" },
          { header: "Date", key: "date", isDate: true },
          { header: "Check In Time", key: "checkInTime", isDate: true },
          { header: "Check Out Time", key: "checkOutTime", isDate: true },
          { header: "Status", key: "status" },
        ];
      }
    }

    if (activeTab === "sales") {
      return [
        { header: "Order Number", key: "orderNumber" },
        { header: "Order Date", key: "orderDate", isDate: true },
        { header: "Customer Name", key: "customerName" },
        { header: "Total Amount", key: "totalAmount", isCurrency: true },
        { header: "Tax Amount", key: "taxAmount", isCurrency: true },
        { header: "Discount Amount", key: "discountAmount", isCurrency: true },
        { header: "Net Amount", key: "netAmount", isCurrency: true },
        { header: "Status", key: "status" },
      ];
    }
    if (activeTab === "purchases") {
      return [
        { header: "Purchase Number", key: "purchaseNo" },
        { header: "Purchase Date", key: "purchaseDate", isDate: true },
        { header: "Supplier Name", key: "supplierName" },
        { header: "Warehouse Name", key: "warehouseName" },
        { header: "Total Amount", key: "totalAmount", isCurrency: true },
        { header: "Status", key: "status" },
      ];
    }
    // inventory
    return [
      { header: "Product Name", key: "productName" },
      { header: "SKU", key: "sku" },
      { header: "Category", key: "categoryName" },
      { header: "Warehouse", key: "warehouseName" },
      { header: "Current Stock", key: "quantity" },
      { header: "Reorder Level", key: "reorderLevel" },
      { header: "Cost Price", key: "costPrice", isCurrency: true },
      { header: "Selling Price", key: "sellingPrice", isCurrency: true },
      { header: "Valuation (Cost)", key: "valuationCost", isCurrency: true },
      { header: "Status", key: "status" },
    ];
  };

  // Gym membership plan counts for BarChart
  const gymPlanCounts = {};
  gymMembers.forEach((m) => {
    const planName = m.plan?.name || "No Plan";
    gymPlanCounts[planName] = (gymPlanCounts[planName] || 0) + 1;
  });
  const gymPlanChartData = Object.keys(gymPlanCounts).map((name) => ({
    name,
    Members: gymPlanCounts[name],
  }));

  // Gym payments revenue over time for AreaChart
  const gymPaymentSumsByDate = {};
  gymPayments.forEach((p) => {
    const dateStr = new Date(p.paymentDate).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    gymPaymentSumsByDate[dateStr] = (gymPaymentSumsByDate[dateStr] || 0) + Number(p.paidAmount || 0);
  });
  const gymPaymentChartData = Object.keys(gymPaymentSumsByDate)
    .map((date) => ({
      date,
      Revenue: gymPaymentSumsByDate[date],
    }))
    .reverse()
    .slice(-10);

  // Gym attendance check-ins over time for AreaChart
  const gymAttendanceByDate = {};
  gymAttendance.forEach((a) => {
    const dateStr = new Date(a.date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    gymAttendanceByDate[dateStr] = (gymAttendanceByDate[dateStr] || 0) + 1;
  });
  const gymAttendanceChartData = Object.keys(gymAttendanceByDate)
    .map((date) => ({
      date,
      Checkins: gymAttendanceByDate[date],
    }))
    .reverse()
    .slice(-10);

  return (
    <div className="reports-page-wrapper p-6">
      
      {/* Header section */}
      <div className="reports-header-section">
        <h1>{isGym ? "Gym Reports & Analytics" : "Reports & Analytics"}</h1>
        <p>
          {isGym
            ? "Monitor your gym membership growth, fee payments, and attendance logs in real-time."
            : "Monitor your sales volume, purchase transactions, and inventory values in real-time."}
        </p>
      </div>

      {/* Tabs navigation */}
      <div className="reports-nav-tabs">
        {isGym ? (
          <>
            <button
              className={`reports-tab-item ${activeTab === "memberships" ? "active" : ""}`}
              onClick={() => handleTabChange("memberships")}
            >
              <FiGrid />
              <span>Memberships</span>
            </button>
            <button
              className={`reports-tab-item ${activeTab === "payments" ? "active" : ""}`}
              onClick={() => handleTabChange("payments")}
            >
              <FiDollarSign />
              <span>Payments & Revenue</span>
            </button>
            <button
              className={`reports-tab-item ${activeTab === "attendance" ? "active" : ""}`}
              onClick={() => handleTabChange("attendance")}
            >
              <FiPackage />
              <span>Attendance</span>
            </button>
          </>
        ) : (
          <>
            <button
              className={`reports-tab-item ${activeTab === "sales" ? "active" : ""}`}
              onClick={() => handleTabChange("sales")}
            >
              <FiDollarSign />
              <span>Sales Reports</span>
            </button>
            <button
              className={`reports-tab-item ${activeTab === "purchases" ? "active" : ""}`}
              onClick={() => handleTabChange("purchases")}
            >
              <FiShoppingBag />
              <span>Purchase Reports</span>
            </button>
            <button
              className={`reports-tab-item ${activeTab === "inventory" ? "active" : ""}`}
              onClick={() => handleTabChange("inventory")}
            >
              <FiPackage />
              <span>Inventory Reports</span>
            </button>
          </>
        )}
      </div>

      {/* Dynamic Filter Section (Retail only) */}
      {!isGym && (
        <DateFilter
          filterType={activeTab}
          filtersData={filtersData}
          selectedFilters={selectedFilters}
          onChangeFilters={setSelectedFilters}
          startDate={dateState.startDate}
          endDate={dateState.endDate}
          groupBy={dateState.groupBy}
          selectedPreset={dateState.preset}
          onChangeDate={setDateState}
        />
      )}

      {/* Loading indicator */}
      {loading ? (
        <div className="reports-loading-container bg-white rounded-xl border border-gray-200">
          <div className="reports-loader"></div>
          <p className="text-gray-500 font-medium">Fetching analysis data...</p>
        </div>
      ) : (
        <>
          {/* KPI Summary Cards */}
          <div className="reports-kpi-grid">
            {isGym ? (
              <>
                {activeTab === "memberships" && (
                  <>
                    <ReportCard
                      title="Total Members"
                      value={gymMembers.length}
                      subtext="Registered members"
                      type="sales"
                      icon={<FiGrid size={22} />}
                    />
                    <ReportCard
                      title="Active Members"
                      value={gymMembers.filter((m) => m.status === "ACTIVE").length}
                      subtext="Currently training"
                      type="purchases"
                      icon={<FiTrendingUp size={22} />}
                    />
                    <ReportCard
                      title="Inactive/Expired"
                      value={gymMembers.filter((m) => m.status === "EXPIRED" || m.status === "INACTIVE").length}
                      subtext="Requires renewal attention"
                      type="warning"
                      icon={<FiAlertTriangle size={22} />}
                    />
                  </>
                )}

                {activeTab === "payments" && (
                  <>
                    <ReportCard
                      title="Total Collected"
                      value={formatCurrency(
                        gymPayments.reduce((acc, p) => acc + Number(p.paidAmount || 0), 0)
                      )}
                      subtext="Received fees"
                      type="sales"
                      icon={<FiDollarSign size={22} />}
                    />
                    <ReportCard
                      title="Outstanding Balance"
                      value={formatCurrency(
                        gymPayments.reduce((acc, p) => acc + Number(p.pendingAmount || 0), 0)
                      )}
                      subtext="Pending fees"
                      type="warning"
                      icon={<FiAlertTriangle size={22} />}
                    />
                    <ReportCard
                      title="Transactions"
                      value={gymPayments.length}
                      subtext="Processed payments"
                      type="purchases"
                      icon={<FiFileText size={22} />}
                    />
                  </>
                )}

                {activeTab === "attendance" && (
                  <>
                    <ReportCard
                      title="Total Check-ins"
                      value={gymAttendance.length}
                      subtext="All-time visits"
                      type="inventory"
                      icon={<FiPackage size={22} />}
                    />
                    <ReportCard
                      title="Present Today"
                      value={
                        gymAttendance.filter((a) => {
                          const todayStr = new Date().toDateString();
                          return new Date(a.date).toDateString() === todayStr;
                        }).length
                      }
                      subtext="Checked in today"
                      type="sales"
                      icon={<FiTrendingUp size={22} />}
                    />
                  </>
                )}
              </>
            ) : (
              <>
                {activeTab === "sales" && (
                  <>
                    <ReportCard
                      title="Total Revenue"
                      value={formatCurrency(summary.totalSales)}
                      subtext="Net sales sum"
                      type="sales"
                      icon={<FiDollarSign size={22} />}
                    />
                    <ReportCard
                      title="Sales Orders"
                      value={summary.totalOrders || 0}
                      subtext="Completed orders"
                      type="purchases"
                      icon={<FiFileText size={22} />}
                    />
                    <ReportCard
                      title="Average Value"
                      value={formatCurrency(summary.averageOrderValue)}
                      subtext="Per transaction"
                      type="inventory"
                      icon={<FiTrendingUp size={22} />}
                    />
                    <ReportCard
                      title="Total Discounts"
                      value={formatCurrency(summary.totalDiscount)}
                      subtext="Saved by customers"
                      type="warning"
                      icon={<FiAlertTriangle size={22} />}
                    />
                  </>
                )}

                {activeTab === "purchases" && (
                  <>
                    <ReportCard
                      title="Total Spend"
                      value={formatCurrency(summary.totalPurchases)}
                      subtext="Purchasing expenditures"
                      type="purchases"
                      icon={<FiShoppingBag size={22} />}
                    />
                    <ReportCard
                      title="Purchase Orders"
                      value={summary.totalOrders || 0}
                      subtext="Supplier transactions"
                      type="sales"
                      icon={<FiFileText size={22} />}
                    />
                    <ReportCard
                      title="Average Purchase"
                      value={formatCurrency(summary.averageOrderValue)}
                      subtext="Spend per order"
                      type="inventory"
                      icon={<FiTrendingUp size={22} />}
                    />
                  </>
                )}

                {activeTab === "inventory" && (
                  <>
                    <ReportCard
                      title="Total Items"
                      value={summary.totalItems || 0}
                      subtext="Quantity in warehouses"
                      type="inventory"
                      icon={<FiPackage size={22} />}
                    />
                    <ReportCard
                      title="Valuation (Cost)"
                      value={formatCurrency(summary.totalValuationCost)}
                      subtext="Asset value at cost"
                      type="sales"
                      icon={<FiDollarSign size={22} />}
                    />
                    <ReportCard
                      title="Valuation (Retail)"
                      value={formatCurrency(summary.totalValuationRetail)}
                      subtext="Potential value at sell price"
                      type="purchases"
                      icon={<FiTrendingUp size={22} />}
                    />
                    <ReportCard
                      title="Low Stock Items"
                      value={summary.lowStockCount || 0}
                      subtext="Requires reordering"
                      type="warning"
                      icon={<FiAlertTriangle size={22} />}
                    />
                  </>
                )}
              </>
            )}
          </div>

          {/* Graphical Section */}
          {isGym ? (
            <>
              {activeTab === "memberships" && gymPlanChartData.length > 0 && (
                <div className="reports-chart-card">
                  <div className="chart-card-header">
                    <h3>Members by Membership Plan</h3>
                  </div>
                  <div className="chart-wrapper">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={gymPlanChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                        <Tooltip
                          contentStyle={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "8px" }}
                        />
                        <Legend />
                        <Bar dataKey="Members" fill="#ec4899" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {activeTab === "payments" && gymPaymentChartData.length > 0 && (
                <div className="reports-chart-card">
                  <div className="chart-card-header">
                    <h3>Revenue Received Over Time</h3>
                  </div>
                  <div className="chart-wrapper">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={gymPaymentChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="gymChartGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#ec4899" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                        <Tooltip
                          contentStyle={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "8px" }}
                          formatter={(value) => [formatCurrency(value), "Revenue"]}
                        />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="Revenue"
                          stroke="#db2777"
                          strokeWidth={3}
                          fillOpacity={1}
                          fill="url(#gymChartGradient)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {activeTab === "attendance" && gymAttendanceChartData.length > 0 && (
                <div className="reports-chart-card">
                  <div className="chart-card-header">
                    <h3>Check-ins Over Time</h3>
                  </div>
                  <div className="chart-wrapper">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={gymAttendanceChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="gymAttendGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                        <Tooltip
                          contentStyle={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "8px" }}
                        />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="Checkins"
                          stroke="#4f46e5"
                          strokeWidth={3}
                          fillOpacity={1}
                          fill="url(#gymAttendGradient)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </>
          ) : (
            activeTab !== "inventory" && chartData.length > 0 && (
              <div className="reports-chart-card">
                <div className="chart-card-header">
                  <h3>{activeTab === "sales" ? "Sales & Income Over Time" : "Purchase Expenses Over Time"}</h3>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 uppercase">
                    By {dateState.groupBy}
                  </span>
                </div>
                <div className="chart-wrapper">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop
                            offset="5%"
                            stopColor={activeTab === "sales" ? "#3b82f6" : "#10b981"}
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor={activeTab === "sales" ? "#3b82f6" : "#10b981"}
                            stopOpacity={0.0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <Tooltip
                        contentStyle={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "8px" }}
                        formatter={(value) => [formatCurrency(value), activeTab === "sales" ? "Sales" : "Purchases"]}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey={activeTab === "sales" ? "sales" : "purchases"}
                        stroke={activeTab === "sales" ? "#2563eb" : "#059669"}
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#chartGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )
          )}

          {/* Details Table Card */}
          <div className="reports-table-card">
            <div className="table-card-header">
              <h3>Detailed Records</h3>
              <div className="table-controls">
                
                {/* Search Bar */}
                <div className="relative flex items-center">
                  <input
                    type="text"
                    placeholder="Search records..."
                    className="table-search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Export Button */}
                <ExportButton
                  data={filteredItems}
                  columns={getExportColumns()}
                  filename={`${activeTab}_report_${dateState.startDate || "current"}`}
                />
              </div>
            </div>

            {filteredItems.length === 0 ? (
              <div className="empty-state">
                <FiGrid />
                <h4>No Records Found</h4>
                <p>Try modifying your filters or search keywords to display results.</p>
              </div>
            ) : (
              <div className="reports-table-container">
                <table className="reports-table">
                  <thead>
                    {isGym ? (
                      <>
                        {activeTab === "memberships" && (
                          <tr>
                            <th>Member Name</th>
                            <th>Member ID</th>
                            <th>Phone</th>
                            <th>Email</th>
                            <th>Join Date</th>
                            <th>Plan</th>
                            <th>Status</th>
                          </tr>
                        )}
                        {activeTab === "payments" && (
                          <tr>
                            <th>Receipt Number</th>
                            <th>Member Name</th>
                            <th>Plan</th>
                            <th>Amount Paid</th>
                            <th>Pending Balance</th>
                            <th>Payment Date</th>
                            <th>Method</th>
                            <th>Status</th>
                          </tr>
                        )}
                        {activeTab === "attendance" && (
                          <tr>
                            <th>Member Name</th>
                            <th>Member ID</th>
                            <th>Date</th>
                            <th>Check-In Time</th>
                            <th>Check-Out Time</th>
                            <th>Status</th>
                          </tr>
                        )}
                      </>
                    ) : (
                      <>
                        {activeTab === "sales" && (
                          <tr>
                            <th>Order Number</th>
                            <th>Order Date</th>
                            <th>Customer</th>
                            <th>Subtotal</th>
                            <th>Discount</th>
                            <th>Tax</th>
                            <th>Net Total</th>
                            <th>Status</th>
                          </tr>
                        )}
                        {activeTab === "purchases" && (
                          <tr>
                            <th>Purchase Number</th>
                            <th>Purchase Date</th>
                            <th>Supplier</th>
                            <th>Warehouse</th>
                            <th>Total Amount</th>
                            <th>Status</th>
                          </tr>
                        )}
                        {activeTab === "inventory" && (
                          <tr>
                            <th>Product Name</th>
                            <th>SKU</th>
                            <th>Category</th>
                            <th>Warehouse</th>
                            <th>Current Stock</th>
                            <th>Reorder Level</th>
                            <th>Cost Price</th>
                            <th>Valuation (Cost)</th>
                            <th>Status</th>
                          </tr>
                        )}
                      </>
                    )}
                  </thead>
                  <tbody>
                    {isGym ? (
                      <>
                        {activeTab === "memberships" &&
                          filteredItems.map((item) => (
                            <tr key={item.id}>
                              <td style={{ fontWeight: "700", color: "#1e293b" }}>{item.fullName}</td>
                              <td>{item.memberId}</td>
                              <td>{item.phone}</td>
                              <td>{item.email || "N/A"}</td>
                              <td>{new Date(item.joinDate).toLocaleDateString()}</td>
                              <td>{item.planName}</td>
                              <td>
                                <span className={`badge-report ${item.status.toLowerCase()}`}>
                                  {item.status}
                                </span>
                              </td>
                            </tr>
                          ))}

                        {activeTab === "payments" &&
                          filteredItems.map((item) => (
                            <tr key={item.id}>
                              <td style={{ fontWeight: "700", color: "#1e293b" }}>{item.receiptNumber}</td>
                              <td>{item.memberName}</td>
                              <td>{item.planName}</td>
                              <td style={{ fontWeight: "700", color: "#059669" }}>
                                {formatCurrency(item.paidAmount)}
                              </td>
                              <td style={{ color: Number(item.pendingAmount) > 0 ? "#ef4444" : "inherit" }}>
                                {formatCurrency(item.pendingAmount)}
                              </td>
                              <td>{new Date(item.paymentDate).toLocaleDateString()}</td>
                              <td>{item.paymentMethod}</td>
                              <td>
                                <span className={`badge-report ${item.status.toLowerCase()}`}>
                                  {item.status.replace("_", " ")}
                                </span>
                              </td>
                            </tr>
                          ))}

                        {activeTab === "attendance" &&
                          filteredItems.map((item) => (
                            <tr key={item.id}>
                              <td style={{ fontWeight: "700", color: "#1e293b" }}>{item.memberName}</td>
                              <td>{item.memberId}</td>
                              <td>{new Date(item.date).toLocaleDateString()}</td>
                              <td>{item.checkInTime ? new Date(item.checkInTime).toLocaleTimeString() : "N/A"}</td>
                              <td>{item.checkOutTime ? new Date(item.checkOutTime).toLocaleTimeString() : "N/A"}</td>
                              <td>
                                <span className={`badge-report ${item.status.toLowerCase()}`}>
                                  {item.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                      </>
                    ) : (
                      <>
                        {activeTab === "sales" &&
                          filteredItems.map((item) => (
                            <tr key={item.id}>
                              <td style={{ fontWeight: "700", color: "#1e293b" }}>{item.orderNumber}</td>
                              <td>{new Date(item.orderDate).toLocaleDateString()}</td>
                              <td>{item.customerName}</td>
                              <td>{formatCurrency(item.totalAmount)}</td>
                              <td style={{ color: "#ef4444" }}>-{formatCurrency(item.discountAmount)}</td>
                              <td>{formatCurrency(item.taxAmount)}</td>
                              <td style={{ fontWeight: "700" }}>{formatCurrency(item.netAmount)}</td>
                              <td>
                                <span className={`badge-report ${item.status.toLowerCase()}`}>
                                  {item.status}
                                </span>
                              </td>
                            </tr>
                          ))}

                        {activeTab === "purchases" &&
                          filteredItems.map((item) => (
                            <tr key={item.id}>
                              <td style={{ fontWeight: "700", color: "#1e293b" }}>{item.purchaseNo}</td>
                              <td>{new Date(item.purchaseDate).toLocaleDateString()}</td>
                              <td>{item.supplierName}</td>
                              <td>{item.warehouseName}</td>
                              <td style={{ fontWeight: "700" }}>{formatCurrency(item.totalAmount)}</td>
                              <td>
                                <span className={`badge-report ${item.status.toLowerCase()}`}>
                                  {item.status}
                                </span>
                              </td>
                            </tr>
                          ))}

                        {activeTab === "inventory" &&
                          filteredItems.map((item) => (
                            <tr key={item.id}>
                              <td style={{ fontWeight: "700", color: "#1e293b" }}>{item.productName}</td>
                              <td>{item.sku}</td>
                              <td>{item.categoryName}</td>
                              <td>{item.warehouseName}</td>
                              <td style={{ fontWeight: "600" }}>{item.quantity}</td>
                              <td>{item.reorderLevel}</td>
                              <td>{formatCurrency(item.costPrice)}</td>
                              <td style={{ fontWeight: "700" }}>{formatCurrency(item.valuationCost)}</td>
                              <td>
                                <span className={`badge-report ${item.status.toLowerCase()}`}>
                                  {item.status.replace("_", " ")}
                                </span>
                              </td>
                            </tr>
                          ))}
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            )}
            
            <div className="reports-pagination">
              <span>Showing {filteredItems.length} records</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
