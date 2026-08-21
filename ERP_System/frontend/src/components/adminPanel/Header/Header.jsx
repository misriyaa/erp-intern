"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FiMenu,
  FiSearch,
  FiSettings,
  FiChevronDown,
  FiUser,
  FiClock,
  FiLogOut,
  FiX,
  FiBox,
  FiShoppingCart,
  FiUsers,
  FiBarChart2,
  FiGrid,
  FiMapPin,
  FiTag,
  FiUserCheck,
  FiBriefcase,
} from "react-icons/fi";
import { useSettings } from "@/context/SettingsContext";
import { useCompany } from "@/context/CompanyContext";

import styles from "./Header.module.css";

// Quick search searchable routes catalog
const QUICK_SEARCH_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: FiGrid, category: "Core" },
  { label: "Add Admin / Manage Admins", href: "/admin/add-admin", icon: FiUserCheck, category: "Super Admin" },
  { label: "Business Type Management", href: "/admin/business-type", icon: FiBriefcase, category: "Super Admin" },
  { label: "Gym Members", href: "/gym/members", icon: FiUsers, category: "Gym" },
  { label: "Membership Plans", href: "/gym/plans", icon: FiBox, category: "Gym" },
  { label: "Gym Trainers", href: "/gym/trainers", icon: FiUserCheck, category: "Gym" },
  { label: "Attendance Log", href: "/gym/attendance", icon: FiClock, category: "Gym" },
  { label: "Gym Payments", href: "/gym/payments", icon: FiShoppingCart, category: "Gym" },
  { label: "Customers", href: "/customers", icon: FiUsers, category: "Sales" },
  { label: "Inventory / Stock", href: "/warehouse/stock", icon: FiBox, category: "Inventory" },
  { label: "Sales Orders", href: "/sales", icon: FiShoppingCart, category: "Sales" },
  { label: "Purchases", href: "/purchases", icon: FiShoppingCart, category: "Purchases" },
  { label: "Reports & Analytics", href: "/reports", icon: FiBarChart2, category: "Analytics" },
  { label: "Audit Logs", href: "/admin/audit-logs", icon: FiClock, category: "System" },
  { label: "Branch Management", href: "/admin/branches", icon: FiMapPin, category: "Admin" },
  { label: "Suppliers", href: "/admin/suppliers", icon: FiUsers, category: "Purchases" },
  { label: "Categories", href: "/admin/categories", icon: FiTag, category: "Inventory" },
  { label: "System Settings", href: "/admin/settings", icon: FiSettings, category: "Settings" },
  { label: "My Profile", href: "/settings/profile", icon: FiUser, category: "Account" },
  { label: "Textile Products", href: "/textile/products", icon: FiBox, category: "Textile" },
  { label: "Raw Materials", href: "/textile/raw-materials", icon: FiBox, category: "Textile" },
  { label: "Production Tracking", href: "/textile/production", icon: FiClock, category: "Textile" },
  { label: "Quality Control", href: "/textile/quality-control", icon: FiBox, category: "Textile" },
];

export default function Header({ toggleSidebar }) {
  const router = useRouter();
  const { settings } = useSettings();
  const { company, isGym, isTextile, isRestaurant, isRetail, industryCode } = useCompany();

  // User state
  const [user, setUser] = useState(null);

  // Profile dropdown state
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Ref for click outside detection
  const headerRef = useRef(null);

  // Load user data dynamically
  const loadUser = () => {
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (err) {
      console.error("Failed to parse user in Header", err);
    }
  };

  useEffect(() => {
    loadUser();

    // Listen to storage events and custom user-updated events
    const handleStorageChange = () => loadUser();
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("user-updated", handleStorageChange);

    // Click outside listener
    const handleClickOutside = (e) => {
      if (headerRef.current && !headerRef.current.contains(e.target)) {
        setIsProfileOpen(false);
        setIsSearchFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("user-updated", handleStorageChange);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Logout handler
  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.push("/auth/login");
    }
  };

  // Filtered search results
  const filteredSearch = searchQuery.trim()
    ? QUICK_SEARCH_ITEMS.filter(
        (item) =>
          item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const getDisplayRole = (roleStr) => {
    if (!roleStr) return "Administrator";
    const r = roleStr.trim();
    if (r.toLowerCase() === "super_admin" || r.toLowerCase() === "super admin") return "Super Admin";
    if (r.toLowerCase() === "branch_manager" || r.toLowerCase() === "branch manager") return "Branch Manager";
    if (r.toLowerCase() === "inventory_manager" || r.toLowerCase() === "inventory manager") return "Inventory Manager";
    if (r.toLowerCase() === "cashier") return "Cashier";
    if (r.toLowerCase() === "admin") return "Admin";
    return r.charAt(0).toUpperCase() + r.slice(1);
  };

  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  };

  return (
    <header className={styles.header} ref={headerRef}>
      {/* Left Section */}
      <div className={styles.left}>
        {/* Hamburger Menu - HIDDEN ON DESKTOP, ONLY VISIBLE ON MOBILE SCREEN */}
        <button
          className={styles.menuBtn}
          onClick={toggleSidebar}
          aria-label="Toggle Navigation Menu"
          title="Toggle Menu"
        >
          <FiMenu />
        </button>

        {/* Industry Mode Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 14px",
            background: isGym
              ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
              : isTextile
              ? "linear-gradient(135deg, #0d9488 0%, #0f766e 100%)"
              : isRestaurant
              ? "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
              : "linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)",
            color: "#ffffff",
            borderRadius: "20px",
            fontSize: "12px",
            fontWeight: "700",
            letterSpacing: "0.5px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            whiteSpace: "nowrap",
          }}
        >
          <span>
            {isGym
              ? "🏋️ GYM ERP MODE"
              : isTextile
              ? "🧵 TEXTILE ERP MODE"
              : isRestaurant
              ? "🍽️ RESTAURANT ERP MODE"
              : "🛒 RETAIL ERP MODE"}
          </span>
        </div>

        {/* Dynamic Search Container */}
        <div className={styles.searchContainer}>
          <div className={styles.searchBox}>
            <FiSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder={`Search ${settings?.companyName ? settings.companyName + "..." : "ERP..."}`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
            />
            {searchQuery && (
              <button
                className={styles.clearSearchBtn}
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
              >
                <FiX />
              </button>
            )}
          </div>

          {/* Dynamic Search Results Dropdown */}
          {isSearchFocused && searchQuery.trim().length > 0 && (
            <div className={styles.searchResultsDropdown}>
              <div className={styles.dropdownHeader}>
                <span>Search Results</span>
                <span className={styles.resultCount}>{filteredSearch.length} found</span>
              </div>
              {filteredSearch.length > 0 ? (
                <div className={styles.searchResultsList}>
                  {filteredSearch.map((item) => {
                    const IconComp = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={styles.searchResultItem}
                        onClick={() => {
                          setIsSearchFocused(false);
                          setSearchQuery("");
                        }}
                      >
                        <div className={styles.resultIconWrapper}>
                          <IconComp />
                        </div>
                        <div className={styles.resultDetails}>
                          <span className={styles.resultTitle}>{item.label}</span>
                          <span className={styles.resultCategory}>{item.category}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className={styles.noResults}>
                  <p>No matches found for "{searchQuery}"</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Section */}
      <div className={styles.right}>
        {/* Settings Quick Link */}
        <Link href="/admin/settings" className={styles.iconBtn} title="Settings">
          <FiSettings />
        </Link>

        {/* Dynamic Profile & User Dropdown */}
        <div className={styles.dropdownWrapper}>
          <div
            className={`${styles.profile} ${isProfileOpen ? styles.profileActive : ""}`}
            onClick={() => setIsProfileOpen((prev) => !prev)}
          >
            {user?.avatar ? (
              <img src={user.avatar} alt={user?.fullName || "User Avatar"} className={styles.avatarImg} />
            ) : (
              <div className={styles.avatarBadge}>
                {getInitials(user?.fullName || "Admin User")}
              </div>
            )}

            <div className={styles.profileDetails}>
              <h4>{user?.fullName || "Admin User"}</h4>
              <span>{getDisplayRole(user?.role)}</span>
            </div>

            <FiChevronDown className={`${styles.chevron} ${isProfileOpen ? styles.chevronRotated : ""}`} />
          </div>

          {isProfileOpen && (
            <div className={`${styles.dropdownMenu} ${styles.profileDropdown}`}>
              <div className={styles.profileCardHeader}>
                <div className={styles.largeAvatar}>
                  {user?.avatar ? (
                    <img src={user.avatar} alt="User Avatar" />
                  ) : (
                    <span>{getInitials(user?.fullName || "Admin User")}</span>
                  )}
                </div>
                <div className={styles.cardUserInfo}>
                  <h4>{user?.fullName || "Admin User"}</h4>
                  <span className={styles.roleTag}>{getDisplayRole(user?.role)}</span>
                  <span className={styles.userEmail}>{user?.email || "admin@erp.com"}</span>
                </div>
              </div>

              <div className={styles.dropdownDivider} />

              <div className={styles.profileMenuItems}>
                <Link
                  href="/settings/profile"
                  className={styles.menuItem}
                  onClick={() => setIsProfileOpen(false)}
                >
                  <FiUser />
                  <span>My Profile & Security</span>
                </Link>

                <Link
                  href="/admin/settings"
                  className={styles.menuItem}
                  onClick={() => setIsProfileOpen(false)}
                >
                  <FiSettings />
                  <span>System Settings</span>
                </Link>

                <Link
                  href="/admin/audit-logs"
                  className={styles.menuItem}
                  onClick={() => setIsProfileOpen(false)}
                >
                  <FiClock />
                  <span>Audit Activity Logs</span>
                </Link>
              </div>

              <div className={styles.dropdownDivider} />

              <button className={styles.logoutBtn} onClick={handleLogout}>
                <FiLogOut />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}


