import * as reportsRepository from "./reports.repository.js";
import prisma from "../../config/prisma.js";

/**
 * Format date for grouping in chart
 */
const getGroupKey = (dateStr, groupBy) => {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  
  if (groupBy === "month") {
    return `${year}-${month}`;
  }
  
  if (groupBy === "week") {
    // Group by the starting Monday of the week
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(date.setDate(diff));
    return monday.toISOString().split("T")[0];
  }
  
  if (groupBy === "year") {
    return `${year}`;
  }
  
  // default is "day"
  return date.toISOString().split("T")[0];
};

/**
 * Get Sales Report
 */
export const getSalesReport = async (startDate, endDate, groupBy = "day", customerId, companyId) => {
  // Fetch raw sales order records
  const sales = await reportsRepository.getSalesData(startDate, endDate, customerId, companyId);
  
  // Collect customer IDs and fetch names since relation is missing in prisma schema
  const customerIds = [...new Set(sales.map(s => s.customerId).filter(Boolean))];
  const customers = customerIds.length > 0 ? await reportsRepository.getCustomersByIds(customerIds) : [];
  const customerMap = customers.reduce((acc, c) => {
    acc[c.id] = c.name;
    return acc;
  }, {});

  // Compute summary metrics
  let totalSales = 0;
  let totalTax = 0;
  let totalDiscount = 0;
  const totalOrders = sales.length;

  // Initialize grouping for chart
  const chartMap = {};

  const items = sales.map(order => {
    const netAmount = Number(order.netAmount || 0);
    const taxAmount = Number(order.taxAmount || 0);
    const discountAmount = Number(order.discountAmount || 0);
    const totalAmount = Number(order.totalAmount || 0);

    totalSales += totalAmount;
    totalTax += taxAmount;
    totalDiscount += discountAmount;

    // Grouping for chart
    const groupKey = getGroupKey(order.orderDate, groupBy);
    if (!chartMap[groupKey]) {
      chartMap[groupKey] = {
        date: groupKey,
        sales: 0,
        orders: 0,
        tax: 0,
        discount: 0,
      };
    }
    chartMap[groupKey].sales += totalAmount;
    chartMap[groupKey].orders += 1;
    chartMap[groupKey].tax += taxAmount;
    chartMap[groupKey].discount += discountAmount;

    return {
      id: order.id,
      orderNo: order.orderNo,
      orderDate: order.orderDate,
      customerId: order.customerId,
      customerName: customerMap[order.customerId] || "Guest Customer",
      netAmount,
      taxAmount,
      discountAmount,
      totalAmount,
      status: order.status,
      paymentStatus: order.paymentStatus,
    };
  });

  const averageOrderValue = totalOrders > 0 ? (totalSales / totalOrders) : 0;

  // Format chart data into an array ordered by date
  const chartData = Object.values(chartMap).sort((a, b) => a.date.localeCompare(b.date));

  return {
    summary: {
      totalSales,
      totalOrders,
      totalTax,
      totalDiscount,
      averageOrderValue,
    },
    chartData,
    items,
  };
};

/**
 * Get Purchase Report
 */
export const getPurchaseReport = async (startDate, endDate, groupBy = "day", supplierId, companyId) => {
  const purchases = await reportsRepository.getPurchaseData(startDate, endDate, supplierId, companyId);

  let totalPurchases = 0;
  const totalOrders = purchases.length;
  const chartMap = {};

  const items = purchases.map(purchase => {
    const amount = Number(purchase.totalAmount || 0);
    totalPurchases += amount;

    // Grouping for chart
    const groupKey = getGroupKey(purchase.purchaseDate, groupBy);
    if (!chartMap[groupKey]) {
      chartMap[groupKey] = {
        date: groupKey,
        purchases: 0,
        orders: 0,
      };
    }
    chartMap[groupKey].purchases += amount;
    chartMap[groupKey].orders += 1;

    return {
      id: purchase.id,
      purchaseNo: purchase.purchaseNo,
      purchaseDate: purchase.purchaseDate,
      supplierId: purchase.supplierId,
      supplierName: purchase.supplier?.companyName || "Unknown Supplier",
      warehouseId: purchase.warehouseId,
      warehouseName: purchase.warehouse?.name || "Unknown Warehouse",
      totalAmount: amount,
      status: purchase.status,
      notes: purchase.notes,
    };
  });

  const averageOrderValue = totalOrders > 0 ? (totalPurchases / totalOrders) : 0;
  const chartData = Object.values(chartMap).sort((a, b) => a.date.localeCompare(b.date));

  return {
    summary: {
      totalPurchases,
      totalOrders,
      averageOrderValue,
    },
    chartData,
    items,
  };
};

/**
 * Get Inventory Report
 */
export const getInventoryReport = async (warehouseId, companyId) => {
  const inventory = await reportsRepository.getInventoryData(warehouseId, companyId);

  let totalItems = 0;
  let totalValuationCost = 0;
  let totalValuationRetail = 0;
  let lowStockCount = 0;

  const items = inventory.map(item => {
    const qty = item.quantity || 0;
    const cost = Number(item.product?.costPrice || 0);
    const retail = Number(item.product?.sellingPrice || 0);
    const reorder = item.reorderLevel || 0;

    totalItems += qty;
    totalValuationCost += (qty * cost);
    totalValuationRetail += (qty * retail);

    let status = "IN_STOCK";
    if (qty <= 0) {
      status = "OUT_OF_STOCK";
    } else if (qty <= reorder) {
      status = "LOW_STOCK";
      lowStockCount += 1;
    }

    return {
      id: item.id,
      productId: item.productId,
      productName: item.product?.name || "Unknown Product",
      sku: item.product?.sku || "N/A",
      categoryName: item.product?.category?.name || "Uncategorized",
      warehouseName: item.warehouse?.name || "Unknown Warehouse",
      quantity: qty,
      reorderLevel: reorder,
      status,
      costPrice: cost,
      sellingPrice: retail,
      valuationCost: qty * cost,
      valuationRetail: qty * retail,
    };
  });

  return {
    summary: {
      totalItems,
      totalValuationCost,
      totalValuationRetail,
      lowStockCount,
    },
    items,
  };
};

/**
 * Get Report Filtering options
 */
export const getReportFilters = async (companyId) => {
  const [customers, suppliers, warehouses] = await Promise.all([
    reportsRepository.getAllCustomers(companyId),
    reportsRepository.getAllSuppliers(companyId),
    reportsRepository.getAllWarehouses(companyId),
  ]);

  return {
    customers,
    suppliers,
    warehouses,
  };
};

export const getDashboardSummary = async (companyId) => {
  const companyWhere = companyId ? { companyId } : {};

  const totalProducts = await prisma.product.count({
    where: {
      status: "ACTIVE",
      ...companyWhere,
    },
  });

  const totalEmployees = await prisma.user.count({
    where: {
      ...companyWhere,
    },
  });

  const lowStockProducts = await prisma.inventory.count({
    where: {
      quantity: {
        lte: prisma.inventory.reorderLevel,
      },
      product: {
        ...companyWhere,
      },
    },
  }).catch(() => 0);

  const inventories = await prisma.inventory.findMany({
    where: {
      product: {
        ...companyWhere,
      },
    },
    include: {
      product: true,
    },
  });

  let totalValuation = 0;
  let inStockCount = 0;
  let lowStockCount = 0;
  let outOfStockCount = 0;

  inventories.forEach((item) => {
    const qty = Number(item.quantity || 0);
    const price = Number(item.product?.sellingPrice || 0);
    totalValuation += qty * price;

    if (qty <= 0) {
      outOfStockCount++;
    } else if (qty <= (item.reorderLevel || 10)) {
      lowStockCount++;
    } else {
      inStockCount++;
    }
  });

  const salesOrders = await prisma.salesOrder.findMany({
    where: {
      status: "COMPLETED",
      ...companyWhere,
    },
  });

  const totalEarnings = salesOrders.reduce((sum, order) => sum + Number(order.netAmount || order.totalAmount || 0), 0);

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const recentSales = await prisma.salesOrder.findMany({
    where: {
      orderDate: {
        gte: sixMonthsAgo,
      },
      status: "COMPLETED",
      ...companyWhere,
    },
    orderBy: {
      orderDate: "asc",
    },
  });

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const earningsMap = {};

  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const mName = d.toLocaleString("default", { month: "short" });
    earningsMap[mName] = 0;
  }

  recentSales.forEach((sale) => {
    const d = new Date(sale.orderDate || sale.createdAt);
    const mName = d.toLocaleString("default", { month: "short" });
    if (earningsMap[mName] !== undefined) {
      earningsMap[mName] += Number(sale.netAmount || sale.totalAmount || 0);
    }
  });

  const earningsChartData = Object.keys(earningsMap).map((m) => ({
    name: m,
    earnings: Math.round(earningsMap[m]),
  }));

  const [lastSales, lastPurchases, lastTransfers] = await Promise.all([
    prisma.salesOrder.findMany({
      where: companyWhere,
      take: 4,
      orderBy: { createdAt: "desc" },
    }).catch(() => []),
    prisma.purchase.findMany({
      where: companyWhere,
      take: 4,
      orderBy: { createdAt: "desc" },
    }).catch(() => []),
    prisma.stockTransfer.findMany({
      where: companyWhere,
      take: 4,
      orderBy: { createdAt: "desc" },
    }).catch(() => []),
  ]);

  const activities = [];
  lastSales.forEach((s) => {
    activities.push({
      title: "New Sale completed",
      sub: `Order ${s.orderNumber || "INV-N/A"} of ₹${Number(s.netAmount || s.totalAmount || 0).toFixed(2)}`,
      icon: "↩️",
      time: s.createdAt,
    });
  });

  lastPurchases.forEach((p) => {
    activities.push({
      title: "New Purchase Order",
      sub: `PO ${p.purchaseNo} total: ₹${Number(p.totalAmount || 0).toFixed(2)}`,
      icon: "🧾",
      time: p.createdAt,
    });
  });

  lastTransfers.forEach((t) => {
    activities.push({
      title: "Stock Transfer executed",
      sub: `Transfer ${t.transferNo} completed`,
      icon: "📦",
      time: t.createdAt,
    });
  });

  activities.sort((a, b) => new Date(b.time) - new Date(a.time));

  return {
    stats: {
      totalProducts,
      totalEmployees,
      lowStock: lowStockCount || lowStockProducts,
      totalValue: Math.round(totalValuation),
      totalEarnings: Math.round(totalEarnings),
      inStock: inStockCount,
      outOfStock: outOfStockCount,
    },
    earningsChart: earningsChartData,
    recentActivities: activities.slice(0, 5),
  };
};
