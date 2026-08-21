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
} from "react-icons/fi";

import styles from "./Sidebar.module.css";

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const router = useRouter();
  const { settings, logoUrl } = useSettings();
  const { user, company, isModuleEnabled, isGym, isTextile, isRestaurant, isRetail, industryCode, clearSession } = useCompany();

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

  const roleUpper = (user?.role || "").toUpperCase();
  const isSuperAdmin = roleUpper.includes("SUPER");

  // Filter master catalog based on enabled modules and industry context
  const visibleNavItems = MASTER_NAVIGATION_CATALOG.filter((item) => {
    if (item.industry) {
      if (item.industry !== industryCode) {
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

      {/* Restaurant Aside Outlet Filter */}
      {restaurants.length > 0 && (
        <div style={{ padding: "0 16px 16px 16px", borderBottom: "1px solid #334155", marginBottom: "16px" }}>
          <label style={{ fontSize: "11px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
            <FiFilter size={12} color="#38bdf8" />
            <span>Filter Restaurant Outlet:</span>
          </label>
          <select
            value={selectedRestaurantId}
            onChange={(e) => handleRestaurantFilterChange(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 10px",
              borderRadius: "6px",
              border: "1px solid #475569",
              backgroundColor: "#0f172a",
              color: "#f8fafc",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            <option value="">All Restaurant Outlets</option>
            {restaurants.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
      )}

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

            <Link
              href="/admin/business-type"
              className={isActivePath("/admin/business-type") ? styles.active : ""}
              onClick={handleLinkClick}
            >
              <FiBriefcase />
              <span>Business Types</span>
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
            : "SUPERMARKET & RESTAURANT ERP"}
        </h4>

        {visibleNavItems.map((item) => {
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
        })}

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
