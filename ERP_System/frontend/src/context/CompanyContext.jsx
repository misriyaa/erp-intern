"use client";

import { createContext, useContext, useState, useEffect } from "react";

const CompanyContext = createContext(null);

export function CompanyProvider({ children }) {
  const [user, setUser] = useState(null);
  const [company, setCompany] = useState(null);
  const [modules, setModules] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

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
  };

  const industryCode =
    company?.industry?.code || (user?.type || "RETAIL").toUpperCase();

  const isGym = industryCode.includes("GYM");
  const isTextile = industryCode.includes("TEXTILE");
  const isRetail = !isGym && !isTextile;

  const isModuleEnabled = (moduleCode) => {
    const roleUpper = (user?.role || "").toUpperCase();
    if (roleUpper.includes("SUPER")) return true;

    if (!moduleCode) return true;
    const codeUpper = moduleCode.toUpperCase();

    if (isRetail && ["DASHBOARD", "PRODUCTS", "CATEGORIES", "BRANDS", "UNITS", "INVENTORY", "WAREHOUSE", "CUSTOMERS", "SUPPLIERS", "PURCHASES", "SALES", "PAYMENTS", "EXPENSES", "BRANCHES", "EMPLOYEES", "REPORTS", "SETTINGS"].includes(codeUpper)) {
      return true;
    }
    if (isGym && ["DASHBOARD", "MEMBERS", "MEMBERSHIP_PLANS", "TRAINERS", "ATTENDANCE", "PAYMENTS", "EXPENSES", "BRANCHES", "EMPLOYEES", "SUPPLIERS", "REPORTS", "SETTINGS"].includes(codeUpper)) {
      return true;
    }
    if (isTextile && ["DASHBOARD", "PRODUCTS", "RAW_MATERIALS", "PRODUCTION", "INVENTORY", "QUALITY_CONTROL", "SUPPLIERS", "SALES", "PAYMENTS", "EXPENSES", "BRANCHES", "EMPLOYEES", "REPORTS", "SETTINGS"].includes(codeUpper)) {
      return true;
    }

    return modules.length === 0 || modules.includes(codeUpper);
  };

  return (
    <CompanyContext.Provider
      value={{
        user,
        company,
        modules,
        permissions,
        industryCode,
        isGym,
        isTextile,
        isRetail,
        loading,
        isModuleEnabled,
        saveSession,
        clearSession,
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
