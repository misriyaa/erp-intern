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

          req.user = {
            id: user.id,
            fullName: user.fullName || user.email,
            email: user.email,
            employeeId: user.employeeId,
            role: user.roleRef?.name || user.role || "ADMIN",
            companyId: user.companyId || user.company?.id || null,
            companyName: user.company?.name || "Default Company",
            industryCode: user.company?.industry?.code || user.type || "RETAIL",
            industryName: user.company?.industry?.name || "Retail",
            enabledModules: companyModules,
          };
        }
      }
    }
  } catch (err) {
    // Non-blocking catch to ensure requests aren't broken if token is expired or malformed
  }

  next();
};
