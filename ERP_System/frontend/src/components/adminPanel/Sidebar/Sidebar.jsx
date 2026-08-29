"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSettings } from "@/context/SettingsContext";
import { useCompany } from "@/context/CompanyContext";
import { MASTER_NAVIGATION_CATALOG } from "@/config/industries";
import { restaurantService } from "@/services/restaurantService";

import {
  FiGrid,
  FiUserCheck,
  FiBriefcase,
  FiX,
  FiLogOut,
  FiShield,
  FiCoffee,
  FiFilter,
  FiUsers,
  FiCalendar,
  FiCheckSquare,
  FiActivity,
  FiClock,
  FiTrendingUp,
  FiMail,
  FiBarChart2,
  FiUser,
} from "react-icons/fi";

import styles from "./Sidebar.module.css";

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const router = useRouter();
  const { settings, logoUrl } = useSettings();
  const { user, company, isModuleEnabled, isGym, isTextile, isRestaurant, isLaundry, isMedical, isRetail, industryCode, clearSession, loading } = useCompany();

  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState("");

  useEffect(() => {
    fetchRestaurantsList();
  }, []);

  const fetchRestaurantsList = async () => {
    try {
      const res = await restaurantService.getRestaurants();
      setRestaurants(res.data || []);
    } catch (err) {
      console.error("Failed to load restaurants for sidebar filter:", err);
    }
  };

  const handleRestaurantFilterChange = (restaurantId) => {
    setSelectedRestaurantId(restaurantId);
    if (restaurantId) {
      if (pathname.startsWith("/restaurant/")) {
        router.push(`${pathname}?restaurantId=${restaurantId}`);
      } else {
        router.push(`/restaurant/dashboard?restaurantId=${restaurantId}`);
      }
    } else {
      if (pathname.startsWith("/restaurant/")) {
        router.push(pathname);
      }
    }
  };

  const isActivePath = (href) => {
    if (!href) return false;
    return pathname === href || pathname.startsWith(href + "/");
  };

  const handleLinkClick = () => {
    if (onClose) {
      onClose();
    }
  };

  const handleLogout = (e) => {
    e.preventDefault();
    clearSession();
    if (typeof window !== "undefined") {
      window.location.href = "/auth/login";
    }
  };

  const roleUpper = (user?.role || user?.roleRef?.name || user?.designation || user?.type || "").toUpperCase().replace(/\s+/g, "_");
  const isSuperAdmin = roleUpper.includes("SUPER");
  const isAdmin = isSuperAdmin || roleUpper.includes("ADMIN") || roleUpper.includes("OWNER");
  const isManager = roleUpper.includes("MANAGER");
  const isCashier = roleUpper.includes("CASHIER") || roleUpper.includes("BILLING") || roleUpper.includes("COUNTER");
  const isWaiter = roleUpper.includes("WAITER") || roleUpper.includes("STEWARD") || roleUpper.includes("SERVER");
  const isKitchenStaff = roleUpper.includes("KITCHEN") || roleUpper.includes("CHEF") || roleUpper.includes("COOK");
  const isTrainer = roleUpper.includes("TRAINER");

  const trainerNavItems = [
    { label: "Dashboard", href: "/dashboard", icon: FiGrid },
    
    { label: "Attendance", href: "/gym/attendance", icon: FiCheckSquare },

    
    { label: "Reports & Analytics ", href: "/reports", icon: FiBarChart2 },
    
  ];

  // Filter master catalog based on enabled modules, role and industry context
  const visibleNavItems = MASTER_NAVIGATION_CATALOG.filter((item) => {
    if (item.adminOnly && !isAdmin) {
      return false;
    }
    if (isCashier && !isAdmin && !isManager && (isRestaurant || industryCode?.includes("LAUNDRY"))) {
      const cashierHrefs = ["/restaurant/pos", "/restaurant/orders", "/laundry/pos", "/laundry/orders"];
      if (!cashierHrefs.includes(item.href)) {
        return false;
      }
    }
    if (isWaiter && !isAdmin && !isManager) {
      const waiterHrefs = ["/restaurant/pos", "/restaurant/tables", "/restaurant/reservations", "/restaurant/orders"];
      if (!waiterHrefs.includes(item.href)) {
        return false;
      }
    }
    if (isKitchenStaff && !isAdmin && !isManager) {
      const kitchenHrefs = ["/restaurant/kitchen"];
      if (!kitchenHrefs.includes(item.href)) {
        return false;
      }
    }
    const codeUpper = (industryCode || "").toUpperCase();
    if (item.href === "/dashboard" && ["RESTAURANT", "LAUNDRY"].includes(codeUpper)) {
      return false;
    }
    // For Restaurant ERP: exclude duplicate shared items ("Employees / Staff" and generic "Reports & Analytics")
    if (codeUpper === "RESTAURANT") {
      if (!item.industry && (item.moduleCode === "EMPLOYEES" || item.moduleCode === "REPORTS" || item.moduleCode === "PURCHASES" || item.moduleCode === "WASTAGE")) {
        return false;
      }
    }
    if (item.industry) {
      const itemInd = (item.industry || "").toUpperCase();
      if (codeUpper !== itemInd && !codeUpper.includes(itemInd) && !itemInd.includes(codeUpper)) {
        return false;
      }
    }

    // Custom filtering for Manager in Gym industry
    if (isGym && isManager) {
      const allowedGymManagerItems = [
        "DASHBOARD",
        "MEMBERS",
        "MEMBERSHIP_PLANS",
        "TRAINERS",
        "ATTENDANCE",
        "PAYMENTS",
        "INVENTORY",
        "EMPLOYEES",
        "REPORTS",
      ];
      if (!allowedGymManagerItems.includes(item.moduleCode)) {
        return false;
      }
    }

    return isModuleEnabled(item.moduleCode);
  });

  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.open : ""}`}>
      <div className={styles.logo}>
        <div className={styles.logoBrand}>
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={company?.name || settings?.companyName || "ERP Logo"}
              className={styles.logoImg}
            />
          ) : (
            <h2>{company?.name || settings?.companyName || "ERP Cloud"}</h2>
          )}
        </div>
        {onClose && (
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close menu">
            <FiX size={20} />
          </button>
        )}
      </div>

      <nav>
        {isSuperAdmin && (
          <>
            <h4 className={styles.title}>Super Admin Controls</h4>

            <Link
              href="/admin/superadmin-dashboard"
              className={isActivePath("/admin/superadmin-dashboard") ? styles.active : ""}
              onClick={handleLinkClick}
            >
              <FiGrid />
              <span>SuperAdmin Dashboard</span>
            </Link>

            <Link
              href="/admin/add-admin"
              className={isActivePath("/admin/add-admin") ? styles.active : ""}
              onClick={handleLinkClick}
            >
              <FiUserCheck />
              <span>Add Client / Admin</span>
            </Link>
          </>
        )}

        <h4 className={styles.title}>
          {isGym
            ? "GYM MANAGEMENT MODULES"
            : isTextile
            ? "TEXTILE ERP MODULES"
            : isRestaurant
            ? "RESTAURANT ERP MODULES"
            : isLaundry
            ? "LAUNDRY MODULES"
            : isMedical
            ? "MEDICAL SHOP MODULES"
            : "SUPERMARKET & RESTAURANT ERP"}
        </h4>

        {loading ? (
          <div style={{ padding: "16px 20px", color: "#94a3b8", fontSize: "13px", display: "flex", alignItems: "center", gap: "8px" }}>
            <span>Loading navigation...</span>
          </div>
        ) : isGym && isTrainer ? (
          trainerNavItems.map((item) => {
            const IconComp = item.icon;
            const active = isActivePath(item.href);

            return (
              <Link
                key={`TRAINER-${item.label}-${item.href}`}
                href={item.href}
                className={active ? styles.active : ""}
                onClick={handleLinkClick}
              >
                <IconComp />
                <span>{item.label}</span>
              </Link>
            );
          })
        ) : (
          visibleNavItems.map((item) => {
            const IconComp = item.icon;
            const active = isActivePath(item.href);
            const finalHref = selectedRestaurantId && item.href.startsWith("/restaurant/")
              ? `${item.href}?restaurantId=${selectedRestaurantId}`
              : item.href;

            return (
              <Link
                key={`${item.industry || "SHARED"}-${item.moduleCode}-${item.label}-${item.href}`}
                href={finalHref}
                className={active ? styles.active : ""}
                onClick={handleLinkClick}
              >
                <IconComp />
                <span>{item.label}</span>
              </Link>
            );
          })
        )}

        <div style={{ marginTop: "24px", paddingTop: "12px", borderTop: "1px solid #334155" }}>
          <button
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              width: "100%",
              padding: "10px 16px",
              background: "transparent",
              border: "none",
              color: "#ef4444",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <FiLogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </nav>
    </aside>
  );
}
