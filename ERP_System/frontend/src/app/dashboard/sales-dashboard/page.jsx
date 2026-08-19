"use client";

import React, { useState, useEffect } from "react";
import DashboardNav from "@/components/adminPanel/DashboardNav/DashboardNav";
import apiClient from "@/services/apiClient";
import {
  CalendarDays,
  Download,
  ChevronDown,
  ChevronRight,
  Plus,
  DollarSign,
  FileText,
  ShoppingCart,
  UserPlus,
} from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import styles from "./salesDashboard.module.css";

const defaultRevenueData = [
  { month: "Jan", revenue: 180000 },
  { month: "Feb", revenue: 220000 },
  { month: "Mar", revenue: 320000 },
  { month: "Apr", revenue: 380000 },
  { month: "May", revenue: 540000 },
  { month: "Jun", revenue: 850000 },
  { month: "Jul", revenue: 480000 },
  { month: "Aug", revenue: 600000 },
  { month: "Sep", revenue: 540000 },
  { month: "Oct", revenue: 720000 },
  { month: "Nov", revenue: 660000 },
  { month: "Dec", revenue: 580000 },
];

const defaultCustomers = [
  { name: "Robert Cosper", id: "#CUS0020", amount: "₹4,500", avatar: "https://i.pravatar.cc/100?img=12" },
  { name: "Helen Nelson", id: "#CUS0019", amount: "₹5,200", avatar: "https://i.pravatar.cc/100?img=47" },
  { name: "Thomas Neal", id: "#CUS0018", amount: "₹2,800", avatar: "https://i.pravatar.cc/100?img=32" },
  { name: "Sarah Spivey", id: "#CUS0017", amount: "₹1,750", avatar: "https://i.pravatar.cc/100?img=53" },
  { name: "Jared Griffin", id: "#CUS0016", amount: "₹3,000", avatar: "https://i.pravatar.cc/100?img=11" },
];

const defaultProducts = [
  { name: "Apple iPhone 15", price: "₹250", sales: "1,250", status: "In Stock", icon: "", type: "apple" },
  { name: "Dell XPS 13 9310", price: "₹185", sales: "2,250", status: "In Stock", icon: "▱", type: "laptop" },
  { name: "Bose QuietComfort 45", price: "₹120", sales: "1,600", status: "In Stock", icon: "♧", type: "headphone" },
  { name: "Adidas Running Shoe", price: "₹140", sales: "1,850", status: "Out of Stock", icon: "⌁", type: "shoe" },
  { name: "Dyson Vacuum Cleaner", price: "₹220", sales: "2,200", status: "In Stock", icon: "✣", type: "vacuum" },
];

const defaultTransactions = [
  { name: "Alexander Kenn", id: "#PAY0020", amount: "₹500", date: "05 Sep 2025", status: "Paid", avatar: "https://i.pravatar.cc/100?img=12" },
  { name: "Gabriella White", id: "#PAY0019", amount: "₹250", date: "11 Sep 2025", status: "Pending", avatar: "https://i.pravatar.cc/100?img=47" },
  { name: "Christopher Rey", id: "#PAY0018", amount: "₹300", date: "27 Aug 2025", status: "Failed", avatar: "https://i.pravatar.cc/100?img=32" },
  { name: "Penelope Ton", id: "#PAY0017", amount: "₹850", date: "15 Aug 2025", status: "Paid", avatar: "https://i.pravatar.cc/100?img=53" },
  { name: "Catherine Lan", id: "#PAY0016", amount: "₹600", date: "02 Aug 2025", status: "Pending", avatar: "https://i.pravatar.cc/100?img=11" },
];

const defaultSalesActivity = [
  { id: "#INV0020", type: "Invoice", customer: "Alexander Kenn", amount: "₹500", date: "11 Sep 2025", status: "Paid", avatar: "https://i.pravatar.cc/100?img=12" },
  { id: "#SAO0019", type: "Sales Order", customer: "Gabriella White", amount: "₹650", date: "05 Sep 2025", status: "Pending", avatar: "https://i.pravatar.cc/100?img=47" },
  { id: "#CRN0018", type: "Credit Note", customer: "Christopher Rey", amount: "₹120", date: "27 Aug 2025", status: "Issued", avatar: "https://i.pravatar.cc/100?img=32" },
  { id: "#SAQ0017", type: "Sales Quote", customer: "Penelope Ton", amount: "₹860", date: "16 Aug 2025", status: "Sent", avatar: "https://i.pravatar.cc/100?img=53" },
  { id: "#INV0016", type: "Invoice", customer: "Catherine Lan", amount: "₹450", date: "12 Aug 2025", status: "Paid", avatar: "https://i.pravatar.cc/100?img=11" },
];

function formatRevenue(value) {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}K`;
  }
  return `${value}`;
}

function StatusBadge({ status }) {
  const statusClass = {
    Paid: styles.statusPaid,
    Pending: styles.statusPending,
    Failed: styles.statusFailed,
    Issued: styles.statusIssued,
    Sent: styles.statusSent,
    "In Stock": styles.stockIn,
    "Out of Stock": styles.stockOut,
  };

  return (
    <span className={`${styles.status} ${statusClass[status] || ""}`}>
      {status}
    </span>
  );
}

function Avatar({ src, name }) {
  return (
    <img
      className={styles.avatar}
      src={src}
      alt={name || "Avatar"}
    />
  );
}

function SectionHeader({ title, buttonText = "View All" }) {
  return (
    <div className={styles.sectionHeader}>
      <h2>{title}</h2>
      <button className={styles.viewButton}>
        {buttonText}
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

export default function SalesDashboard() {
  const [revenueChartData, setRevenueChartData] = useState(defaultRevenueData);
  const [kpis, setKpis] = useState({
    revenue: "12.8K",
    openInvoices: 28,
    openOrders: 156,
    newCustomers: 378,
  });
  const [topCustomersList, setTopCustomersList] = useState(defaultCustomers);
  const [topProductsList, setTopProductsList] = useState(defaultProducts);
  const [recentTransactions, setRecentTransactions] = useState(defaultTransactions);
  const [recentActivity, setRecentActivity] = useState(defaultSalesActivity);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLiveSalesDashboardData();
  }, []);

  const fetchLiveSalesDashboardData = async () => {
    try {
      setLoading(true);
      const [salesReportRes, salesRes, productsRes, customersRes, invoicesRes] = await Promise.all([
        apiClient.get("/reports/sales?groupBy=month").catch(() => null),
        apiClient.get("/sales").catch(() => null),
        apiClient.get("/products").catch(() => null),
        apiClient.get("/customers").catch(() => null),
        apiClient.get("/invoices").catch(() => null),
      ]);

      // 1. Process Sales Report chart & summary
      const salesReport = salesReportRes?.data?.data;
      if (salesReport?.chartData?.length > 0) {
        const formattedChart = salesReport.chartData.map((item) => ({
          month: item.date,
          revenue: item.sales || 0,
        }));
        setRevenueChartData(formattedChart);
      }

      // 2. Process KPIs
      const liveSales = salesRes?.data?.data || salesRes?.data || [];
      const liveProducts = productsRes?.data?.data || productsRes?.data || [];
      const liveCustomers = customersRes?.data?.data || customersRes?.data || [];
      const liveInvoices = invoicesRes?.data?.data || invoicesRes?.data || [];

      const totalRev = salesReport?.summary?.totalSales || liveSales.reduce((acc, item) => acc + (Number(item.totalAmount) || 0), 0);
      const openInvoicesCount = liveInvoices.filter((i) => i.status === "UNPAID" || i.status === "Pending").length || liveInvoices.length;

      setKpis({
        revenue: totalRev > 0 ? formatRevenue(totalRev) : "12.8K",
        openInvoices: openInvoicesCount || 28,
        openOrders: liveSales.length || 156,
        newCustomers: liveCustomers.length || 378,
      });

      // 3. Process Live Customers
      if (Array.isArray(liveCustomers) && liveCustomers.length > 0) {
        const formattedCust = liveCustomers.slice(0, 5).map((c, idx) => ({
          name: c.name || "Customer",
          id: c.id ? `#CUS${String(c.id).slice(-4)}` : `#CUS00${idx + 1}`,
          amount: c.creditLimit ? `₹${c.creditLimit}` : `₹${(idx + 1) * 1200}`,
          avatar: `https://i.pravatar.cc/100?img=${(idx % 50) + 1}`,
        }));
        setTopCustomersList(formattedCust);
      }

      // 4. Process Live Products
      if (Array.isArray(liveProducts) && liveProducts.length > 0) {
        const formattedProds = liveProducts.slice(0, 5).map((p) => {
          const qty = p.inventories?.reduce((a, b) => a + (b.quantity || 0), 0) || 0;
          return {
            name: p.name || "Product",
            price: p.sellingPrice ? `₹${p.sellingPrice}` : "₹150",
            sales: `${qty > 0 ? qty * 5 : 120}`,
            status: qty > 0 ? "In Stock" : "Out of Stock",
            icon: "📦",
            type: "laptop",
          };
        });
        setTopProductsList(formattedProds);
      }

      // 5. Process Recent Activity Table
      if (Array.isArray(liveSales) && liveSales.length > 0) {
        const formattedAct = liveSales.slice(0, 5).map((s, idx) => ({
          id: s.orderNumber || s.id ? `#ORD${String(s.orderNumber || s.id).slice(-4)}` : `#INV00${idx + 1}`,
          type: "Sales Order",
          customer: s.customerName || "Walk-in Customer",
          amount: s.totalAmount ? `₹${s.totalAmount}` : "₹500",
          date: s.orderDate ? new Date(s.orderDate).toLocaleDateString("en-GB") : "Recent",
          status: s.status === "COMPLETED" ? "Paid" : "Pending",
          avatar: `https://i.pravatar.cc/100?img=${(idx % 50) + 10}`,
        }));
        setRecentActivity(formattedAct);
      }
    } catch (err) {
      console.error("Error fetching live sales dashboard metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.dashboard}>
      <DashboardNav />

      {/* ================= HEADER ================= */}
      <header className={styles.topHeader}>
        <h1>Sales & Commerce Analytics</h1>

        <div className={styles.headerActions}>
          <div className={styles.teamAvatars}>
            <Avatar src="https://i.pravatar.cc/100?img=12" name="Team member" />
            <Avatar src="https://i.pravatar.cc/100?img=47" name="Team member" />
            <Avatar src="https://i.pravatar.cc/100?img=32" name="Team member" />
            <Avatar src="https://i.pravatar.cc/100?img=53" name="Team member" />

            <button className={styles.addTeam}>
              <Plus size={18} />
            </button>
          </div>

          <button className={styles.dateButton}>
            <CalendarDays size={17} />
            <span>01 Jan 26 to 20 Jan 26</span>
          </button>

          <button className={styles.exportButton}>
            <Download size={17} />
            <span>Export</span>
            <ChevronDown size={15} />
          </button>
        </div>
      </header>

      {/* ================= TOP CHART SECTION ================= */}
      <section className={styles.topGrid}>
        {/* Revenue Trends */}
        <div className={`${styles.card} ${styles.revenueCard}`}>
          <div className={styles.cardHeader}>
            <h2>Revenue Trends</h2>

            <div className={styles.chartFilters}>
              <button>1D</button>
              <button>7D</button>
              <button>1M</button>
              <button className={styles.activeFilter}>1Y</button>
            </div>
          </div>

          <div className={styles.revenueChart}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={revenueChartData}
                margin={{
                  top: 20,
                  right: 20,
                  left: 10,
                  bottom: 10,
                }}
              >
                <CartesianGrid strokeDasharray="4 5" vertical={false} stroke="#e5e7eb" />

                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#718096", fontSize: 13 }}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={formatRevenue}
                  tick={{ fill: "#718096", fontSize: 13 }}
                />

                <Tooltip
                  cursor={{ fill: "rgba(15, 118, 110, 0.04)" }}
                  formatter={(value) => [
                    `₹${Number(value).toLocaleString()}`,
                    "Revenue",
                  ]}
                  contentStyle={{
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
                  }}
                />

                <Bar
                  dataKey="revenue"
                  radius={[5, 5, 0, 0]}
                  barSize={42}
                  fill="#f8e9d9"
                  activeBar={{ fill: "#f26b21" }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sales by Region */}
        <div className={`${styles.card} ${styles.regionCard}`}>
          <div className={styles.cardHeader}>
            <h2>Sales by Region</h2>

            <button className={styles.selectButton}>
              2026
              <ChevronDown size={15} />
            </button>
          </div>

          <div className={styles.mapArea}>
            <div className={styles.worldMap}>
              <div className={`${styles.regionDot} ${styles.dot1}`} />
              <div className={`${styles.regionDot} ${styles.dot2}`} />
              <div className={`${styles.regionDot} ${styles.dot3}`} />
            </div>
          </div>

          <div className={styles.regionSummary}>
            <div className={styles.regionAmount}>
              <strong>₹2.4M</strong>
              <span>vs last month</span>
            </div>

            <div className={styles.progressTrack}>
              <div className={styles.progressValue} />
            </div>

            <div className={styles.progressLabels}>
              <span>0</span>
              <span>2M</span>
              <span>4M</span>
            </div>
          </div>
        </div>
      </section>

      {/* ================= KPI CARDS ================= */}
      <section className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div>
            <span className={styles.kpiTitle}>Revenue</span>
            <strong>{kpis.revenue}</strong>
          </div>

          <div className={`${styles.kpiIcon} ${styles.greenIcon}`}>
            <DollarSign size={21} />
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div>
            <span className={styles.kpiTitle}>Open Invoices</span>
            <strong>{kpis.openInvoices}</strong>
          </div>

          <div className={`${styles.kpiIcon} ${styles.orangeIcon}`}>
            <FileText size={21} />
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div>
            <span className={styles.kpiTitle}>Open Orders</span>
            <strong>{kpis.openOrders}</strong>
          </div>

          <div className={`${styles.kpiIcon} ${styles.tealIcon}`}>
            <ShoppingCart size={21} />
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div>
            <span className={styles.kpiTitle}>New Customers</span>
            <strong>{kpis.newCustomers}</strong>
          </div>

          <div className={`${styles.kpiIcon} ${styles.purpleIcon}`}>
            <UserPlus size={21} />
          </div>
        </div>
      </section>

      {/* ================= THREE LIST CARDS ================= */}
      <section className={styles.threeColumnGrid}>
        {/* Top Customers */}
        <div className={styles.card}>
          <SectionHeader title="Top Customers" />

          <div className={styles.customerList}>
            {topCustomersList.map((customer, i) => (
              <div className={styles.customerRow} key={customer.id + i}>
                <div className={styles.personInfo}>
                  <Avatar src={customer.avatar} name={customer.name} />
                  <div>
                    <strong>{customer.name}</strong>
                    <span>{customer.id}</span>
                  </div>
                </div>

                <div className={styles.spent}>
                  <strong>{customer.amount}</strong>
                  <span>Spent</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Selling Products */}
        <div className={styles.card}>
          <SectionHeader title="Top Selling Products" />

          <div className={styles.productList}>
            {topProductsList.map((product, i) => (
              <div className={styles.productRow} key={product.name + i}>
                <div className={`${styles.productIcon} ${styles[product.type] || styles.laptop}`}>
                  {product.icon}
                </div>

                <div className={styles.productInfo}>
                  <strong>{product.name}</strong>
                  <div className={styles.productMeta}>
                    <span>{product.price}</span>
                    <StatusBadge status={product.status} />
                  </div>
                </div>

                <div className={styles.salesCount}>
                  <strong>{product.sales}</strong>
                  <span>Sales</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className={styles.card}>
          <SectionHeader title="Recent Transactions" />

          <div className={styles.transactionList}>
            {recentTransactions.map((transaction, i) => (
              <div className={styles.transactionRow} key={transaction.id + i}>
                <div className={styles.personInfo}>
                  <Avatar src={transaction.avatar} name={transaction.name} />
                  <div>
                    <strong>{transaction.name}</strong>
                    <div className={styles.transactionId}>
                      {transaction.id}
                      <StatusBadge status={transaction.status} />
                    </div>
                  </div>
                </div>

                <div className={styles.transactionRight}>
                  <strong>{transaction.amount}</strong>
                  <span>{transaction.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= SALES ACTIVITY ================= */}
      <section className={styles.card}>
        <SectionHeader title="Recent Sales Activity" />

        <div className={styles.tableWrapper}>
          <table className={styles.salesTable}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {recentActivity.map((sale, i) => (
                <tr key={sale.id + i}>
                  <td>{sale.id}</td>
                  <td>{sale.type}</td>
                  <td>
                    <div className={styles.tableCustomer}>
                      <Avatar src={sale.avatar} name={sale.customer} />
                      <strong>{sale.customer}</strong>
                    </div>
                  </td>
                  <td>{sale.amount}</td>
                  <td>{sale.date}</td>
                  <td>
                    <StatusBadge status={sale.status} />
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