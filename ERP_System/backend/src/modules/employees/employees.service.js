import bcrypt from "bcrypt";
import prisma from "../../config/prisma.js";

import {
  sendEmployeeCredentialsEmail,
  sendEmployeeUpdatedEmail,
} from "../../config/mail.js";

import { recordAuditLog } from "../audit/audit.service.js";

const isUuid = (str) => {
  if (typeof str !== "string") return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
};

import {
  getAllEmployees,
  getEmployeeById,
  findEmployeeByEmail,
  findEmployeeByEmployeeId,
  findEmployeeByPhone,
  findRoleById,
  findRoleByName,
  createRoleInRepo,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "./employees.repository.js";


// Remove sensitive fields before sending employee data to frontend
const removeSensitiveFields = (employee) => {
  if (!employee) {
    return employee;
  }

  const {
    passwordHash,
    plainPassword,
    verificationToken,
    verificationExpires,
    ...safeEmployee
  } = employee;

  return safeEmployee;
};


// Get all employees
const fetchAllEmployees = async (companyId, type) => {
  const employees = await getAllEmployees(companyId, type);

  return {
    success: true,
    data: employees.map(removeSensitiveFields),
  };
};


// Get employee by ID
const fetchEmployeeById = async (id) => {
  const employee = await getEmployeeById(id);

  if (!employee) {
    throw new Error("Employee not found");
  }

  return {
    success: true,
    data: removeSensitiveFields(employee),
  };
};


// Add employee
const addEmployee = async (
  {
    fullName,
    employeeId,
    email,
    phone,
    role,
    password,
    branchId,
  },
  req
) => {

  // Basic validation
  if (
    !fullName ||
    !employeeId ||
    !email ||
    !phone ||
    !role ||
    !password ||
    !branchId
  ) {
    throw new Error("All employee fields are required");
  }


  // Clean input
  const cleanFullName = fullName.trim();
  const cleanEmployeeId = employeeId.trim();
  const cleanEmail = email.trim().toLowerCase();
  const cleanPhone = phone.trim();
  const cleanRole = role.trim();

  // If creating user is a business-type admin, block assigning Admin/Super Admin roles
  if (req.user?.role?.toUpperCase() === "ADMIN") {
    let requestedRoleName = "";
    let roleById = null;
    if (isUuid(cleanRole)) {
      roleById = await findRoleById(cleanRole);
    }
    if (roleById) {
      requestedRoleName = roleById.name;
    } else {
      const roleByName = await findRoleByName(cleanRole);
      if (roleByName) {
        requestedRoleName = roleByName.name;
      } else {
        requestedRoleName = cleanRole;
      }
    }

    const reqRoleUpper = requestedRoleName.toUpperCase();
    if (reqRoleUpper === "ADMIN" || reqRoleUpper === "SUPER_ADMIN" || reqRoleUpper === "SUPERADMIN") {
      throw new Error("Admins are not permitted to register or assign Admin/Super Admin roles");
    }
  }


  // Check email
  const existingEmail = await findEmployeeByEmail(cleanEmail);

  if (existingEmail) {
    throw new Error("Email already exists");
  }


  // Check employee ID
  const existingEmployeeId =
    await findEmployeeByEmployeeId(cleanEmployeeId);

  if (existingEmployeeId) {
    throw new Error("Employee ID already exists");
  }


  // Check phone
  const existingPhone =
    await findEmployeeByPhone(cleanPhone);

  if (existingPhone) {
    throw new Error("Phone number already exists");
  }


  // Check role: lookup by ID, then by Name. If missing, create role in DB!
  let employeeRole = null;
  if (isUuid(cleanRole)) {
    employeeRole = await findRoleById(cleanRole);
  }

  if (!employeeRole) {
    employeeRole = await findRoleByName(cleanRole);
  }

  if (!employeeRole) {
    employeeRole = await createRoleInRepo(cleanRole);
  }


  // Hash password and store the plain text for future reference
  const passwordHash = await bcrypt.hash(password, 12);


  let assignedBranchId = null;
  if (branchId) {
    const OR = [];
    if (isUuid(branchId)) {
      OR.push({ id: branchId });
    }
    OR.push({ code: branchId });
    OR.push({ name: { equals: branchId, mode: "insensitive" } });

    const dbBranch = await prisma.branch.findFirst({
      where: { OR }
    });

    if (dbBranch) {
      assignedBranchId = dbBranch.id;
    } else {
      const newBranch = await prisma.branch.create({
        data: {
          name: branchId.startsWith("b-") ? "Main Store Branch" : branchId,
          code: `BR-${Date.now().toString().slice(-4)}`,
          isActive: true,
        }
      });
      assignedBranchId = newBranch.id;
    }
  }

  // Create employee
  const employee = await createEmployee({
    fullName: cleanFullName,
    employeeId: cleanEmployeeId,
    email: cleanEmail,
    phone: cleanPhone,
    passwordHash,
    plainPassword: password,

    // Admin created the account
    isVerified: true,

    // Employee must change password on first login
    firstLogin: true,

    role: employeeRole.name,
    roleId: employeeRole.id,

    // Required branch assignment
    branchId: assignedBranchId,

    companyId: req?.body?.companyId || req?.user?.companyId || null,
    type: req?.body?.type || req?.user?.type || "RETAIL",
  });


  // Send credentials email
  let emailSent = false;

  try {
    await sendEmployeeCredentialsEmail(
      cleanEmail,
      cleanEmployeeId,
      password,
      employee.branch?.name
    );

    emailSent = true;

  } catch (emailError) {

    console.error(
      "Failed to send employee credentials email:",
      emailError.message
    );
  }


  // Audit log
  await recordAuditLog(req, {
    action: "CREATE",
    entity: "Employee",
    entityId: employee.id,

    // Never store the password here
    details: {
      fullName: cleanFullName,
      employeeId: cleanEmployeeId,
      email: cleanEmail,
      phone: cleanPhone,
      role: cleanRole,
      branch: employee.branch?.name || null,
      description: `Employee registered`,
    },
  });


  // Remove sensitive information
  const safeEmployee =
    removeSensitiveFields(employee);


  return {
    success: true,

    message: emailSent
      ? "Employee created successfully and credentials email sent"
      : "Employee created successfully, but email delivery failed",

    data: safeEmployee,

    // IMPORTANT:
    // Do NOT return the password here.
    emailSent,
  };
};


// Update employee
const modifyEmployee = async (
  id,
  updateData,
  req
) => {

  const existingEmployee =
    await getEmployeeById(id);

  if (!existingEmployee) {
    throw new Error("Employee not found");
  }


  const safeUpdateData = {};


  // Full Name
  if (updateData.fullName) {
    safeUpdateData.fullName = updateData.fullName.trim();
  }


  // Email normalization & check
  if (updateData.email) {
    const cleanEmail = updateData.email.trim().toLowerCase();

    if (cleanEmail !== existingEmployee.email) {
      const emailExists = await findEmployeeByEmail(cleanEmail);

      if (emailExists && emailExists.id !== id) {
        throw new Error("Email already exists");
      }
    }

    safeUpdateData.email = cleanEmail;
  }


  // Employee ID check
  if (updateData.employeeId) {
    const cleanEmployeeId = updateData.employeeId.trim();

    if (cleanEmployeeId !== existingEmployee.employeeId) {
      const employeeIdExists = await findEmployeeByEmployeeId(cleanEmployeeId);

      if (employeeIdExists && employeeIdExists.id !== id) {
        throw new Error("Employee ID already exists");
      }
    }

    safeUpdateData.employeeId = cleanEmployeeId;
  }


  // Phone check
  if (updateData.phone) {
    const cleanPhone = updateData.phone.trim();

    if (cleanPhone !== existingEmployee.phone) {
      const phoneExists = await findEmployeeByPhone(cleanPhone);

      if (phoneExists && phoneExists.id !== id) {
        throw new Error("Phone number already exists");
      }
    }

    safeUpdateData.phone = cleanPhone;
  }


  // Role handling (by roleId or role name string)
  if (updateData.roleId) {
    let roleObj = null;
    if (isUuid(updateData.roleId)) {
      roleObj = await findRoleById(updateData.roleId);
    }
    if (!roleObj) {
      roleObj = await findRoleByName(updateData.roleId);
    }
    if (!roleObj) {
      roleObj = await createRoleInRepo(updateData.roleId);
    }
    safeUpdateData.roleId = roleObj.id;
    safeUpdateData.role = roleObj.name;
  } else if (updateData.role) {
    let roleObj = null;
    if (isUuid(updateData.role)) {
      roleObj = await findRoleById(updateData.role);
    }
    if (!roleObj) {
      roleObj = await findRoleByName(updateData.role);
    }
    if (!roleObj) {
      roleObj = await createRoleInRepo(updateData.role);
    }
    safeUpdateData.roleId = roleObj.id;
    safeUpdateData.role = roleObj.name;
  }


  // Branch handling — allow assigning or clearing the branch
  if (updateData.branchId !== undefined) {
    if (updateData.branchId) {
      const OR = [];
      if (isUuid(updateData.branchId)) {
        OR.push({ id: updateData.branchId });
      }
      OR.push({ code: updateData.branchId });
      OR.push({ name: { equals: updateData.branchId, mode: "insensitive" } });

      const dbBranch = await prisma.branch.findFirst({
        where: { OR }
      });

      if (dbBranch) {
        safeUpdateData.branchId = dbBranch.id;
      } else {
        const newBranch = await prisma.branch.create({
          data: {
            name: updateData.branchId.startsWith("b-") ? "Main Store Branch" : updateData.branchId,
            code: `BR-${Date.now().toString().slice(-4)}`,
            isActive: true,
          }
        });
        safeUpdateData.branchId = newBranch.id;
      }
    } else {
      safeUpdateData.branchId = null;
    }
  }


  // Password update — if admin provides a new password, save it (hashed + plain)
  // and email the plain text to the employee.
  let plainPasswordToSend = null;

  if (updateData.password && updateData.password.trim() !== "") {
    plainPasswordToSend = updateData.password.trim();
    safeUpdateData.passwordHash  = await bcrypt.hash(plainPasswordToSend, 12);
    safeUpdateData.plainPassword = plainPasswordToSend;
    safeUpdateData.firstLogin    = true;
  }



  // Flags
  if (updateData.isVerified !== undefined) {
    safeUpdateData.isVerified = Boolean(updateData.isVerified);
  }

  if (updateData.firstLogin !== undefined) {
    safeUpdateData.firstLogin = Boolean(updateData.firstLogin);
  }


  if (Object.keys(safeUpdateData).length === 0) {
    throw new Error("No valid fields to update");
  }


  const updatedEmployee =
    await updateEmployee(
      id,
      safeUpdateData
    );


  // Send notification email with the employee's current password
  let emailSent = false;

  try {
    const targetEmail = updatedEmployee.email;

    await sendEmployeeUpdatedEmail(
      targetEmail,
      updatedEmployee.employeeId,
      updatedEmployee.fullName,
      plainPasswordToSend,
      updatedEmployee.branch?.name
    );

    emailSent = true;
  } catch (emailErr) {
    console.error(
      "Failed to send employee update notification email:",
      emailErr.message
    );
  }


  // Audit log
  await recordAuditLog(req, {
    action: "UPDATE",
    entity: "Employee",
    entityId: id,

    details: {
      fullName: updatedEmployee.fullName || existingEmployee.fullName,
      employeeId: updatedEmployee.employeeId || existingEmployee.employeeId,
      email: updatedEmployee.email || existingEmployee.email,
      updatedFields: Object.keys(safeUpdateData),
      emailSent,
      description: `Employee updated`,
    },
  });


  return {
    success: true,
    message: emailSent
      ? `Employee updated successfully and email sent to ${updatedEmployee.email}`
      : "Employee updated successfully",
    data: removeSensitiveFields(updatedEmployee),
    emailSent,
  };
};


// Delete employee
const removeEmployee = async (
  id,
  req
) => {

  const existingEmployee =
    await getEmployeeById(id);

  if (!existingEmployee) {
    throw new Error(
      "Employee not found"
    );
  }


  await deleteEmployee(id);


  // Audit log
  await recordAuditLog(req, {
    action: "DELETE",
    entity: "Employee",
    entityId: id,

    details: {
      fullName: existingEmployee.fullName,
      employeeId: existingEmployee.employeeId,
      email: existingEmployee.email,
      description: `Employee deleted`,
    },
  });


  return {
    success: true,
    message:
      "Employee deleted successfully",
  };
};


export {
  fetchAllEmployees,
  fetchEmployeeById,
  addEmployee,
  modifyEmployee,
  removeEmployee,
};