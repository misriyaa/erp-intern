import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";

/**
 * Middleware that extracts JWT token from Authorization header or cookies,
 * looks up the user in the DB with company relation, and attaches user info to `req.user`.
 */
export const attachUserIfAuthenticated = async (req, res, next) => {
  try {
    let token = null;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (token) {
      const secret = process.env.JWT_SECRET || "supersecretkey";
      const decoded = jwt.verify(token, secret);

      if (decoded && decoded.id) {
        const user = await prisma.user.findUnique({
          where: { id: decoded.id },
          include: {
            roleRef: true,
            branch: true,
            company: {
              include: {
                industry: true,
                modules: {
                  include: {
                    module: true,
                  },
                },
              },
            },
          },
        });

        if (user) {
          const companyModules =
            user.company?.modules
              ?.filter((cm) => cm.enabled)
              .map((cm) => cm.module.code) || [];

          let userModules = companyModules;
          if (user.permissions) {
            try {
              const parsed = JSON.parse(user.permissions);
              if (Array.isArray(parsed)) {
                userModules = parsed;
              }
            } catch (e) {
              if (typeof user.permissions === "string") {
                userModules = user.permissions.split(",").map((s) => s.trim().toUpperCase());
              }
            }
          }

          let overriddenCompanyId = user.companyId || user.company?.id || null;
          let overriddenCompanyName = user.company?.name || "Default Company";
          let overriddenBranchId = user.branchId;
          let industryCode = user.company?.industry?.code || user.type || "RETAIL";
          let industryName = user.company?.industry?.name || "Retail";

          const roleName = user.roleRef?.name || user.role || "ADMIN";
          const isSuper = roleName.toUpperCase().includes("SUPER");

          if (isSuper) {
            const clientCompanyHeader = req.headers["x-company-override"];
            const clientBranchHeader = req.headers["x-branch-override"];

            if (clientCompanyHeader) {
              overriddenCompanyId = clientCompanyHeader;
              // Fetch overridden company modules
              const dbCompany = await prisma.company.findUnique({
                where: { id: overriddenCompanyId },
                include: {
                  industry: true,
                  modules: {
                    include: { module: true },
                  },
                },
              });

              if (dbCompany) {
                userModules = dbCompany.modules?.filter((cm) => cm.enabled).map((cm) => cm.module.code) || [];
                industryCode = dbCompany.industry?.code || "RETAIL";
                industryName = dbCompany.industry?.name || "Retail";
                overriddenCompanyName = dbCompany.name;
              }
            }

            if (clientBranchHeader) {
              overriddenBranchId = clientBranchHeader;
            }
          }

          req.user = {
            id: user.id,
            fullName: user.fullName || user.email,
            email: user.email,
            employeeId: user.employeeId,
            role: roleName,
            companyId: overriddenCompanyId,
            companyName: overriddenCompanyName,
            industryCode: industryCode,
            industryName: industryName,
            enabledModules: userModules,
            permissions: user.permissions,
            branchId: overriddenBranchId,
          };
          req.companyId = req.user.companyId;
          req.tenantId = req.user.companyId;
          req.branchId = overriddenBranchId;
        }
      }
    }
  } catch (err) {
    // Non-blocking catch to ensure requests aren't broken if token is expired or malformed
  }

  next();
};

export const requireTenant = (req, res, next) => {
  const companyId = req.companyId || req.user?.companyId;
  if (!companyId) {
    return res.status(403).json({
      success: false,
      message: "Tenant context required. Access denied.",
    });
  }
  next();
};

export const requireRoles = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Please log in to access this resource",
      });
    }

    const roleUpper = (req.user.role || "").toUpperCase();

    if (roleUpper === "SUPER_ADMIN" || roleUpper === "SUPERADMIN") {
      return next();
    }

    const hasRole = allowedRoles.some(
      (r) =>
        roleUpper.includes(r.toUpperCase()) ||
        r.toUpperCase() === roleUpper
    );

    if (!hasRole) {
      return res.status(403).json({
        success: false,
        message: `403 Forbidden: You do not have the required role to access this resource.`,
      });
    }

    next();
  };
};

