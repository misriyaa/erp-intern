import bcrypt from "bcrypt";
import crypto from "crypto";

import { sendOTPEmail } from "../../config/mail.js";
import { generateToken } from "../../config/jwt.js";
import { DEFAULT_INDUSTRY_MODULES } from "../../config/industries.js";

import {
  findUserByLogin,
  findUserByEmail,
  saveOTP,
  findOTPByEmail,
  markOTPAsUsed,
  updatePassword,
  updateEmail,
} from "./auth.repository.js";

// Login
const loginService = async (login, password) => {
  const employee = await findUserByLogin(login);

  if (!employee) {
    throw new Error("Employee not found");
  }

  const passwordMatched = await bcrypt.compare(
    password,
    employee.passwordHash
  );

  if (!passwordMatched) {
    throw new Error("Invalid password");
  }

  if (!employee.isVerified) {
    throw new Error("Please verify your email first");
  }

  const token = generateToken(employee.id);

  const rawCodeUpper = (
    employee.company?.industry?.code || employee.type || "RETAIL"
  ).toUpperCase();
  const industryCodeUpper = rawCodeUpper.includes("GYM")
    ? "GYM"
    : rawCodeUpper.includes("TEXTILE")
    ? "TEXTILE"
    : rawCodeUpper.includes("RESTAURANT")
    ? "RESTAURANT"
    : "RETAIL";

  const companyModules =
    employee.company?.modules
      ?.filter((cm) => cm.enabled)
      .map((cm) => cm.module.code) || [];

  const defaultCodes =
    DEFAULT_INDUSTRY_MODULES[industryCodeUpper] ||
    DEFAULT_INDUSTRY_MODULES.RETAIL;

  let enabledModuleCodes = companyModules.length > 0 ? companyModules : defaultCodes;
  if (employee.permissions) {
    try {
      const parsed = JSON.parse(employee.permissions);
      if (Array.isArray(parsed)) {
        enabledModuleCodes = parsed;
      }
    } catch (e) {
      if (typeof employee.permissions === "string") {
        enabledModuleCodes = employee.permissions.split(",").map((s) => s.trim().toUpperCase());
      }
    }
  }

  const rawRole = (employee.roleRef?.name || employee.role || "Employee").trim();
  const normalizedRole = rawRole.toUpperCase().replace(/\s+/g, "_");

  return {
    success: true,
    message: "Login successful",
    token,
    user: {
      id: employee.id,
      fullName: employee.fullName,
      email: employee.email,
      employeeId: employee.employeeId,
      phone: employee.phone,
      role: normalizedRole,
      type: industryCodeUpper,
      companyId: employee.companyId || employee.company?.id || null,
    },
    company: {
      id: employee.company?.id || null,
      name: employee.company?.name || "ERP Enterprise",
      industry: {
        code: industryCodeUpper,
        name:
          industryCodeUpper === "GYM"
            ? "Gym"
            : industryCodeUpper === "TEXTILE"
            ? "Textile"
            : industryCodeUpper === "RESTAURANT"
            ? "Restaurant"
            : "Retail",
      },
    },
    modules: enabledModuleCodes,
    permissions: [
      "DASHBOARD_VIEW",
      "PRODUCTS_VIEW",
      "MEMBERS_VIEW",
      "MEMBERS_CREATE",
      "MEMBERS_EDIT",
      "PAYMENTS_VIEW",
      "PAYMENTS_COLLECT",
      "ATTENDANCE_VIEW",
      "ATTENDANCE_CHECKIN",
    ],
  };
};

// Change Password
const changePasswordService = async (
  email,
  currentPassword,
  newPassword
) => {
  const employee = await findUserByEmail(email);

  if (!employee) {
    throw new Error("Employee not found");
  }

  const passwordMatched = await bcrypt.compare(
    currentPassword,
    employee.passwordHash
  );

  if (!passwordMatched) {
    throw new Error("Current password is incorrect");
  }

  const passwordHash = await bcrypt.hash(
    newPassword,
    10
  );

  await updatePassword(email, passwordHash);

  return {
    success: true,
    message: "Password changed successfully",
  };
};

// Forgot Password
const forgotPasswordService = async (email) => {
  const employee = await findUserByEmail(email);

  if (!employee) {
    throw new Error("Employee not found");
  }

  const otp = crypto.randomInt(100000, 999999).toString();

  const expiresAt = new Date(
    Date.now() + 5 * 60 * 1000
  );

  await saveOTP({
    email,
    otp,
    expiresAt,
  });

  await sendOTPEmail(email, otp);

  return {
    success: true,
    message: "OTP sent successfully",
  };
};

// Verify Reset OTP
const verifyResetOTPService = async (email, otp) => {
  const savedOTP = await findOTPByEmail(email);

  if (!savedOTP) {
    throw new Error("OTP not found");
  }

  if (savedOTP.isUsed) {
    throw new Error("OTP already used");
  }

  if (savedOTP.expiresAt < new Date()) {
    throw new Error("OTP expired");
  }

  if (savedOTP.otp !== otp) {
    throw new Error("Invalid OTP");
  }

  await markOTPAsUsed(savedOTP.id);

  return {
    success: true,
    message: "OTP verified successfully",
  };
};

// Reset Password
const resetPasswordService = async (
  email,
  password
) => {
  const employee = await findUserByEmail(email);

  if (!employee) {
    throw new Error("Employee not found");
  }

  const passwordHash = await bcrypt.hash(
    password,
    10
  );

  await updatePassword(email, passwordHash);

  return {
    success: true,
    message: "Password reset successfully",
  };
};

// Change Email
const changeEmailService = async (currentEmail, password, newEmail) => {
  const employee = await findUserByEmail(currentEmail);

  if (!employee) {
    throw new Error("Employee not found");
  }

  const passwordMatched = await bcrypt.compare(
    password,
    employee.passwordHash
  );

  if (!passwordMatched) {
    throw new Error("Password is incorrect");
  }

  const cleanNewEmail = newEmail.trim().toLowerCase();

  // Check new email not already taken
  const emailTaken = await findUserByEmail(cleanNewEmail);
  if (emailTaken) {
    throw new Error("This email is already in use");
  }

  await updateEmail(currentEmail, cleanNewEmail);

  return {
    success: true,
    message: "Email updated successfully",
    newEmail: cleanNewEmail,
  };
};

export {
  loginService,
  changePasswordService,
  changeEmailService,
  forgotPasswordService,
  verifyResetOTPService,
  resetPasswordService,
};