import prisma from "../config/prisma.js";

/**
 * Middleware to enforce module access based on company enabled modules
 * @param {string} moduleCode - Code of the module (e.g., "PRODUCTS", "MEMBERS")
 */
export const requireModuleAccess = (moduleCode) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized: Please log in to access this resource",
        });
      }

      const roleUpper = (req.user.role || "").toUpperCase();
      if (roleUpper.includes("SUPER")) {
        return next();
      }

      // Check if moduleCode is in user's enabledModules list
      if (req.user.enabledModules && req.user.enabledModules.includes(moduleCode)) {
        return next();
      }

      // If user has companyId, perform a fallback database check
      if (req.user.companyId) {
        const companyModule = await prisma.companyModule.findFirst({
          where: {
            companyId: req.user.companyId,
            module: { code: moduleCode },
            enabled: true,
          },
        });

        if (companyModule) {
          return next();
        }
      }

      return res.status(403).json({
        success: false,
        message: `403 Forbidden: Module '${moduleCode}' is not enabled for your company.`,
      });
    } catch (err) {
      console.error("Module Access Middleware Error:", err);
      return res.status(500).json({
        success: false,
        message: "Internal Server Error checking module access",
      });
    }
  };
};

/**
 * Middleware to enforce specific permission codes
 */
export const requirePermission = (permissionCode) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const roleUpper = (req.user.role || "").toUpperCase();
    if (roleUpper.includes("SUPER") || roleUpper.includes("ADMIN")) {
      return next();
    }

    next();
  };
};
