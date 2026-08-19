import salesRepository from "./sales.repository.js";
import prisma from "../../config/prisma.js";

async function reduceInventoryStock(items, referenceNo, performedBy = "POS/Sale") {
  if (!Array.isArray(items) || items.length === 0) return;

  for (const item of items) {
    const productId = item.productId || item.id;
    const soldQty = Number(item.quantity || item.qty || 1);

    if (!productId || soldQty <= 0) continue;

    const inventoryRecords = await prisma.inventory.findMany({
      where: { productId },
    }).catch(() => []);

    if (inventoryRecords && inventoryRecords.length > 0) {
      let remainingToDeduct = soldQty;
      for (const inv of inventoryRecords) {
        if (remainingToDeduct <= 0) break;
        const currentQty = inv.quantity || 0;
        const deductQty = Math.min(currentQty, remainingToDeduct);
        const newQty = Math.max(0, currentQty - deductQty);

        await prisma.inventory.update({
          where: { id: inv.id },
          data: { quantity: newQty },
        }).catch(() => null);

        await prisma.stockMovement.create({
          data: {
            productId,
            warehouseId: inv.warehouseId,
            type: "SALE",
            quantity: -deductQty,
            referenceNo: referenceNo || "SALE",
            remarks: `Deducted ${deductQty} unit(s) for sale ${referenceNo || ""}`,
            performedBy,
          },
        }).catch(() => null);

        remainingToDeduct -= deductQty;
      }
    }
  }
}

class SalesService {
  // ===================================
  // Create Sales Order
  // ===================================
  async createSalesOrder(data) {
    const orderNumber = data.orderNumber || `SO-${Date.now()}`;

    // Check duplicate order number
    const existingOrder = await salesRepository.findByOrderNumber(orderNumber);
    let finalOrderNumber = orderNumber;
    if (existingOrder) {
      finalOrderNumber = `${orderNumber}-${Math.floor(Math.random() * 1000)}`;
    }

    // Calculate Net Amount
    const totalAmount = Number(data.totalAmount || 0);
    const taxAmount = Number(data.taxAmount || 0);
    const discountAmount = Number(data.discountAmount || 0);
    const netAmount = Number(data.netAmount ?? (totalAmount + taxAmount - discountAmount));

    // Resolve branchId safely - branchId is REQUIRED by Prisma SalesOrder model!
    let branchId = null;
    if (data.branchId && data.branchId !== "00000000-0000-0000-0000-000000000000") {
      const existingBranch = await prisma.branch.findUnique({ where: { id: data.branchId } }).catch(() => null);
      if (existingBranch) {
        branchId = existingBranch.id;
      }
    }

    if (!branchId) {
      let firstBranch = await prisma.branch.findFirst().catch(() => null);
      if (!firstBranch) {
        // Automatically create default Main Branch if no branch exists in DB
        firstBranch = await prisma.branch.create({
          data: {
            name: "Main Branch",
            code: "MAIN-01",
            address: "Main Store",
            status: "ACTIVE",
          },
        }).catch(() => null);
      }
      if (firstBranch) {
        branchId = firstBranch.id;
      }
    }

    // Resolve customerId safely
    let customerId = null;
    if (data.customerId) {
      const existingCust = await prisma.customer.findUnique({ where: { id: data.customerId } }).catch(() => null);
      if (existingCust) {
        customerId = existingCust.id;
      }
    }

    const payload = {
      branchId,
      orderNumber: finalOrderNumber,
      status: data.status || "CONFIRMED",
      orderDate: data.orderDate ? new Date(data.orderDate) : new Date(),
      totalAmount,
      taxAmount,
      discountAmount,
      netAmount,
    };

    if (customerId) payload.customerId = customerId;

    // Deduct stock for all items sold in this transaction
    if (data.items && Array.isArray(data.items)) {
      await reduceInventoryStock(data.items, finalOrderNumber, "POS Sale");
    }

    return await salesRepository.create(payload);
  }

  // ===================================
  // Get All Sales Orders
  // ===================================
  async getSalesOrders() {
    return await salesRepository.findAll();
  }

  // ===================================
  // Get Single Sales Order
  // ===================================
  async getSalesOrderById(id) {
    const sales = await salesRepository.findById(id);

    if (!sales) {
      throw new Error("Sales order not found.");
    }

    return sales;
  }

  // ===================================
  // Update Sales Order
  // ===================================
  async updateSalesOrder(id, data) {
    const sales = await salesRepository.findById(id);

    if (!sales) {
      throw new Error("Sales order not found.");
    }

    const totalAmount =
      data.totalAmount !== undefined
        ? Number(data.totalAmount)
        : Number(sales.totalAmount);

    const taxAmount =
      data.taxAmount !== undefined
        ? Number(data.taxAmount)
        : Number(sales.taxAmount);

    const discountAmount =
      data.discountAmount !== undefined
        ? Number(data.discountAmount)
        : Number(sales.discountAmount);

    const netAmount = totalAmount + taxAmount - discountAmount;

    return await salesRepository.update(id, {
      ...data,
      netAmount,
    });
  }

  // ===================================
  // Delete Sales Order
  // ===================================
  async deleteSalesOrder(id) {
    const sales = await salesRepository.findById(id);

    if (!sales) {
      throw new Error("Sales order not found.");
    }

    return await salesRepository.delete(id);
  }

  // ===================================
  // Update Order Status
  // ===================================
  async updateOrderStatus(id, status) {
    const sales = await salesRepository.findById(id);

    if (!sales) {
      throw new Error("Sales order not found.");
    }

    return await salesRepository.updateStatus(id, status);
  }

  // ===================================
  // Get Customer Orders
  // ===================================
  async getCustomerOrders(customerId) {
    return await salesRepository.findByCustomer(customerId);
  }

  // ===================================
  // Get Branch Orders
  // ===================================
  async getBranchOrders(branchId) {
    return await salesRepository.findByBranch(branchId);
  }

  // ===================================
  // Get Orders By Status
  // ===================================
  async getStatusOrders(status) {
    return await salesRepository.findByStatus(status);
  }
}

export default new SalesService();