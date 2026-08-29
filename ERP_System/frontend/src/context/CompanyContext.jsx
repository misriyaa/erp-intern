"use client";

import { createContext, useContext, useState, useEffect } from "react";

const CompanyContext = createContext(null);

export function CompanyProvider({ children }) {
  const [user, setUser] = useState(null);
  const [company, setCompany] = useState(null);
  const [modules, setModules] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [industryOverride, setIndustryOverride] = useState(null);
  const [companyOverride, setCompanyOverride] = useState(null);
  const [branchOverride, setBranchOverride] = useState(null);

  const loadSession = () => {
    try {
      if (typeof window !== "undefined") {
        const storedUser = localStorage.getItem("user");
        const storedCompany = localStorage.getItem("company");
        const storedModules = localStorage.getItem("modules");
        const storedPermissions = localStorage.getItem("permissions");

        if (storedUser) setUser(JSON.parse(storedUser));
        if (storedCompany) setCompany(JSON.parse(storedCompany));
        if (storedModules) setModules(JSON.parse(storedModules));
        if (storedPermissions) setPermissions(JSON.parse(storedPermissions));

        const storedOverride = localStorage.getItem("industryOverride");
        setIndustryOverride(storedOverride || null);

        const storedCompanyOverride = localStorage.getItem("companyOverride");
        const storedBranchOverride = localStorage.getItem("branchOverride");

        if (storedCompanyOverride) setCompanyOverride(JSON.parse(storedCompanyOverride));
        if (storedBranchOverride) setBranchOverride(JSON.parse(storedBranchOverride));
      }
    } catch (err) {
      console.error("Failed to load company session:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSession();

    const handleStorageChange = () => loadSession();
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("user-updated", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("user-updated", handleStorageChange);
    };
  }, []);

  const saveSession = ({ user: u, company: c, modules: m, permissions: p }) => {
    if (u) {
      setUser(u);
      localStorage.setItem("user", JSON.stringify(u));
    }
    if (c) {
      setCompany(c);
      localStorage.setItem("company", JSON.stringify(c));
    }
    if (m) {
      setModules(m);
      localStorage.setItem("modules", JSON.stringify(m));
    }
    if (p) {
      setPermissions(p);
      localStorage.setItem("permissions", JSON.stringify(p));
    }
  };

  const clearSession = () => {
    setUser(null);
    setCompany(null);
    setModules([]);
    setPermissions([]);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("company");
    localStorage.removeItem("modules");
    localStorage.removeItem("permissions");
    localStorage.removeItem("industryOverride");
    localStorage.removeItem("companyOverride");
    localStorage.removeItem("branchOverride");
    setCompanyOverride(null);
    setBranchOverride(null);
  };

  const changeIndustryOverride = (code) => {
    setIndustryOverride(code);
    if (code) {
      localStorage.setItem("industryOverride", code);
    } else {
      localStorage.removeItem("industryOverride");
    }
    window.dispatchEvent(new Event("user-updated"));
  };

  const changeCompanyOverride = (compObj) => {
    setCompanyOverride(compObj);
    if (compObj) {
      localStorage.setItem("companyOverride", JSON.stringify(compObj));
    } else {
      localStorage.removeItem("companyOverride");
    }
    setBranchOverride(null);
    localStorage.removeItem("branchOverride");
    window.dispatchEvent(new Event("user-updated"));
  };

  const changeBranchOverride = (branchObj) => {
    setBranchOverride(branchObj);
    if (branchObj) {
      localStorage.setItem("branchOverride", JSON.stringify(branchObj));
    } else {
      localStorage.removeItem("branchOverride");
    }
    window.dispatchEvent(new Event("user-updated"));
  };

  const activeCompany = companyOverride || company;

  const industryCode =
    industryOverride || activeCompany?.industry?.code || (user?.type || "RETAIL").toUpperCase();

  const isGym = industryCode.includes("GYM");
  const isTextile = industryCode.includes("TEXTILE");
  const isRestaurant = industryCode.includes("RESTAURANT");
  const isLaundry = industryCode.includes("LAUNDRY");
  const isMedical = industryCode.includes("MEDICAL");
  const isRetail = !isGym && !isTextile && !isRestaurant && !isLaundry && !isMedical;

  const isModuleEnabled = (moduleCode) => {
    if (!moduleCode) return true;
    const codeUpper = moduleCode.toUpperCase();
    const roleUpper = (user?.role || "").toUpperCase().replace(/\s+/g, "_");

    // Super Admin always gets full access
    if (roleUpper.includes("SUPER")) return true;

    // 1. If explicit module permissions are set for this employee/user
    if (Array.isArray(modules) && modules.length > 0 && !roleUpper.includes("ADMIN")) {
      const formattedModules = modules.map((m) => (m || "").toUpperCase());
      const hasDirectAccess = formattedModules.some((mUpper) => {
        if (mUpper === codeUpper) return true;
        if (mUpper === "WAREHOUSE" && (codeUpper === "WAREHOUSES" || codeUpper === "INVENTORY" || codeUpper === "STOCK_TRANSFER" || codeUpper === "STOCK-TRANSFER")) return true;
        if (mUpper === "WAREHOUSES" && (codeUpper === "WAREHOUSE" || codeUpper === "INVENTORY")) return true;
        if (mUpper === "STOCK_TRANSFER" && codeUpper === "STOCK-TRANSFER") return true;
        if (mUpper === "STOCK-TRANSFER" && codeUpper === "STOCK_TRANSFER") return true;
        if (mUpper === "MEDICAL" && codeUpper === "MEDICAL_SHOP") return true;
        if (mUpper === "MEDICAL_SHOP" && codeUpper === "MEDICAL") return true;
        if (mUpper === "RESTAURANT" && codeUpper.startsWith("RESTAURANT")) return true;
        if (mUpper === "LAUNDRY" && codeUpper.startsWith("LAUNDRY")) return true;
        return false;
      });
      return hasDirectAccess;
    }

    if (roleUpper.includes("ADMIN")) return true;

    // 2. Role-based overrides/filters
    if (roleUpper.includes("CASHIER")) {
      const allowed = ["SALES", "POS", "DASHBOARD", "RESTAURANT", "LAUNDRY", "MEDICAL_SHOP", "MEDICAL", "CUSTOMERS", "INVOICES"];
      if (!allowed.includes(codeUpper)) {
        return false;
      }
    } else if (roleUpper === "BRAND_MANAGER") {
      const allowed = ["PRODUCTS", "CATEGORIES", "BRANDS", "PURCHASES", "DASHBOARD"];
      if (!allowed.includes(codeUpper)) {
        return false;
      }
    } else if (roleUpper === "WAREHOUSE_MANAGER" || roleUpper === "INVENTORY_MANAGER") {
      const allowed = ["INVENTORY", "WAREHOUSE", "STOCK_TRANSFER", "DASHBOARD", "STOCK-TRANSFER"];
      if (!allowed.includes(codeUpper)) {
        return false;
      }
    } else if (roleUpper === "MANAGER") {
      const allowed = [
        "DASHBOARD",
        "INVENTORY",
        "WAREHOUSE",
        "STOCK_TRANSFER",
        "STOCK-TRANSFER",
        "CUSTOMERS",
        "SUPPLIERS",
        "PURCHASES",
        "SALES",
        "REPORTS",
        "INVOICES",
        "EMPLOYEES",
        "BRANCHES",
        "MEMBERS",
        "MEMBERSHIP_PLANS",
        "TRAINERS",
        "ATTENDANCE",
        "PAYMENTS",
        "RESTAURANT",
        "LAUNDRY",
        "PRODUCTION",
        "RAW_MATERIALS",
      ];
      if (!allowed.includes(codeUpper)) {
        return false;
      }
    } else if (roleUpper === "DATA_ENTRY") {
      const allowed = ["PRODUCTS", "CATEGORIES", "BRANDS", "UNITS", "RAW_MATERIALS", "DASHBOARD"];
      if (!allowed.includes(codeUpper)) {
        return false;
      }
    }

    // 3. Industry checks
    if (isRetail && ["DASHBOARD", "PRODUCTS", "CATEGORIES", "BRANDS", "UNITS", "INVENTORY", "WAREHOUSE", "STOCK_TRANSFER", "CUSTOMERS", "SUPPLIERS", "PURCHASES", "SALES", "PAYMENTS", "EXPENSES", "BRANCHES", "EMPLOYEES", "REPORTS", "SETTINGS", "RESTAURANT"].includes(codeUpper)) {
      return true;
    }
    if (isRestaurant && ["DASHBOARD", "RESTAURANT", "PRODUCTS", "INVENTORY", "WAREHOUSE", "SUPPLIERS", "PURCHASES", "PAYMENTS", "EXPENSES", "BRANCHES", "EMPLOYEES", "REPORTS", "SETTINGS"].includes(codeUpper)) {
      return true;
    }
    if (isGym && ["DASHBOARD", "MEMBERS", "MEMBERSHIP_PLANS", "TRAINERS", "ATTENDANCE", "PAYMENTS", "EXPENSES", "BRANCHES", "EMPLOYEES", "SUPPLIERS", "REPORTS", "SETTINGS", "INVENTORY"].includes(codeUpper)) {
      return true;
    }
    if (isTextile && ["DASHBOARD", "PRODUCTS", "RAW_MATERIALS", "PRODUCTION", "INVENTORY", "WAREHOUSES", "WAREHOUSE", "QUALITY_CONTROL", "SUPPLIERS", "SALES", "PAYMENTS", "EXPENSES", "BRANCHES", "EMPLOYEES", "REPORTS", "SETTINGS"].includes(codeUpper)) {
      return true;
    }
    if (isLaundry && ["DASHBOARD", "LAUNDRY", "INVENTORY", "WAREHOUSE", "CUSTOMERS", "SUPPLIERS", "PAYMENTS", "EXPENSES", "BRANCHES", "EMPLOYEES", "REPORTS", "SETTINGS"].includes(codeUpper)) {
      return true;
    }
    if (isMedical && ["DASHBOARD", "MEDICAL", "MEDICAL_SHOP", "PRODUCTS", "CATEGORIES", "BRANDS", "INVENTORY", "WAREHOUSE", "CUSTOMERS", "SUPPLIERS", "PURCHASES", "PAYMENTS", "EXPENSES", "BRANCHES", "EMPLOYEES", "REPORTS", "SETTINGS"].includes(codeUpper)) {
      return true;
    }

    return true;
  };

  return (
    <CompanyContext.Provider
      value={{
        user,
        company: activeCompany,
        modules,
        permissions,
        industryCode,
        isGym,
        isTextile,
        isRestaurant,
        isLaundry,
        isMedical,
        isRetail,
        loading,
        isModuleEnabled,
        saveSession,
        clearSession,
        industryOverride,
        changeIndustryOverride,
        companyOverride,
        branchOverride,
        changeCompanyOverride,
        changeBranchOverride,
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error("useCompany must be used within a CompanyProvider");
  }
  return context;
}
