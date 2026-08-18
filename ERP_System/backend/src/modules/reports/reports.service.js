import * as reportsRepository from "./reports.repository.js";

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
  return dateStr.toISOString().split("T")[0];
};

/**
 * Get Sales Report
 */
export const getSalesReport = async (startDate, endDate, groupBy = "day", customerId) => {
  // Fetch raw sales order records
  const sales = await reportsRepository.getSalesData(startDate, endDate, customerId);
  
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

    totalSales += netAmount || totalAmount;
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
    chartMap[groupKey].sales += netAmount || totalAmount;
    chartMap[groupKey].orders += 1;
    chartMap[groupKey].tax += taxAmount;
    chartMap[groupKey].discount += discountAmount;

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      orderDate: order.orderDate,
      customerId: order.customerId,
      customerName: customerMap[order.customerId] || "Walk-in Customer",
      totalAmount: totalAmount,
      taxAmount: taxAmount,
      discountAmount: discountAmount,
      netAmount: netAmount || totalAmount,
      status: order.status,
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
export const getPurchaseReport = async (startDate, endDate, groupBy = "day", supplierId) => {
  const purchases = await reportsRepository.getPurchaseData(startDate, endDate, supplierId);

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
export const getInventoryReport = async (warehouseId) => {
  const inventory = await reportsRepository.getInventoryData(warehouseId);

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
export const getReportFilters = async () => {
  const [customers, suppliers, warehouses] = await Promise.all([
    reportsRepository.getAllCustomers(),
    reportsRepository.getAllSuppliers(),
    reportsRepository.getAllWarehouses(),
  ]);

  return {
    customers,
    suppliers,
    warehouses,
  };
};
