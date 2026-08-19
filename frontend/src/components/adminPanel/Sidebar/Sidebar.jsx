"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSettings } from "@/context/SettingsContext";
import { useCompany } from "@/context/CompanyContext";
import { MASTER_NAVIGATION_CATALOG } from "@/config/industries";

import {
  FiGrid,
  FiUserCheck,
  FiBriefcase,
  FiX,
  FiLogOut,
  FiShield,
} from "react-icons/fi";

import styles from "./Sidebar.module.css";

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const { settings, logoUrl } = useSettings();
  const { user, company, isModuleEnabled, isGym, clearSession } = useCompany();

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
    if (isGym && item.industry === "RETAIL") return false;
    if (!isGym && item.industry === "GYM") return false;
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
          {isGym ? "GYM MANAGEMENT MODULES" : "RETAIL MANAGEMENT"}
        </h4>

        {visibleNavItems.map((item) => {
          const IconComp = item.icon;
          const active = isActivePath(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
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
