"use client";

import DashboardNav from "@/components/adminPanel/DashboardNav/DashboardNav";
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

const monthlyData = [
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

const profitData = [
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

const revenueData = [
  { name: "Sales", value: 60 },
  { name: "Recurring", value: 30 },
  { name: "Service Fees", value: 10 },
];

const expenseData = [
  { name: "Salaries", value: 50 },
  { name: "Marketing", value: 30 },
  { name: "Miscellaneous", value: 20 },
];

const invoices = [
  {
    id: "#INV0020",
    name: "Apex Computers",
    amount: "$10,000",
    status: "Paid",
    type: "computer",
  },
  {
    id: "#INV0019",
    name: "Beats Headphones",
    amount: "$5,000",
    status: "Unpaid",
    type: "headphone",
  },
  {
    id: "#INV0018",
    name: "Dazzle Shoes",
    amount: "$25,000",
    status: "Canceled",
    type: "shoe",
  },
  {
    id: "#INV0017",
    name: "Best Accessories",
    amount: "$15,500",
    status: "Partially",
    type: "accessory",
  },
  {
    id: "#INV0016",
    name: "A-Z Store",
    amount: "$34,000",
    status: "Overdue",
    type: "store",
  },
];

const payments = [
  {
    id: "#PAY0020",
    date: "11 Sep 2025",
    payee: "Zenith Supplies",
    description: "Office Stationery",
    invoice: "#INV0020",
    amount: "$10,000",
    bank: "BOA – 4567329878",
    method: "Cash",
    status: "Paid",
    icon: Leaf,
  },
  {
    id: "#PAY0019",
    date: "05 Sep 2025",
    payee: "Delta Traders",
    description: "Courier Charges",
    invoice: "#INV0019",
    amount: "$5,000",
    bank: "WF – 9981432098",
    method: "Credit Card",
    status: "Unpaid",
    icon: Triangle,
  },
  {
    id: "#PAY0018",
    date: "27 Aug 2025",
    payee: "Nova Enterprises",
    description: "Marketing Flyers",
    invoice: "#INV0018",
    amount: "$2,000",
    bank: "JPM – 3205987643",
    method: "Debit Card",
    status: "Partially Paid",
    icon: Flower2,
  },
  {
    id: "#PAY0017",
    date: "16 Aug 2025",
    payee: "Apex Manufacturing",
    description: "Office Rent",
    invoice: "#INV0017",
    amount: "$1,500",
    bank: "CITI – 6721345098",
    method: "UPI",
    status: "Paid",
    icon: Building2,
  },
];

const revenueColors = ["#079669", "#ef5b00", "#7020a5"];
const expenseColors = ["#ef8b24", "#7020a5", "#3c8b83"];

function formatMoney(value) {
  return `${Math.round(value / 1000)}K`;
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
              <Cell key={entry.name} fill={colors[index]} />
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
                data={monthlyData}
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
                  formatter={(value) => `$${value.toLocaleString()}`}
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
            {invoices.map((invoice) => (
              <div className={styles.invoiceRow} key={invoice.id}>
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
          value="$125,000"
          change="+12.4%"
          subtitle="Last 30 days"
          icon={Receipt}
          iconClass={styles.orangeIcon}
        />

        <StatCard
          title="Total Expenses"
          value="$89,500"
          change="-6.8%"
          subtitle="Last 30 days"
          icon={CreditCard}
          iconClass={styles.blueIcon}
          negative
        />

        <StatCard
          title="Pending Invoices"
          value="12"
          change="+5.2%"
          subtitle="Last 30 days"
          icon={FileText}
          iconClass={styles.pinkIcon}
        />

        <StatCard
          title="Budget Utilization"
          value="65%"
          change="+5.2%"
          subtitle="Last 30 days"
          icon={BarChart3}
          iconClass={styles.purpleIcon}
        />

        <StatCard
          title="Net Profit / Loss"
          value="$35,500"
          change="+18%"
          subtitle="Last 30 days"
          icon={TrendingUp}
          iconClass={styles.greenIcon}
        />
      </section>

      {/* CHARTS */}
      <section className={styles.chartsGrid}>
        {/* REVENUE */}
        <div className={`${styles.card} ${styles.revenueDonutCard}`}>
          <div className={styles.cardHeader}>
            <h2>Revenue</h2>

            <button className={styles.selectButton}>
              Weekly
              <ChevronDown size={15} />
            </button>
          </div>

          <div className={styles.donutArea}>
            <DonutChart
              data={revenueData}
              colors={revenueColors}
              centerValue="90%"
              centerLabel=""
            />
          </div>

          <div className={styles.legendList}>
            {revenueData.map((item, index) => (
              <div className={styles.legendItem} key={item.name}>
                <span
                  className={styles.legendDot}
                  style={{ backgroundColor: revenueColors[index] }}
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
                data={profitData}
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
                  formatter={(value) => `$${value.toLocaleString()}`}
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

        {/* EXPENSES */}
        <div className={`${styles.card} ${styles.expenseCard}`}>
          <div className={styles.cardHeader}>
            <h2>Expenses</h2>

            <button className={styles.selectButton}>
              2026
              <ChevronDown size={15} />
            </button>
          </div>

          <div className={styles.expenseDonut}>
            <DonutChart
              data={expenseData}
              colors={expenseColors}
              centerValue="50%"
              centerLabel="Salaries"
            />
          </div>

          <div className={styles.expenseLegend}>
            {expenseData.map((item, index) => (
              <div className={styles.expenseLegendRow} key={item.name}>
                <div>
                  <span
                    className={styles.legendDot}
                    style={{ backgroundColor: expenseColors[index] }}
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
          <h2>Recent Payments</h2>

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
              {payments.map((payment) => {
                const Icon = payment.icon;

                return (
                  <tr key={payment.id}>
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