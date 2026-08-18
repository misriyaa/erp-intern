import prisma from "../../config/prisma.js";

/**
 * Fetch sales data within a date range
 */
export const getSalesData = async (startDate, endDate, customerId) => {
  const where = {
    orderDate: {
      gte: new Date(startDate),
      lte: new Date(endDate),
    },
    status: {
      not: "CANCELLED",
    },
  };

  if (customerId) {
    where.customerId = customerId;
  }

  return await prisma.salesOrder.findMany({
    where,
    orderBy: {
      orderDate: "asc",
    },
  });
};

/**
 * Fetch customer details for mapping
 */
export const getCustomersByIds = async (customerIds) => {
  return await prisma.customer.findMany({
    where: {
      id: {
        in: customerIds,
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
    },
  });
};

/**
 * Fetch purchase data within a date range
 */
export const getPurchaseData = async (startDate, endDate, supplierId) => {
  const where = {
    purchaseDate: {
      gte: new Date(startDate),
      lte: new Date(endDate),
    },
    status: {
      not: "CANCELLED",
    },
  };

  if (supplierId) {
    where.supplierId = supplierId;
  }

  return await prisma.purchase.findMany({
    where,
    include: {
      supplier: {
        select: {
          id: true,
          companyName: true,
        },
      },
      warehouse: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      purchaseDate: "asc",
    },
  });
};

/**
 * Fetch inventory data, optionally filtered by warehouse
 */
export const getInventoryData = async (warehouseId) => {
  const where = {};
  if (warehouseId) {
    where.warehouseId = warehouseId;
  }

  return await prisma.inventory.findMany({
    where,
    include: {
      product: {
        include: {
          category: {
            select: {
              name: true,
            },
          },
        },
      },
      warehouse: {
        select: {
          name: true,
        },
      },
    },
  });
};

/**
 * Fetch all customers to list in filters
 */
export const getAllCustomers = async () => {
  return await prisma.customer.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: "asc",
    },
  });
};

/**
 * Fetch all suppliers to list in filters
 */
export const getAllSuppliers = async () => {
  return await prisma.supplier.findMany({
    select: {
      id: true,
      companyName: true,
    },
    orderBy: {
      companyName: "asc",
    },
  });
};

/**
 * Fetch all warehouses to list in filters
 */
export const getAllWarehouses = async () => {
  return await prisma.warehouse.findMany({
    select: {
      id: true,
      name: true,
      code: true,
    },
    orderBy: {
      name: "asc",
    },
  });
};
