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
  MoreHorizontal,
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

const revenueData = [
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

const customers = [
  {
    name: "Robert Cosper",
    id: "#CUS0020",
    amount: "$4,500",
    avatar: "https://i.pravatar.cc/100?img=12",
  },
  {
    name: "Helen Nelson",
    id: "#CUS0019",
    amount: "$5,200",
    avatar: "https://i.pravatar.cc/100?img=47",
  },
  {
    name: "Thomas Neal",
    id: "#CUS0018",
    amount: "$2,800",
    avatar: "https://i.pravatar.cc/100?img=32",
  },
  {
    name: "Sarah Spivey",
    id: "#CUS0017",
    amount: "$1,750",
    avatar: "https://i.pravatar.cc/100?img=53",
  },
  {
    name: "Jared Griffin",
    id: "#CUS0016",
    amount: "$3,000",
    avatar: "https://i.pravatar.cc/100?img=11",
  },
];

const products = [
  {
    name: "Apple iPhone 15",
    price: "$250",
    sales: "1,250",
    status: "In Stock",
    icon: "",
    type: "apple",
  },
  {
    name: "Dell XPS 13 9310",
    price: "$185",
    sales: "2,250",
    status: "In Stock",
    icon: "▱",
    type: "laptop",
  },
  {
    name: "Bose QuietComfort 45",
    price: "$120",
    sales: "1,600",
    status: "In Stock",
    icon: "♧",
    type: "headphone",
  },
  {
    name: "Adidas Running Shoe",
    price: "$140",
    sales: "1,850",
    status: "Out of Stock",
    icon: "⌁",
    type: "shoe",
  },
  {
    name: "Dyson Vacuum Cleaner",
    price: "$220",
    sales: "2,200",
    status: "In Stock",
    icon: "✣",
    type: "vacuum",
  },
];

const transactions = [
  {
    name: "Alexander Kenn",
    id: "#PAY0020",
    amount: "$500",
    date: "05 Sep 2025",
    status: "Paid",
    avatar: "https://i.pravatar.cc/100?img=12",
  },
  {
    name: "Gabriella White",
    id: "#PAY0019",
    amount: "$250",
    date: "11 Sep 2025",
    status: "Pending",
    avatar: "https://i.pravatar.cc/100?img=47",
  },
  {
    name: "Christopher Rey",
    id: "#PAY0018",
    amount: "$300",
    date: "27 Aug 2025",
    status: "Failed",
    avatar: "https://i.pravatar.cc/100?img=32",
  },
  {
    name: "Penelope Ton",
    id: "#PAY0017",
    amount: "$850",
    date: "15 Aug 2025",
    status: "Paid",
    avatar: "https://i.pravatar.cc/100?img=53",
  },
  {
    name: "Catherine Lan",
    id: "#PAY0016",
    amount: "$600",
    date: "02 Aug 2025",
    status: "Pending",
    avatar: "https://i.pravatar.cc/100?img=11",
  },
];

const salesActivity = [
  {
    id: "#INV0020",
    type: "Invoice",
    customer: "Alexander Kenn",
    amount: "$500",
    date: "11 Sep 2025",
    status: "Paid",
    avatar: "https://i.pravatar.cc/100?img=12",
  },
  {
    id: "#SAO0019",
    type: "Sales Order",
    customer: "Gabriella White",
    amount: "$650",
    date: "05 Sep 2025",
    status: "Pending",
    avatar: "https://i.pravatar.cc/100?img=47",
  },
  {
    id: "#CRN0018",
    type: "Credit Note",
    customer: "Christopher Rey",
    amount: "$120",
    date: "27 Aug 2025",
    status: "Issued",
    avatar: "https://i.pravatar.cc/100?img=32",
  },
  {
    id: "#SAQ0017",
    type: "Sales Quote",
    customer: "Penelope Ton",
    amount: "$860",
    date: "16 Aug 2025",
    status: "Sent",
    avatar: "https://i.pravatar.cc/100?img=53",
  },
  {
    id: "#INV0016",
    type: "Invoice",
    customer: "Catherine Lan",
    amount: "$450",
    date: "12 Aug 2025",
    status: "Paid",
    avatar: "https://i.pravatar.cc/100?img=11",
  },
];

function formatRevenue(value) {
  if (value >= 1000000) {
    return `${value / 1000000}M`;
  }
  return `${value / 1000}K`;
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
      alt={name}
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
  const [liveProducts, setLiveProducts] = useState([]);
  const [totalSalesValue, setTotalSalesValue] = useState(0);

  useEffect(() => {
    fetchSalesData();
  }, []);

  const fetchSalesData = async () => {
    try {
      const res = await apiClient.get("/products").catch(() => ({ data: { data: [] } }));
      const prods = res.data?.data || [];
      setLiveProducts(prods);
      let sum = 0;
      prods.forEach((p) => {
        const qty = p.inventories?.reduce((a, b) => a + (b.quantity || 0), 0) || 0;
        sum += qty * (parseFloat(p.sellingPrice) || 0);
      });
      setTotalSalesValue(sum);
    } catch (err) {
      console.error(err);
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
            <Avatar
              src="https://i.pravatar.cc/100?img=12"
              name="Team member"
            />
            <Avatar
              src="https://i.pravatar.cc/100?img=47"
              name="Team member"
            />
            <Avatar
              src="https://i.pravatar.cc/100?img=32"
              name="Team member"
            />
            <Avatar
              src="https://i.pravatar.cc/100?img=53"
              name="Team member"
            />

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
                data={revenueData}
                margin={{
                  top: 20,
                  right: 20,
                  left: 10,
                  bottom: 10,
                }}
              >
                <CartesianGrid
                  strokeDasharray="4 5"
                  vertical={false}
                  stroke="#e5e7eb"
                />

                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "#718096",
                    fontSize: 13,
                  }}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={formatRevenue}
                  domain={[0, 1000000]}
                  ticks={[
                    0,
                    200000,
                    400000,
                    600000,
                    800000,
                    1000000,
                  ]}
                  tick={{
                    fill: "#718096",
                    fontSize: 13,
                  }}
                />

                <Tooltip
                  cursor={{ fill: "rgba(15, 118, 110, 0.04)" }}
                  formatter={(value) => [
                    `$${Number(value).toLocaleString()}`,
                    "Revenue",
                  ]}
                  contentStyle={{
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    boxShadow:
                      "0 8px 20px rgba(0,0,0,0.08)",
                  }}
                />

                <Bar
                  dataKey="revenue"
                  radius={[5, 5, 0, 0]}
                  barSize={42}
                  fill="#f8e9d9"
                  activeBar={{
                    fill: "#f26b21",
                  }}
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
              <strong>$2.4M</strong>
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
            <strong>12.8K</strong>
          </div>

          <div className={`${styles.kpiIcon} ${styles.greenIcon}`}>
            <DollarSign size={21} />
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div>
            <span className={styles.kpiTitle}>Open Invoices</span>
            <strong>28</strong>
          </div>

          <div className={`${styles.kpiIcon} ${styles.orangeIcon}`}>
            <FileText size={21} />
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div>
            <span className={styles.kpiTitle}>Open Orders</span>
            <strong>156</strong>
          </div>

          <div className={`${styles.kpiIcon} ${styles.tealIcon}`}>
            <ShoppingCart size={21} />
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div>
            <span className={styles.kpiTitle}>New Customers</span>
            <strong>378</strong>
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
            {customers.map((customer) => (
              <div className={styles.customerRow} key={customer.id}>
                <div className={styles.personInfo}>
                  <Avatar
                    src={customer.avatar}
                    name={customer.name}
                  />

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
            {products.map((product) => (
              <div
                className={styles.productRow}
                key={product.name}
              >
                <div
                  className={`${styles.productIcon} ${styles[product.type]}`}
                >
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
            {transactions.map((transaction) => (
              <div
                className={styles.transactionRow}
                key={transaction.id}
              >
                <div className={styles.personInfo}>
                  <Avatar
                    src={transaction.avatar}
                    name={transaction.name}
                  />

                  <div>
                    <strong>{transaction.name}</strong>

                    <div className={styles.transactionId}>
                      {transaction.id}
                      <StatusBadge
                        status={transaction.status}
                      />
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
              {salesActivity.map((sale) => (
                <tr key={sale.id}>
                  <td>{sale.id}</td>

                  <td>{sale.type}</td>

                  <td>
                    <div className={styles.tableCustomer}>
                      <Avatar
                        src={sale.avatar}
                        name={sale.customer}
                      />

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