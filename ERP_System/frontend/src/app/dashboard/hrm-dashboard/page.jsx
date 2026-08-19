"use client";

import { useState, useEffect } from "react";
import DashboardNav from "@/components/adminPanel/DashboardNav/DashboardNav";
import apiClient from "@/services/apiClient";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";

import styles from "./hrmDashboard.module.css";

/* =========================================================
   DATA
========================================================= */

const employeeDistribution = [
  { name: "Engineering", value: 488 },
  { name: "Marketing", value: 282 },
  { name: "Finance", value: 231 },
  { name: "Sales", value: 180 },
  { name: "HR", value: 103 },
];

const attendanceData = [
  { day: "Mon", present: 1180, late: 62, absent: 42 },
  { day: "Tue", present: 1201, late: 51, absent: 32 },
  { day: "Wed", present: 1174, late: 71, absent: 47 },
  { day: "Thu", present: 1210, late: 48, absent: 29 },
  { day: "Fri", present: 1195, late: 57, absent: 34 },
  { day: "Sat", present: 760, late: 32, absent: 22 },
  { day: "Sun", present: 420, late: 15, absent: 12 },
];

const payrollData = [
  {
    month: "Jan",
    payroll: 1080,
    employees: 1050,
  },
  {
    month: "Feb",
    payroll: 1125,
    employees: 1098,
  },
  {
    month: "Mar",
    payroll: 1196,
    employees: 1140,
  },
  {
    month: "Apr",
    payroll: 1210,
    employees: 1165,
  },
  {
    month: "May",
    payroll: 1230,
    employees: 1184,
  },
  {
    month: "Jun",
    payroll: 1248,
    employees: 1196,
  },
];

const candidates = [
  {
    initial: "A",
    name: "Alex Thompson",
    role: "Senior Developer",
    status: "Interview",
    avatar: "a1",
  },
  {
    initial: "M",
    name: "Maria Garcia",
    role: "UX Designer",
    status: "Applied",
    avatar: "a2",
  },
  {
    initial: "T",
    name: "Thomas Mervin",
    role: "Senior Developer",
    status: "Offer Made",
    avatar: "a3",
  },
  {
    initial: "R",
    name: "Regina Bryant",
    role: "Android Developer",
    status: "Hired",
    avatar: "a4",
  },
];

const performers = [
  {
    initial: "E",
    name: "Evelyn Hayes",
    role: "Product Manager",
    score: 98,
    growth: "2.8%",
    avatar: "a5",
  },
  {
    initial: "E",
    name: "Emily Carter",
    role: "Android Developer",
    score: 96,
    growth: "4.8%",
    avatar: "a6",
  },
  {
    initial: "D",
    name: "Daniel Roberts",
    role: "Graphic Designer",
    score: 94,
    growth: "29.6%",
    avatar: "a7",
  },
];

const jobs = [
  {
    icon: "●",
    title: "Senior IOS Developer",
    category: "IOS",
    location: "New York, USA",
    openings: "02",
    status: "Active",
  },
  {
    icon: "PHP",
    title: "Junior PHP Developer",
    category: "Web & Application",
    location: "Los Angeles, USA",
    openings: "03",
    status: "Active",
    iconClass: "php",
  },
  {
    icon: "◎",
    title: "Network Engineer",
    category: "Networking",
    location: "Bristol, UK",
    openings: "01",
    status: "Expired",
  },
  {
    icon: "⚛",
    title: "Junior React Developer",
    category: "Web & Application",
    location: "Birmingham, UK",
    openings: "04",
    status: "Active",
    iconClass: "react",
  },
  {
    icon: "⌁",
    title: "Senior Laravel Developer",
    category: "Web & Application",
    location: "Washington, USA",
    openings: "02",
    status: "Active",
    iconClass: "laravel",
  },
];

/* =========================================================
   CHART COLORS
========================================================= */

const PIE_COLORS = [
  "#1EA7A0",
  "#ED5B08",
  "#059B6C",
  "#CB24AC",
  "#1D2A40",
];

/* =========================================================
   CUSTOM TOOLTIP
========================================================= */

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) {
    return null;
  }

  return (
    <div className={styles.chartTooltip}>
      {label && <strong>{label}</strong>}

      {payload.map((item, index) => (
        <div key={`${item.name}-${index}`}>
          <span>{item.name}</span>
          <b>{item.value}</b>
        </div>
      ))}
    </div>
  );
}

/* =========================================================
   BUTTON
========================================================= */

function Button({
  children,
  dark = false,
  className = "",
  onClick,
}) {
  return (
    <button
      type="button"
      className={`${styles.btn} ${
        dark ? styles.dark : ""
      } ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  icon,
  color,
  title,
  value,
  trend = "3.64%",
}) {
  return (
    <article
      className={`${styles.card} ${styles.statCard}`}
    >
      <div className={styles.statHead}>
        <div
          className={`${styles.iconBox} ${styles[color]}`}
        >
          {icon}
        </div>

        <span className={styles.trend}>
          ↗ {trend}
        </span>
      </div>

      <p>{title}</p>

      <strong>{value}</strong>
    </article>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function Page() {
  const [payrollRunning, setPayrollRunning] = useState(false);
  const [exported, setExported] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("6 Months");
  const [totalEmployeesCount, setTotalEmployeesCount] = useState(0);

  useEffect(() => {
    fetchHrmData();
  }, []);

  const fetchHrmData = async () => {
    try {
      const res = await apiClient.get("/employees").catch(() => ({ data: { data: [] } }));
      const emps = res.data?.data || [];
      setTotalEmployeesCount(emps.length);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePayroll = () => {
    setPayrollRunning(true);

    setTimeout(() => {
      setPayrollRunning(false);
    }, 1800);
  };

  const handleExport = () => {
    setExported(true);

    setTimeout(() => {
      setExported(false);
    }, 1800);
  };

  return (
    <main className={styles.dashboard}>
      <DashboardNav />

      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className={styles.topbar}>
        <div>
          <h1>
            HRM & Workforce Portal <span></span>
          </h1>

          <p>
            Employee Management, Attendance, and Staff Telemetry
          </p>
        </div>

        <div className={styles.actions}>
          <Button onClick={handleExport}>
            ⇩{" "}
            {exported
              ? "Exported"
              : "Export"}{" "}
            ⌄
          </Button>

          <Button dark>
            ＋ Add Employee
          </Button>
        </div>
      </header>


      {/* =====================================================
          TOP GRID
      ====================================================== */}

      <section className={styles.topGrid}>

        {/* LEFT COLUMN */}
        <div className={styles.leftColumn}>

          {/* TOTAL WORKFORCE */}
          <article
            className={`${styles.card} ${styles.workforce}`}
          >
            <div>
              <h2>Total Workforce</h2>

              <div className={styles.metricRow}>
                <strong>{totalEmployeesCount ? `${totalEmployeesCount} Staff` : "1,284"}</strong>

                <span className={styles.trend}>
                  ↗ 12 new this month
                </span>
              </div>

              <p>
                Active employees across 7 departments
              </p>
            </div>

            <div
              className={`${styles.iconBox} ${styles.blue}`}
            >
              ♙
            </div>
          </article>


          {/* STAT CARDS */}
          <div className={styles.statGrid}>

            <StatCard
              icon="□"
              color="teal"
              title="On Leave Today"
              value="23"
              trend="3.64%"
            />

            <StatCard
              icon="⌕"
              color="orange"
              title="Attendance Rate"
              value="94.2%"
              trend="2.18%"
            />

            <StatCard
              icon="♙"
              color="purple"
              title="Open Positions"
              value="47"
              trend="6.25%"
            />

            <StatCard
              icon="$"
              color="red"
              title="Monthly Payroll"
              value="$1,248K"
              trend="4.2%"
            />

          </div>


          {/* RUN PAYROLL */}
          <article
            className={`${styles.card} ${styles.runPayroll}`}
          >
            <div>
              <h2>Run Payroll</h2>

              <p>
                Process monthly payroll for all employees
              </p>
            </div>

            <Button
              className={styles.white}
              onClick={handlePayroll}
            >
              {payrollRunning
                ? "✓ Processing..."
                : "$ Run Payroll"}
            </Button>
          </article>

        </div>


        {/* =================================================
            EMPLOYEE DISTRIBUTION
        ================================================== */}

        <article
          className={`${styles.card} ${styles.distribution}`}
        >

          <div className={styles.sectionTitle}>
            <h2>Employee Distribution</h2>

            <span className={styles.live}>
              ● Live
            </span>
          </div>


          <div className={styles.distributionChart}>

            <ResponsiveContainer
              width="100%"
              height={240}
            >
              <PieChart>

                <Pie
                  data={employeeDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={67}
                  outerRadius={92}
                  paddingAngle={2}
                  stroke="none"
                >
                  {employeeDistribution.map(
                    (entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          PIE_COLORS[index %
                            PIE_COLORS.length]
                        }
                      />
                    )
                  )}
                </Pie>

                <Tooltip
                  content={<ChartTooltip />}
                />

              </PieChart>
            </ResponsiveContainer>

            <div
              className={styles.donutCenter}
            >
              <strong>1,284</strong>
              <span>Employees</span>
            </div>

          </div>


          {/* LEGEND */}

          <div className={styles.legend}>

            {employeeDistribution.map(
              (department, index) => (
                <div
                  key={department.name}
                >
                  <i
                    style={{
                      background:
                        PIE_COLORS[index],
                    }}
                  />

                  <span>
                    {department.name}
                  </span>

                  <b>
                    {department.value}
                  </b>
                </div>
              )
            )}

          </div>


          {/* MINI STATS */}

          <div className={styles.miniStats}>

            <div>
              <b>1,196</b>
              <span>Active</span>
            </div>

            <div>
              <b>88</b>
              <span>On Leave</span>
            </div>

            <div>
              <b>12</b>
              <span>New</span>
            </div>

          </div>

        </article>


        {/* =================================================
            ATTENDANCE
        ================================================== */}

        <article
          className={`${styles.card} ${styles.attendance}`}
        >

          <div className={styles.sectionTitle}>

            <div>
              <h2>
                Attendance Summary
              </h2>

              <p className={styles.chartSubtitle}>
                Weekly employee attendance overview
              </p>
            </div>

            <Button className={styles.smallBtn}>
              View Logs ›
            </Button>

          </div>


          {/* ATTENDANCE STATS */}

          <div className={styles.attendanceGrid}>

            <div>
              <span>Present</span>
              <b>1,209</b>
              <small>94.2% of workforce</small>
            </div>

            <div>
              <span>Late</span>
              <b>78</b>
              <small>After 9:30 AM</small>
            </div>

            <div>
              <span>Absent</span>
              <b>52</b>
              <small>Unplanned absence</small>
            </div>

            <div>
              <span>Remote</span>
              <b>361</b>
              <small>WFH approved</small>
            </div>

          </div>


          {/* REAL BAR CHART */}

          <div className={styles.chartTitleRow}>
            <h3>Weekly Attendance Trend</h3>

            <div className={styles.chartLegend}>
              <span>
                <i className={styles.presentDot} />
                Present
              </span>

              <span>
                <i className={styles.lateDot} />
                Late
              </span>

              <span>
                <i className={styles.absentDot} />
                Absent
              </span>
            </div>
          </div>


          <div className={styles.attendanceChart}>

            <ResponsiveContainer
              width="100%"
              height={190}
            >
              <BarChart
                data={attendanceData}
                margin={{
                  top: 5,
                  right: 5,
                  left: -20,
                  bottom: 0,
                }}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e8edf1"
                />

                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "#748298",
                    fontSize: 11,
                  }}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "#748298",
                    fontSize: 10,
                  }}
                />

                <Tooltip
                  content={<ChartTooltip />}
                  cursor={{
                    fill: "rgba(0, 149, 116, 0.05)",
                  }}
                />

                <Bar
                  dataKey="present"
                  name="Present"
                  fill="#079574"
                  radius={[
                    4,
                    4,
                    0,
                    0,
                  ]}
                  barSize={12}
                />

                <Bar
                  dataKey="late"
                  name="Late"
                  fill="#f28b22"
                  radius={[
                    4,
                    4,
                    0,
                    0,
                  ]}
                  barSize={12}
                />

                <Bar
                  dataKey="absent"
                  name="Absent"
                  fill="#e34845"
                  radius={[
                    4,
                    4,
                    0,
                    0,
                  ]}
                  barSize={12}
                />

              </BarChart>
            </ResponsiveContainer>

          </div>

        </article>

      </section>


      {/* =====================================================
          MIDDLE GRID
      ====================================================== */}

      <section className={styles.middleGrid}>

        {/* =================================================
            MONTHLY PAYROLL
        ================================================== */}

        <article
          className={`${styles.card} ${styles.payroll}`}
        >

          <div className={styles.payrollHead}>

            <div>

              <h2>
                Monthly Payroll
              </h2>

              <strong>
                $1,248K
              </strong>

              <p>
                June 2026 · 1,196 employees
              </p>

            </div>

            <Button className={styles.white}>
              ⇩ Download Payslip
            </Button>

          </div>


          {/* PAYROLL STATS */}

          <div className={styles.payrollStats}>

            <div>
              <span>Avg Salary</span>
              <b>$1,285</b>
            </div>

            <div>
              <span>Last Month</span>
              <b>$1,230K</b>
            </div>

            <div>
              <span>MOM Growth</span>
              <b className={styles.greenText}>
                4.2%
              </b>
            </div>

          </div>


          {/* CHART HEADER */}

          <div className={styles.chartHeader}>

            <div>
              <h3>
                6-Month Payroll Trend
              </h3>

              <p>
                Total payroll expenditure
              </p>
            </div>

            <select
              value={selectedPeriod}
              onChange={(e) =>
                setSelectedPeriod(
                  e.target.value
                )
              }
              className={styles.chartSelect}
            >
              <option>6 Months</option>
              <option>3 Months</option>
              <option>12 Months</option>
            </select>

          </div>


          {/* REAL AREA CHART */}

          <div className={styles.payrollChart}>

            <ResponsiveContainer
              width="100%"
              height={230}
            >
              <AreaChart
                data={payrollData}
                margin={{
                  top: 10,
                  right: 10,
                  left: -15,
                  bottom: 0,
                }}
              >

                <defs>

                  <linearGradient
                    id="payrollGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#079574"
                      stopOpacity={0.28}
                    />

                    <stop
                      offset="100%"
                      stopColor="#079574"
                      stopOpacity={0.02}
                    />
                  </linearGradient>

                </defs>


                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e8edf1"
                />

                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "#748298",
                    fontSize: 11,
                  }}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "#748298",
                    fontSize: 10,
                  }}
                  tickFormatter={(value) =>
                    `$${value}K`
                  }
                />

                <Tooltip
                  content={<ChartTooltip />}
                />

                <Area
                  type="monotone"
                  dataKey="payroll"
                  name="Payroll"
                  stroke="#079574"
                  strokeWidth={3}
                  fill="url(#payrollGradient)"
                  activeDot={{
                    r: 6,
                    fill: "#079574",
                    stroke: "#ffffff",
                    strokeWidth: 3,
                  }}
                />

              </AreaChart>
            </ResponsiveContainer>

          </div>

        </article>


        {/* =================================================
            RECRUITMENT
        ================================================== */}

        <article
          className={`${styles.card} ${styles.recruitment}`}
        >

          <div className={styles.sectionTitle}>

            <div>
              <h2>
                Recruitment Pipeline
              </h2>

              <p className={styles.chartSubtitle}>
                Track candidates through hiring stages
              </p>
            </div>

            <Button className={styles.smallBtn}>
              ＋ Post New Job
            </Button>

          </div>


          {/* PIPELINE */}

          <div className={styles.pipeline}>

            <div className={styles.pipeline0}>
              <b>47</b>
              <span>
                ▣ New Applicants
              </span>
            </div>

            <div className={styles.pipeline1}>
              <b>23</b>
              <span>
                ♙ Screening
              </span>
            </div>

            <div className={styles.pipeline2}>
              <b>12</b>
              <span>
                ▣ Interviews
              </span>
            </div>

          </div>


          <h3>
            Recent Candidates
          </h3>


          {/* CANDIDATES */}

          <div className={styles.candidates}>

            {candidates.map(
              (candidate) => (
                <div
                  className={
                    styles.candidate
                  }
                  key={candidate.name}
                >

                  <span
                    className={`${styles.avatar} ${
                      styles[
                        candidate.avatar
                      ]
                    }`}
                  >
                    {candidate.initial}
                  </span>


                  <div>

                    <b>
                      {candidate.name}
                    </b>

                    <small>
                      {candidate.role}
                    </small>

                  </div>


                  <em>
                    {candidate.status}
                  </em>

                </div>
              )
            )}

          </div>

        </article>

      </section>


      {/* =====================================================
          BOTTOM GRID
      ====================================================== */}

      <section className={styles.bottomGrid}>

        {/* =================================================
            PERFORMANCE
        ================================================== */}

        <article
          className={`${styles.card} ${styles.performance}`}
        >

          <div className={styles.sectionTitle}>

            <div>
              <h2>
                Performance Tracking
              </h2>

              <p className={styles.chartSubtitle}>
                Employee performance overview
              </p>
            </div>

            <Button className={styles.smallBtn}>
              Full Report ›
            </Button>

          </div>


          {/* PERFORMERS */}

          {performers.map(
            (person) => (
              <div
                className={styles.performer}
                key={person.name}
              >

                <span
                  className={`${styles.avatar} ${
                    styles[
                      person.avatar
                    ]
                  }`}
                >
                  {person.initial}
                </span>


                <div>

                  <b>
                    {person.name}
                  </b>

                  <small>
                    {person.role}
                  </small>

                </div>


                <strong>

                  {person.score}

                  <em>
                    ↗ {person.growth}
                  </em>

                </strong>

              </div>
            )
          )}


          {/* HIRING TARGET */}

          <div className={styles.progress}>

            <div style={{ width: "87%" }} />

            <span>
              Hiring Target

              <b>
                87%
              </b>
            </span>

          </div>


          {/* RETENTION */}

          <div
            className={`${styles.progress} ${styles.progressOrange}`}
          >

            <div style={{ width: "92%" }} />

            <span>
              Employee Retention

              <b>
                92%
              </b>
            </span>

          </div>

        </article>


        {/* =================================================
            JOB OPENINGS
        ================================================== */}

        <article
          className={`${styles.card} ${styles.payments}`}
        >

          <div className={styles.sectionTitle}>

            <div>
              <h2>
                Recent Job Openings
              </h2>

              <p className={styles.chartSubtitle}>
                Latest recruitment opportunities
              </p>
            </div>

            <Button className={styles.smallBtn}>
              All Openings ›
            </Button>

          </div>


          <div className={styles.table}>

            {/* HEADER */}

            <div
              className={`${styles.tr} ${styles.head}`}
            >

              <span>
                Job Title
              </span>

              <span>
                Category
              </span>

              <span>
                Location
              </span>

              <span>
                Openings
              </span>

              <span>
                Status
              </span>

            </div>


            {/* ROWS */}

            {jobs.map(
              (job) => (
                <div
                  className={styles.tr}
                  key={job.title}
                >

                  <span>

                    <i
                      className={`${styles.brand} ${
                        job.iconClass
                          ? styles[
                              job
                                .iconClass
                            ]
                          : ""
                      }`}
                    >
                      {job.icon}
                    </i>

                    <b>
                      {job.title}
                    </b>

                  </span>


                  <span>
                    {job.category}
                  </span>


                  <span>
                    {job.location}
                  </span>


                  <span>
                    {job.openings}
                  </span>


                  <span
                    className={`${styles.status} ${
                      job.status ===
                      "Active"
                        ? styles.active
                        : styles.expired
                    }`}
                  >
                    {job.status ===
                    "Active"
                      ? "✓ Active"
                      : "× Expired"}
                  </span>

                </div>
              )
            )}

          </div>

        </article>

      </section>


      {/* =====================================================
          FOOTER
      ====================================================== */}

      <footer className={styles.footer}>
        2026 © Dreams ERP. All Rights Reserved
      </footer>

    </main>
  );
}