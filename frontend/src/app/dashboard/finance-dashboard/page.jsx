"use client";

import React, { useState, useEffect } from "react";
import DashboardNav from "@/components/adminPanel/DashboardNav/DashboardNav";
import apiClient from "@/services/apiClient";
import {
  CalendarDays,
  Download,
  ChevronDown,
  ChevronRight,
  Receipt,
  FileText,
  CreditCard,
  BarChart3,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Leaf,
  Triangle,
  Flower2,
  Building2,
} from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import styles from "./financeDashboard.module.css";

/* =========================================================
   FALLBACK DATA
========================================================= */

const defaultMonthlyData = [
  { month: "Jan", revenue: 40000, expense: 22000 },
  { month: "Feb", revenue: 70000, expense: 48000 },
  { month: "Mar", revenue: 28000, expense: 25000 },
  { month: "Apr", revenue: 38000, expense: 30000 },
  { month: "May", revenue: 48000, expense: 36000 },
  { month: "Jun", revenue: 60000, expense: 42000 },
  { month: "Jul", revenue: 22000, expense: 18000 },
  { month: "Aug", revenue: 42000, expense: 30000 },
  { month: "Sep", revenue: 36000, expense: 25000 },
  { month: "Oct", revenue: 36000, expense: 22000 },
  { month: "Nov", revenue: 28000, expense: 18000 },
  { month: "Dec", revenue: 60000, expense: 22000 },
];

const defaultProfitData = [
  { month: "Jan", profit: 55000, sales: 25000 },
  { month: "Feb", profit: 48000, sales: 22000 },
  { month: "Mar", profit: 50000, sales: 28000 },
  { month: "Apr", profit: 32000, sales: 35000 },
  { month: "May", profit: 40000, sales: 30000 },
  { month: "Jun", profit: 38000, sales: 38000 },
  { month: "Jul", profit: 45000, sales: 32000 },
  { month: "Aug", profit: 35000, sales: 45000 },
  { month: "Sep", profit: 25000, sales: 42000 },
  { month: "Oct", profit: 28000, sales: 55000 },
  { month: "Nov", profit: 22000, sales: 48000 },
  { month: "Dec", profit: 30000, sales: 60000 },
];

const defaultRevenueData = [
  { name: "Sales", value: 60 },
  { name: "Recurring", value: 30 },
  { name: "Service Fees", value: 10 },
];

const defaultExpenseData = [
  { name: "Salaries", value: 50 },
  { name: "Marketing", value: 30 },
  { name: "Miscellaneous", value: 20 },
];

const defaultInvoices = [
  { id: "#INV0020", name: "Apex Computers", amount: "$10,000", status: "Paid", type: "computer" },
  { id: "#INV0019", name: "Beats Headphones", amount: "$5,000", status: "Unpaid", type: "headphone" },
  { id: "#INV0018", name: "Dazzle Shoes", amount: "$25,000", status: "Canceled", type: "shoe" },
  { id: "#INV0017", name: "Best Accessories", amount: "$15,500", status: "Partially", type: "accessory" },
  { id: "#INV0016", name: "A-Z Store", amount: "$34,000", status: "Overdue", type: "store" },
];

const defaultPayments = [
  { id: "#PAY0020", date: "11 Sep 2025", payee: "Zenith Supplies", description: "Office Stationery", invoice: "#INV0020", amount: "$10,000", bank: "BOA – 4567329878", method: "Cash", status: "Paid", icon: Leaf },
  { id: "#PAY0019", date: "05 Sep 2025", payee: "Delta Traders", description: "Courier Charges", invoice: "#INV0019", amount: "$5,000", bank: "WF – 9981432098", method: "Credit Card", status: "Unpaid", icon: Triangle },
  { id: "#PAY0018", date: "27 Aug 2025", payee: "Nova Enterprises", description: "Marketing Flyers", invoice: "#INV0018", amount: "$2,000", bank: "JPM – 3205987643", method: "Debit Card", status: "Partially Paid", icon: Flower2 },
  { id: "#PAY0017", date: "16 Aug 2025", payee: "Apex Manufacturing", description: "Office Rent", invoice: "#INV0017", amount: "$1,500", bank: "CITI – 6721345098", method: "UPI", status: "Paid", icon: Building2 },
];

const revenueColors = ["#079669", "#ef5b00", "#7020a5"];
const expenseColors = ["#ef8b24", "#7020a5", "#3c8b83"];

function formatMoney(value) {
  if (value >= 1000) {
    return `${Math.round(value / 1000)}K`;
  }
  return `${value}`;
}

function InvoiceIcon({ type }) {
  const icons = {
    computer: Building2,
    headphone: CreditCard,
    shoe: Receipt,
    accessory: FileText,
    store: Building2,
  };

  const Icon = icons[type] || Receipt;

  return (
    <div className={`${styles.invoiceIcon} ${styles[type] || ""}`}>
      <Icon size={18} />
    </div>
  );
}

function StatusBadge({ status }) {
  const statusClass = {
    Paid: styles.paid,
    Unpaid: styles.unpaid,
    Canceled: styles.canceled,
    Partially: styles.partially,
    Overdue: styles.overdue,
    "Partially Paid": styles.partially,
  };

  return (
    <span className={`${styles.statusBadge} ${statusClass[status] || ""}`}>
      {status}
      {status === "Paid" && " ✓"}
    </span>
  );
}

function StatCard({
  title,
  value,
  change,
  subtitle,
  icon: Icon,
  iconClass,
  negative = false,
}) {
  return (
    <div className={styles.statCard}>
      <div className={styles.statTop}>
        <div>
          <div className={styles.statTitle}>{title}</div>
          <div className={styles.statValue}>{value}</div>
        </div>

        <div className={`${styles.statIcon} ${iconClass}`}>
          <Icon size={19} />
        </div>
      </div>

      <div className={styles.statBottom}>
        {negative ? (
          <span className={styles.negativeChange}>
            <ArrowDownRight size={15} />
            {change}
          </span>
        ) : (
          <span className={styles.positiveChange}>
            <ArrowUpRight size={15} />
            {change}
          </span>
        )}

        <span className={styles.statSubtitle}>{subtitle}</span>
      </div>
    </div>
  );
}

function DonutChart({ data, colors, centerValue, centerLabel }) {
  return (
    <div className={styles.donutWrapper}>
      <ResponsiveContainer width="100%" height={290}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={85}
            outerRadius={125}
            paddingAngle={2}
            stroke="#fff"
            strokeWidth={3}
          >
            {data.map((entry, index) => (
              <Cell key={entry.name || index} fill={colors[index % colors.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      <div className={styles.donutCenter}>
        <strong>{centerValue}</strong>
        <span>{centerLabel}</span>
      </div>
    </div>
  );
}

export default function FinanceDashboard() {
  const [chartMonthlyData, setChartMonthlyData] = useState(defaultMonthlyData);
  const [profitChartData, setProfitChartData] = useState(defaultProfitData);
  const [revenueDonutData, setRevenueDonutData] = useState(defaultRevenueData);
  const [expenseDonutData, setExpenseDonutData] = useState(defaultExpenseData);
  const [invoicesList, setInvoicesList] = useState(defaultInvoices);
  const [paymentsList, setPaymentsList] = useState(defaultPayments);
  const [financeStats, setFinanceStats] = useState({
    totalRevenue: "₹125,000",
    totalExpenses: "₹89,500",
    pendingInvoices: 12,
    budgetUtilization: "65%",
    netProfit: "₹35,500",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLiveFinanceData();
  }, []);

  const fetchLiveFinanceData = async () => {
    try {
      setLoading(true);
      const [salesReportRes, purchaseReportRes, invoicesRes, expensesRes, paymentsRes] = await Promise.all([
        apiClient.get("/reports/sales?groupBy=month").catch(() => null),
        apiClient.get("/reports/purchase?groupBy=month").catch(() => null),
        apiClient.get("/invoices").catch(() => null),
        apiClient.get("/expenses").catch(() => null),
        apiClient.get("/payments").catch(() => null),
      ]);

      const salesReport = salesReportRes?.data?.data;
      const purchaseReport = purchaseReportRes?.data?.data;
      const liveInvoices = invoicesRes?.data?.data || invoicesRes?.data || [];
      const liveExpenses = expensesRes?.data?.data || expensesRes?.data || [];
      const livePayments = paymentsRes?.data?.data || paymentsRes?.data || [];

      // 1. Process Revenue & Expenses KPI
      const salesTotal = salesReport?.summary?.totalSales || 0;
      const invoicesTotal = liveInvoices.reduce((acc, inv) => acc + Number(inv.totalAmount || 0), 0);
      const totRev = Math.max(salesTotal, invoicesTotal);

      const purchasesTotal = purchaseReport?.summary?.totalPurchases || 0;
      const expensesTotal = liveExpenses.reduce((acc, exp) => acc + Number(exp.amount || 0), 0);
      const totExp = purchasesTotal + expensesTotal;

      const netProf = totRev - totExp;
      const openInvCount = liveInvoices.filter((i) => i.paymentStatus !== "PAID" && i.status !== "CANCELLED").length;
      const budgetPct = totRev > 0 ? Math.min(100, Math.round((totExp / totRev) * 100)) : 0;

      setFinanceStats({
        totalRevenue: `₹${totRev.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        totalExpenses: `₹${totExp.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        pendingInvoices: openInvCount,
        budgetUtilization: `${budgetPct}%`,
        netProfit: `₹${netProf.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      });

      // 2. Process Monthly Bar Chart (Revenue vs Expense) & Profit Margin Line Chart
      if (salesReport?.chartData?.length > 0 || purchaseReport?.chartData?.length > 0) {
        const monthMap = {};

        if (salesReport?.chartData) {
          salesReport.chartData.forEach((item) => {
            monthMap[item.date] = { month: item.date, revenue: Number(item.sales || 0), expense: 0 };
          });
        }

        if (purchaseReport?.chartData) {
          purchaseReport.chartData.forEach((item) => {
            if (!monthMap[item.date]) {
              monthMap[item.date] = { month: item.date, revenue: 0, expense: Number(item.purchases || 0) };
            } else {
              monthMap[item.date].expense = Number(item.purchases || 0);
            }
          });
        }

        const chartArray = Object.values(monthMap).sort((a, b) => a.month.localeCompare(b.month));

        if (chartArray.length > 0) {
          setChartMonthlyData(chartArray);

          const profitArray = chartArray.map((item) => ({
            month: item.month,
            profit: Math.max(0, item.revenue - item.expense),
            sales: item.revenue,
          }));
          setProfitChartData(profitArray);
        }
      }

      // 3. Process Live Recent Invoices List
      if (Array.isArray(liveInvoices) && liveInvoices.length > 0) {
        const formattedInvoices = liveInvoices.slice(0, 5).map((inv, idx) => {
          let statusText = "Paid";
          if (inv.status === "CANCELLED") statusText = "Canceled";
          else if (inv.paymentStatus === "PARTIAL") statusText = "Partially";
          else if (inv.paymentStatus === "PENDING" || inv.status === "DRAFT") statusText = "Unpaid";
          else if (inv.paymentStatus === "PAID") statusText = "Paid";

          return {
            id: inv.invoiceNumber ? `#${inv.invoiceNumber}` : `#INV-${inv.id.substring(0, 6)}`,
            name: inv.customerName || inv.clientName || (inv.customerId ? `Customer (${inv.customerId.substring(0, 6)})` : "Retail Account"),
            amount: `₹${Number(inv.totalAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            status: statusText,
            type: idx % 4 === 0 ? "computer" : idx % 4 === 1 ? "headphone" : idx % 4 === 2 ? "shoe" : "accessory",
          };
        });
        setInvoicesList(formattedInvoices);
      }

      // 4. Process Revenue Breakdown Donut Data
      const paidRevSum = liveInvoices.filter((i) => i.paymentStatus === "PAID").reduce((a, b) => a + Number(b.totalAmount || 0), 0);
      const partialRevSum = liveInvoices.filter((i) => i.paymentStatus === "PARTIAL").reduce((a, b) => a + Number(b.paidAmount || 0), 0);
      const pendingRevSum = liveInvoices.reduce((a, b) => a + Number(b.balanceAmount || 0), 0);
      const revTotalSum = paidRevSum + partialRevSum + pendingRevSum || totRev || 1;

      setRevenueDonutData([
        { name: "Paid Revenue", value: Math.round(((paidRevSum + partialRevSum) / revTotalSum) * 100) || 60 },
        { name: "Pending Balance", value: Math.round((pendingRevSum / revTotalSum) * 100) || 30 },
        { name: "Other Sales", value: Math.max(5, 100 - (Math.round(((paidRevSum + partialRevSum) / revTotalSum) * 100) + Math.round((pendingRevSum / revTotalSum) * 100))) },
      ]);

      // 5. Process Expenses Breakdown Donut Data
      const purchaseExpSum = purchasesTotal || Math.round(totExp * 0.7);
      const opsExpSum = expensesTotal || Math.round(totExp * 0.3);
      const expTotalSum = purchaseExpSum + opsExpSum || totExp || 1;

      setExpenseDonutData([
        { name: "Purchases & Stock", value: Math.round((purchaseExpSum / expTotalSum) * 100) || 70 },
        { name: "Operational Costs", value: Math.round((opsExpSum / expTotalSum) * 100) || 20 },
        { name: "Other Expenses", value: Math.max(5, 100 - (Math.round((purchaseExpSum / expTotalSum) * 100) + Math.round((opsExpSum / expTotalSum) * 100))) },
      ]);

      // 6. Process Live Payments Table
      const rawPayments = livePayments.length > 0
        ? livePayments
        : liveInvoices.filter((i) => Number(i.paidAmount || 0) > 0).map((i) => ({
            paymentNumber: `PAY-${i.invoiceNumber}`,
            paymentDate: i.updatedAt || i.invoiceDate,
            payeeName: i.customerName || `Customer (${i.customerId?.substring(0, 6)})`,
            notes: "Invoice Settlement",
            invoiceNumber: i.invoiceNumber,
            amount: i.paidAmount,
            paymentMethod: "Bank Transfer",
            status: i.paymentStatus,
          }));

      if (Array.isArray(rawPayments) && rawPayments.length > 0) {
        const formattedPayments = rawPayments.slice(0, 5).map((p, idx) => ({
          id: p.paymentNumber ? `#${p.paymentNumber}` : (p.id ? `#PAY-${String(p.id).slice(0, 6)}` : `#PAY00${idx + 15}`),
          date: p.paymentDate ? new Date(p.paymentDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "Recent",
          payee: p.payeeName || p.customer?.name || p.customerName || "Customer Account",
          description: p.notes || p.description || "Invoice Settlement",
          invoice: p.invoiceNumber ? `#${p.invoiceNumber}` : (p.invoice?.invoiceNumber ? `#${p.invoice.invoiceNumber}` : `#INV00${idx + 15}`),
          amount: `₹${Number(p.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          bank: "BOA – 4567329878",
          method: p.paymentMethod || p.method || "Bank Transfer",
          status: p.status === "PAID" || p.status === "Paid" || p.status === "COMPLETED" ? "Paid" : p.status === "PARTIAL" ? "Partially" : "Unpaid",
          icon: Leaf,
        }));
        setPaymentsList(formattedPayments);
      }
    } catch (err) {
      console.error("Error fetching live finance telemetry:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.dashboard}>
      <DashboardNav />

      {/* HEADER */}
      <header className={styles.header}>
        <h1>Finance Dashboard</h1>

        <div className={styles.headerActions}>
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

      {/* TOP SECTION */}
      <section className={styles.topGrid}>
        {/* REVENUE VS EXPENSE */}
        <div className={`${styles.card} ${styles.revenueCard}`}>
          <div className={styles.cardHeader}>
            <h2>Revenue vs Expense</h2>

            <button className={styles.selectButton}>
              2026
              <ChevronDown size={15} />
            </button>
          </div>

          <div className={styles.bigChart}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartMonthlyData}
                margin={{
                  top: 20,
                  right: 12,
                  left: 5,
                  bottom: 5,
                }}
                barGap={2}
              >
                <CartesianGrid
                  strokeDasharray="5 5"
                  vertical={false}
                  stroke="#dfe5ea"
                />

                <XAxis
                  dataKey="month"
                  tick={{ fill: "#718096", fontSize: 13 }}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  tickFormatter={formatMoney}
                  tick={{ fill: "#718096", fontSize: 13 }}
                  axisLine={false}
                  tickLine={false}
                  width={45}
                />

                <Tooltip
                  formatter={(value) => `₹${value.toLocaleString()}`}
                  contentStyle={{
                    borderRadius: "10px",
                    border: "1px solid #e4e8ed",
                  }}
                />

                <Bar
                  dataKey="revenue"
                  name="Revenue"
                  fill="#2ba47e"
                  radius={[4, 4, 0, 0]}
                  barSize={21}
                />

                <Bar
                  dataKey="expense"
                  name="Expense"
                  fill="#ef681f"
                  radius={[4, 4, 0, 0]}
                  barSize={21}
                />

                <Legend
                  iconType="circle"
                  wrapperStyle={{
                    paddingTop: 25,
                    fontSize: 13,
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RECENT INVOICES */}
        <div className={`${styles.card} ${styles.invoiceCard}`}>
          <div className={styles.cardHeader}>
            <h2>Recent Invoices</h2>

            <button className={styles.viewButton}>
              View All
              <ChevronRight size={16} />
            </button>
          </div>

          <div className={styles.invoiceList}>
            {invoicesList.map((invoice, idx) => (
              <div className={styles.invoiceRow} key={invoice.id + idx}>
                <InvoiceIcon type={invoice.type} />

                <div className={styles.invoiceName}>
                  <span>{invoice.id}</span>
                  <strong>{invoice.name}</strong>
                </div>

                <div className={styles.invoiceAmount}>
                  <span>Amount</span>
                  <strong>{invoice.amount}</strong>
                </div>

                <div className={styles.invoiceStatus}>
                  <span>Status</span>
                  <StatusBadge status={invoice.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATISTICS */}
      <section className={styles.statsGrid}>
        <StatCard
          title="Total Revenue"
          value={financeStats.totalRevenue}
          change="+12.4%"
          subtitle="Last 30 days"
          icon={Receipt}
          iconClass={styles.orangeIcon}
        />

        <StatCard
          title="Total Expenses"
          value={financeStats.totalExpenses}
          change="-6.8%"
          subtitle="Last 30 days"
          icon={CreditCard}
          iconClass={styles.blueIcon}
          negative
        />

        <StatCard
          title="Pending Invoices"
          value={financeStats.pendingInvoices}
          change="+5.2%"
          subtitle="Last 30 days"
          icon={FileText}
          iconClass={styles.pinkIcon}
        />

        <StatCard
          title="Budget Utilization"
          value={financeStats.budgetUtilization}
          change="+5.2%"
          subtitle="Last 30 days"
          icon={BarChart3}
          iconClass={styles.purpleIcon}
        />

        <StatCard
          title="Net Profit / Loss"
          value={financeStats.netProfit}
          change="+18%"
          subtitle="Last 30 days"
          icon={TrendingUp}
          iconClass={styles.greenIcon}
        />
      </section>

      {/* CHARTS */}
      <section className={styles.chartsGrid}>
        {/* REVENUE DONUT */}
        <div className={`${styles.card} ${styles.revenueDonutCard}`}>
          <div className={styles.cardHeader}>
            <h2>Revenue Breakdown</h2>

            <button className={styles.selectButton}>
              Weekly
              <ChevronDown size={15} />
            </button>
          </div>

          <div className={styles.donutArea}>
            <DonutChart
              data={revenueDonutData}
              colors={revenueColors}
              centerValue="90%"
              centerLabel=""
            />
          </div>

          <div className={styles.legendList}>
            {revenueDonutData.map((item, index) => (
              <div className={styles.legendItem} key={item.name + index}>
                <span
                  className={styles.legendDot}
                  style={{ backgroundColor: revenueColors[index % revenueColors.length] }}
                />
                <span>{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* PROFIT MARGIN */}
        <div className={`${styles.card} ${styles.profitCard}`}>
          <div className={styles.cardHeader}>
            <h2>Profit Margin vs Sales</h2>

            <button className={styles.selectButton}>
              2026
              <ChevronDown size={15} />
            </button>
          </div>

          <div className={styles.lineChart}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={profitChartData}
                margin={{
                  top: 20,
                  right: 15,
                  left: 0,
                  bottom: 5,
                }}
              >
                <CartesianGrid
                  strokeDasharray="5 5"
                  vertical={false}
                  stroke="#e1e6ea"
                />

                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#718096", fontSize: 12 }}
                />

                <YAxis
                  tickFormatter={formatMoney}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#718096", fontSize: 12 }}
                />

                <Tooltip
                  formatter={(value) => `₹${Number(value).toLocaleString()}`}
                  contentStyle={{
                    borderRadius: "10px",
                    border: "1px solid #e4e8ed",
                  }}
                />

                <Line
                  type="monotone"
                  dataKey="profit"
                  name="Profit Margin"
                  stroke="#ed681e"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 5 }}
                />

                <Line
                  type="monotone"
                  dataKey="sales"
                  name="Sales"
                  stroke="#149b72"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 5 }}
                />

                <Legend
                  iconType="circle"
                  wrapperStyle={{
                    paddingTop: 15,
                    fontSize: 13,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* EXPENSES DONUT */}
        <div className={`${styles.card} ${styles.expenseCard}`}>
          <div className={styles.cardHeader}>
            <h2>Expenses Breakdown</h2>

            <button className={styles.selectButton}>
              2026
              <ChevronDown size={15} />
            </button>
          </div>

          <div className={styles.expenseDonut}>
            <DonutChart
              data={expenseDonutData}
              colors={expenseColors}
              centerValue="50%"
              centerLabel="Salaries"
            />
          </div>

          <div className={styles.expenseLegend}>
            {expenseDonutData.map((item, index) => (
              <div className={styles.expenseLegendRow} key={item.name + index}>
                <div>
                  <span
                    className={styles.legendDot}
                    style={{ backgroundColor: expenseColors[index % expenseColors.length] }}
                  />
                  <span>{item.name}</span>
                </div>

                <strong>{item.value}%</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RECENT PAYMENTS */}
      <section className={`${styles.card} ${styles.paymentsCard}`}>
        <div className={styles.cardHeader}>
          <h2>Recent Payments & Settlements</h2>

          <button className={styles.viewButton}>
            View All
            <ChevronRight size={16} />
          </button>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.paymentTable}>
            <thead>
              <tr>
                <th>Payment ID</th>
                <th>Date</th>
                <th>Payee</th>
                <th>Description</th>
                <th>Invoice ID</th>
                <th>Amount</th>
                <th>Bank & Account</th>
                <th>Payment Method</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {paymentsList.map((payment, idx) => {
                const Icon = payment.icon || Leaf;

                return (
                  <tr key={payment.id + idx}>
                    <td>{payment.id}</td>

                    <td>{payment.date}</td>

                    <td>
                      <div className={styles.payeeCell}>
                        <span className={styles.payeeIcon}>
                          <Icon size={16} />
                        </span>

                        <strong>{payment.payee}</strong>
                      </div>
                    </td>

                    <td>{payment.description}</td>

                    <td>{payment.invoice}</td>

                    <td className={styles.amountCell}>
                      {payment.amount}
                    </td>

                    <td>{payment.bank}</td>

                    <td>{payment.method}</td>

                    <td>
                      <StatusBadge status={payment.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}