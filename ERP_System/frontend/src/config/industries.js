import {
  FiGrid,
  FiShoppingBag,
  FiBox,
  FiTag,
  FiPackage,
  FiUsers,
  FiTruck,
  FiShoppingCart,
  FiDollarSign,
  FiBriefcase,
  FiUserCheck,
  FiBarChart2,
  FiSettings,
  FiMapPin,
  FiUser,
  FiClock,
  FiCheckSquare,
  FiCreditCard,
  FiAward,
  FiMonitor,
  FiLayers,
  FiCpu,
  FiCheckCircle,
  FiHome,
} from "react-icons/fi";

export const INDUSTRY_CODES = {
  RETAIL: "RETAIL",
  GYM: "GYM",
  TEXTILE: "TEXTILE",
};

export const ROUTE_MODULE_MAP = {
  // Core & Dashboards
  "/dashboard": "DASHBOARD",
  "/dashboard/sales-dashboard": "DASHBOARD",
  "/dashboard/inventory-dashboard": "DASHBOARD",
  "/dashboard/finance-dashboard": "DASHBOARD",
  "/dashboard/pos-dashboard": "DASHBOARD",
  "/dashboard/hrm-dashboard": "DASHBOARD",

  // POS Terminal
  "/pos": "SALES",
  "/pos/cart": "SALES",
  "/pos/checkout": "SALES",
  "/pos/receipt": "SALES",

  // Retail Products & Inventory
  "/admin/products": "PRODUCTS",
  "/admin/products/view": "PRODUCTS",
  "/admin/products/add": "PRODUCTS",
  "/admin/products/edit": "PRODUCTS",
  "/admin/products/details": "PRODUCTS",
  "/admin/categories": "CATEGORIES",
  "/admin/brand": "BRANDS",
  "/admin/units": "PRODUCTS",
  "/warehouse/stock": "INVENTORY",
  "/warehouse": "INVENTORY",
  "/warehouse/add": "INVENTORY",
  "/warehouse/transfer": "INVENTORY",
  "/admin/inventory": "INVENTORY",

  // Retail Sales & Customers
  "/customers": "CUSTOMERS",
  "/customers/add": "CUSTOMERS",
  "/customers/edit": "CUSTOMERS",
  "/customers/view": "CUSTOMERS",
  "/sales": "SALES",
  "/sales/add": "SALES",
  "/sales/edit": "SALES",
  "/invoices": "SALES",
  "/invoices/create": "SALES",

  // Retail Purchases & Suppliers
  "/admin/suppliers": "SUPPLIERS",
  "/purchases": "PURCHASES",
  "/purchases/add": "PURCHASES",
  "/purchases/edit": "PURCHASES",

  // Gym Modules
  "/gym/members": "MEMBERS",
  "/gym/plans": "MEMBERSHIP_PLANS",
  "/gym/membership-plans": "MEMBERSHIP_PLANS",
  "/gym/trainers": "TRAINERS",
  "/gym/attendance": "ATTENDANCE",
  "/gym/payments": "PAYMENTS",

  // Textile Modules
  "/textile/products": "PRODUCTS",
  "/textile/raw-materials": "RAW_MATERIALS",
  "/textile/production": "PRODUCTION",
  "/textile/quality-control": "QUALITY_CONTROL",

  // Core Operations
  "/admin/expenses": "EXPENSES",
  "/admin/branches": "BRANCHES",
  "/admin/employees": "EMPLOYEES",
  "/admin/employees/add": "EMPLOYEES",
  "/admin/employees/view": "EMPLOYEES",
  "/admin/departments": "EMPLOYEES",
  "/admin/designations": "EMPLOYEES",
  "/reports": "REPORTS",
  "/reports/inventory": "REPORTS",
  "/reports/purchase": "REPORTS",
  "/reports/sales": "REPORTS",
  "/admin/settings": "SETTINGS",
  "/settings": "SETTINGS",
  "/settings/business": "SETTINGS",
  "/settings/profile": "SETTINGS",
};

export const MASTER_NAVIGATION_CATALOG = [
  // Shared Core & Dashboards
  { moduleCode: "DASHBOARD", label: "Dashboard", href: "/dashboard", icon: FiGrid },

  // Gym Industry Modules
  { moduleCode: "MEMBERS", label: "Gym Members", href: "/gym/members", icon: FiUsers, industry: "GYM" },
  { moduleCode: "MEMBERSHIP_PLANS", label: "Membership Plans", href: "/gym/plans", icon: FiAward, industry: "GYM" },
  { moduleCode: "TRAINERS", label: "Gym Trainers", href: "/gym/trainers", icon: FiUserCheck, industry: "GYM" },
  { moduleCode: "ATTENDANCE", label: "Attendance Log", href: "/gym/attendance", icon: FiCheckSquare, industry: "GYM" },
  { moduleCode: "PAYMENTS", label: "Payments & Fees", href: "/gym/payments", icon: FiCreditCard, industry: "GYM" },
  { moduleCode: "BRANCHES", label: "Fitness Centers & Facilities", href: "/admin/branches", icon: FiMapPin, industry: "GYM" },
  { moduleCode: "SUPPLIERS", label: "Equipment Suppliers", href: "/admin/suppliers", icon: FiTruck, industry: "GYM" },

  // Textile Industry Modules
  { moduleCode: "PRODUCTS", label: "Textile Products", href: "/textile/products", icon: FiShoppingBag, industry: "TEXTILE" },
  { moduleCode: "RAW_MATERIALS", label: "Raw Materials", href: "/textile/raw-materials", icon: FiLayers, industry: "TEXTILE" },
  { moduleCode: "PRODUCTION", label: "Production Tracking", href: "/textile/production", icon: FiCpu, industry: "TEXTILE" },
  { moduleCode: "INVENTORY", label: "Inventory Stock", href: "/warehouse/stock", icon: FiPackage, industry: "TEXTILE" },
  { moduleCode: "WAREHOUSES", label: "Mill Warehouses", href: "/warehouse", icon: FiHome, industry: "TEXTILE" },
  { moduleCode: "QUALITY_CONTROL", label: "Quality Control", href: "/textile/quality-control", icon: FiCheckCircle, industry: "TEXTILE" },
  { moduleCode: "BRANCHES", label: "Mills & Manufacturing Units", href: "/admin/branches", icon: FiMapPin, industry: "TEXTILE" },
  { moduleCode: "SUPPLIERS", label: "Yarn & Dye Suppliers", href: "/admin/suppliers", icon: FiTruck, industry: "TEXTILE" },
  { moduleCode: "SALES", label: "Fabric Sales & Export", href: "/sales", icon: FiShoppingCart, industry: "TEXTILE" },

  // Retail Industry Modules
  { moduleCode: "SALES", label: "POS Terminal", href: "/pos", icon: FiMonitor, industry: "RETAIL" },
  { moduleCode: "SALES", label: "Barcode Printing", href: "/admin/pos/barcode-print", icon: FiTag, industry: "RETAIL" },
  { moduleCode: "PRODUCTS", label: "Products", href: "/admin/products/view", icon: FiShoppingBag, industry: "RETAIL" },
  { moduleCode: "CATEGORIES", label: "Categories", href: "/admin/categories", icon: FiBox, industry: "RETAIL" },
  { moduleCode: "BRANDS", label: "Brands", href: "/admin/brand", icon: FiTag, industry: "RETAIL" },
  { moduleCode: "PRODUCTS", label: "Units of Measure", href: "/admin/units", icon: FiBox, industry: "RETAIL" },
  { moduleCode: "INVENTORY", label: "Inventory / Stock", href: "/warehouse/stock", icon: FiPackage, industry: "RETAIL" },
  { moduleCode: "INVENTORY", label: "Warehouse Management", href: "/warehouse", icon: FiBriefcase, industry: "RETAIL" },
  { moduleCode: "CUSTOMERS", label: "Customers", href: "/customers", icon: FiUsers, industry: "RETAIL" },
  { moduleCode: "SUPPLIERS", label: "Goods Vendors & Suppliers", href: "/admin/suppliers", icon: FiTruck, industry: "RETAIL" },
  { moduleCode: "PURCHASES", label: "Purchases", href: "/purchases", icon: FiShoppingCart, industry: "RETAIL" },
  { moduleCode: "SALES", label: "Sales Orders", href: "/sales", icon: FiShoppingCart, industry: "RETAIL" },
  { moduleCode: "BRANCHES", label: "Store Outlets & Branches", href: "/admin/branches", icon: FiMapPin, industry: "RETAIL" },

  // Shared Core Operations
  { moduleCode: "EXPENSES", label: "Expenses & Accounts", href: "/admin/expenses", icon: FiDollarSign },
  { moduleCode: "EMPLOYEES", label: "Employees / Staff", href: "/admin/employees/view", icon: FiUserCheck },
  { moduleCode: "REPORTS", label: "Reports & Analytics", href: "/reports", icon: FiBarChart2 },
  { moduleCode: "SETTINGS", label: "Settings", href: "/admin/settings", icon: FiSettings },
];
