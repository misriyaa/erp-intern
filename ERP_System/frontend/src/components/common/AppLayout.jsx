"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/adminPanel/Sidebar/Sidebar";
import Header from "@/components/adminPanel/Header/Header";
import { SettingsProvider } from "@/context/SettingsContext";
import { AlertProvider } from "@/context/AlertContext";
import { CompanyProvider, useCompany } from "@/context/CompanyContext";
import IndustryRouteGuard from "@/components/common/IndustryRouteGuard";
import { FiMonitor, FiShoppingCart, FiLogOut, FiUser } from "react-icons/fi";
import styles from "./AppLayout.module.css";

function AppShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isLaundry, isRestaurant, clearSession } = useCompany();

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const closeSidebar = () => setSidebarOpen(false);

  const roleUpper = (user?.role || "").toUpperCase();
  const isCashier = roleUpper.includes("CASHIER");

  const posRoute = isLaundry ? "/laundry/pos" : isRestaurant ? "/restaurant/pos" : "/pos";
  const ordersRoute = isLaundry ? "/laundry/orders" : isRestaurant ? "/restaurant/orders" : "/sales";

  // Redirect Cashier away from Dashboard directly to POS Screen
  useEffect(() => {
    if (isCashier && (pathname === "/dashboard" || pathname === "/")) {
      router.replace(posRoute);
    }
  }, [isCashier, pathname, posRoute, router]);

  const handleLogout = () => {
    clearSession();
    if (typeof window !== "undefined") {
      window.location.href = "/auth/login";
    }
  };

  // CASHIER DEDICATED SHELL (HIDE SIDEBAR, TOP NAV FOR POS & ORDER HISTORY ONLY)
  if (isCashier && !isLaundry) {

    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc", fontFamily: "Inter, sans-serif" }}>
        {/* Cashier Top Navigation Bar */}
        <header
          style={{
            height: "64px",
            backgroundColor: "#0f172a",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 24px",
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
            position: "sticky",
            top: 0,
            zIndex: 100,
          }}
        >
          {/* Left Brand & Cashier Mode Badge */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ fontWeight: "800", fontSize: "18px", letterSpacing: "0.5px" }}>
              {isLaundry ? "🧺 LAUNDRY POS" : "🛒 CASHIER COUNTER"}
            </div>
            <span
              style={{
                fontSize: "11px",
                fontWeight: "700",
                backgroundColor: "#16a34a",
                color: "#ffffff",
                padding: "3px 10px",
                borderRadius: "12px",
                textTransform: "uppercase",
              }}
            >
              Cashier Mode
            </span>
          </div>

          {/* Center Top Nav: POS Screen & Order History ONLY */}
          <nav style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Link
              href={posRoute}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 18px",
                borderRadius: "8px",
                backgroundColor:
                  pathname === posRoute ||
                  (pathname.startsWith(posRoute + "/") && !pathname.startsWith("/pos/history"))
                    ? "#2563eb"
                    : "rgba(255,255,255,0.08)",
                color: "#ffffff",
                fontWeight: "700",
                fontSize: "14px",
                textDecoration: "none",
                transition: "all 0.15s ease",
              }}
            >
              <FiMonitor size={16} />
              <span>POS Screen</span>
            </Link>

            <Link
              href={ordersRoute}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 18px",
                borderRadius: "8px",
                backgroundColor:
                  pathname === ordersRoute || pathname.startsWith(ordersRoute + "/")
                    ? "#2563eb"
                    : "rgba(255,255,255,0.08)",
                color: "#ffffff",
                fontWeight: "700",
                fontSize: "14px",
                textDecoration: "none",
                transition: "all 0.15s ease",
              }}
            >
              <FiShoppingCart size={16} />
              <span>Order History</span>
            </Link>
          </nav>

          {/* Right User Profile & Sign Out */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "13px", fontWeight: "700" }}>{user?.fullName || "Cashier User"}</div>
              <div style={{ fontSize: "11px", color: "#94a3b8" }}>{user?.email || "cashier@erp.com"}</div>
            </div>

            <button
              onClick={handleLogout}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "7px 14px",
                backgroundColor: "#dc2626",
                color: "#ffffff",
                border: "none",
                borderRadius: "6px",
                fontWeight: "700",
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              <FiLogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        </header>

        {/* Page Body */}
        <main style={{ padding: "0" }}>
          <IndustryRouteGuard>{children}</IndustryRouteGuard>
        </main>
      </div>
    );
  }

  // Standard ERP Layout with Sidebar
  return (
    <div className={styles.appWrapper}>
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      {sidebarOpen && (
        <div className={styles.overlay} onClick={closeSidebar} />
      )}

      <div className={styles.mainContent}>
        <Header toggleSidebar={toggleSidebar} />
        <main className={styles.pageBody}>
          <IndustryRouteGuard>{children}</IndustryRouteGuard>
        </main>
      </div>
    </div>
  );
}

export default function AppLayout({ children }) {
  const pathname = usePathname();

  // Exclude public landing page and auth routes from ERP sidebar/topbar shell
  const isPublicPage =
    pathname === "/" ||
    pathname.startsWith("/auth");

  if (isPublicPage) {
    return (
      <CompanyProvider>
        <SettingsProvider>
          <AlertProvider>{children}</AlertProvider>
        </SettingsProvider>
      </CompanyProvider>
    );
  }

  return (
    <CompanyProvider>
      <SettingsProvider>
        <AlertProvider>
          <AppShell>{children}</AppShell>
        </AlertProvider>
      </SettingsProvider>
    </CompanyProvider>
  );
}
