"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FiUser,
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiPhone,
  FiBriefcase,
} from "react-icons/fi";
import { useSettings } from "@/context/SettingsContext";
import { useAlert } from "@/context/AlertContext";
import styles from "./RegisterForm.module.css";

export default function RegisterForm() {
  const { settings, logoUrl } = useSettings();
  const { showSuccess } = useAlert();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    employeeId: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message || "Failed to send OTP");
      
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // 1. Verify OTP
      const verifyRes = await fetch("http://localhost:5000/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, otp }),
      });
      const verifyData = await verifyRes.json();
      
      if (!verifyRes.ok) throw new Error(verifyData.message || "Invalid OTP");

      // 2. Signup
      const signupPayload = {
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        employeeId: formData.employeeId
      };

      const signupRes = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signupPayload),
      });
      const signupData = await signupRes.json();

      if (!signupRes.ok) throw new Error(signupData.message || "Signup failed");

      showSuccess("Employee added", "Account created successfully! Redirecting to login...");
      window.location.href = "/auth/login";
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1>Create Employee Account</h1>

          <p>
            Fill in the employee details below to create a new Retail ERP
            account.
          </p>
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}

        {step === 1 ? (
          <form className={styles.form} onSubmit={handleSubmit}>

           


            <div className={styles.formGroup}>
              {/* <label className={styles.label}>Employee ID</label> */}

              <div className={styles.inputGroup}>
                <FiBriefcase />

                <input
                  type="text"
                  name="employeeId"
                  placeholder="Employee ID - EMP001"
                  value={formData.employeeId}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>


            <div className={styles.formGroup}>
              {/* <label className={styles.label}>Work Email</label> */}

              <div className={styles.inputGroup}>
                <FiMail />

                <input
                  type="email"
                  name="email"
                  placeholder="Work Email - employee@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>


            <div className={styles.formGroup}>
              {/* <label className={styles.label}>Mobile Number</label> */}

              <div className={styles.inputGroup}>
                <FiPhone />

                <input
                  type="tel"
                  name="phone"
                  placeholder="Mobile Number"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>


            


            <div className={styles.formGroup}>
              {/* <label className={styles.label}>Create Password</label> */}

              <div className={styles.inputGroup}>
                <FiLock />

                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Create a secure password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />

                <button
                  type="button"
                  className={styles.eye}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>


            <div className={styles.formGroup}>
              {/* <label className={styles.label}>Confirm Password</label> */}

              <div className={styles.inputGroup}>
                <FiLock />

                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />

                <button
                  type="button"
                  className={styles.eye}
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                >
                  {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <button className={styles.registerBtn} type="submit" disabled={loading}>
              {loading ? "Sending OTP..." : "Register Employee"}
            </button>
          </form>
        ) : (
          <form className={styles.form} onSubmit={handleVerifyOTP}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Enter OTP</label>
              <div className={styles.inputGroup}>
                <FiLock />
                <input
                  type="text"
                  name="otp"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  required
                />
              </div>
              <p className={styles.otpMessage}>
                OTP sent to {formData.email}
              </p>
            </div>
            
            <button className={styles.registerBtn} type="submit" disabled={loading}>
              {loading ? "Verifying..." : "Verify & Signup"}
            </button>
            <button 
              type="button" 
              className={styles.backBtn} 
              onClick={() => setStep(1)}
              disabled={loading}
            >
              Back
            </button>
          </form>
        )}

        <div className={styles.footer}>
          <p>
            Already have an ERP account?{" "}
            <Link href="/auth/login">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}