"use client";

import { useState } from "react";
import Link from "next/link";
import axios from "axios";
import { FiMail, FiLock, FiEye, FiEyeOff, FiBriefcase } from "react-icons/fi";
import { useSettings } from "@/context/SettingsContext";
import { useAlert } from "@/context/AlertContext";
import styles from "./LoginForm.module.css";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function LoginForm() {
  const { settings, logoUrl } = useSettings();
  const { showSuccess } = useAlert();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    login: "",
    password: "",
    remember: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await axios.post(`${API_BASE}/api/auth/login`, {
        login: formData.login,
        password: formData.password,
      });

      const data = response.data;

      if (!data.success && !data.token) {
        throw new Error(data.message || "Login failed");
      }

      // Clear any previous session overrides
      localStorage.removeItem("industryOverride");
      localStorage.removeItem("companyOverride");
      localStorage.removeItem("branchOverride");

      localStorage.setItem("token", data.token);
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }
      if (data.company) {
        localStorage.setItem("company", JSON.stringify(data.company));
      }
      if (data.modules) {
        localStorage.setItem("modules", JSON.stringify(data.modules));
      }
      if (data.permissions) {
        localStorage.setItem("permissions", JSON.stringify(data.permissions));
      }

      window.dispatchEvent(new Event("user-updated"));

      showSuccess("Login Successful", "User logged in successfully! Redirecting...");

      const userRole = (data.user?.role || "").toUpperCase();
      const userType = (data.user?.type || data.company?.industry?.code || "").toUpperCase();

      if (userRole.includes("SUPER")) {
        window.location.href = "/admin/superadmin-dashboard";
      } else if (userType.includes("RESTAURANT")) {
        if (userRole.includes("WAITER") || userRole.includes("STEWARD") || userRole.includes("SERVER")) {
          window.location.href = "/restaurant/pos";
        } else if (userRole.includes("KITCHEN") || userRole.includes("CHEF") || userRole.includes("COOK")) {
          window.location.href = "/restaurant/kitchen";
        } else if (userRole.includes("CASHIER")) {
          window.location.href = "/restaurant/pos";
        } else {
          window.location.href = "/restaurant/dashboard";
        }
      } else {
        window.location.href = "/dashboard";
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.brandBadge}>CLOUD ERP PLATFORM</div>
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={settings?.companyName || "Company Logo"}
              style={{ maxHeight: "60px", maxWidth: "200px", objectFit: "contain", marginBottom: "12px" }}
            />
          ) : null}
          <h1>Welcome Back</h1>

          <p>Sign in to your {settings?.companyName || "ERP Suite"} account.</p>
        </div>


        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Email / Employee ID / Phone
            </label>

            <div className={styles.inputGroup}>
              {formData.login.includes("@") ? (
                <FiMail />
              ) : (
                <FiBriefcase />
              )}

              <input
                type="text"
                name="login"
                placeholder="admin@company.com, ADM-001, or 9876543210"
                value={formData.login}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              Password
            </label>

            <div className={styles.inputGroup}>
              <FiLock />

              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter Password"
                value={formData.password}
                onChange={handleChange}
                required
              />

              <button
                type="button"
                className={styles.eye}
                onClick={() =>
                  setShowPassword(!showPassword)
                }
              >
                {showPassword ? (
                  <FiEyeOff />
                ) : (
                  <FiEye />
                )}
              </button>
            </div>
          </div>

          <div className={styles.options}>
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                name="remember"
                checked={formData.remember}
                onChange={handleChange}
              />
              Remember Me
            </label>

            <Link href="/auth/forgot-password">
              Forgot Password?
            </Link>
          </div>

          <button
            className={styles.loginBtn}
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        {/* <div className={styles.footer}>
          <p>
            Don't have an account?{" "}
            <Link href="/auth/register">
              Register
            </Link>
          </p>
        </div> */}
      </div>
    </div>
  );
}