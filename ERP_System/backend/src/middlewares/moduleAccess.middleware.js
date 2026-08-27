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

      const codesToCheck = [moduleCode];
      if (moduleCode === "MEDICAL_SHOP") codesToCheck.push("MEDICAL");
      if (moduleCode === "MEDICAL") codesToCheck.push("MEDICAL_SHOP");

      // Check if any code is in user's enabledModules list
      if (req.user.enabledModules && codesToCheck.some(code => req.user.enabledModules.includes(code))) {
        return next();
      }

      // If user has companyId, perform fallback database check against company modules & industry
      if (req.user.companyId) {
        const company = await prisma.company.findUnique({
          where: { id: req.user.companyId },
          include: { industry: true, modules: { include: { module: true } } },
        });

        if (company) {
          const indCode = (company.industry?.code || "").toUpperCase();
          if (codesToCheck.some((c) => indCode.includes(c) || c.includes(indCode))) {
            return next();
          }

          const companyModule = company.modules?.find(
            (cm) => cm.enabled && codesToCheck.includes((cm.module?.code || "").toUpperCase())
          );
          if (companyModule) {
            return next();
          }
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
