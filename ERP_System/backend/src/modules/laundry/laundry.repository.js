import prisma from "../../config/prisma.js";

// ==========================================
// LAUNDRY PROFILES REPOSITORY
// ==========================================

export const createLaundryRepo = async (companyId, data) => {
  return await prisma.laundry.create({
    data: {
      ...data,
      companyId,
    },
  });
};

export const getLaundriesRepo = async (companyId) => {
  return await prisma.laundry.findMany({
    where: { companyId },
    include: { branch: true },
    orderBy: { createdAt: "desc" },
  });
};

export const getLaundryByIdRepo = async (companyId, id) => {
  return await prisma.laundry.findFirst({
    where: { id, companyId },
    include: { branch: true },
  });
};

export const updateLaundryRepo = async (companyId, id, data) => {
  return await prisma.laundry.update({
    where: { id, companyId },
    data,
  });
};

export const deleteLaundryRepo = async (companyId, id) => {
  return await prisma.laundry.delete({
    where: { id, companyId },
  });
};

// ==========================================
// LAUNDRY SERVICE CATEGORIES REPOSITORY
// ==========================================

export const createCategoryRepo = async (data) => {
  const { companyId, ...cleanData } = data;
  return await prisma.laundryServiceCategory.create({
    data: cleanData,
  });
};

export const getCategoriesRepo = async (laundryId) => {
  return await prisma.laundryServiceCategory.findMany({
    where: { laundryId },
    orderBy: { sortOrder: "asc" },
  });
};

export const getCategoryByIdRepo = async (id) => {
  return await prisma.laundryServiceCategory.findUnique({
    where: { id },
  });
};

export const updateCategoryRepo = async (id, data) => {
  const { companyId, ...cleanData } = data;
  return await prisma.laundryServiceCategory.update({
    where: { id },
    data: cleanData,
  });
};

export const deleteCategoryRepo = async (id) => {
  return await prisma.laundryServiceCategory.delete({
    where: { id },
  });
};

// ==========================================
// LAUNDRY SERVICES REPOSITORY
// ==========================================

export const createServiceRepo = async (data) => {
  const { companyId, ...cleanData } = data;
  return await prisma.laundryService.create({
    data: cleanData,
  });
};

export const getServicesRepo = async (laundryId, { categoryId, status }) => {
  const where = { laundryId };
  if (categoryId) where.categoryId = categoryId;
  if (status) where.status = status;

  return await prisma.laundryService.findMany({
    where,
    include: { category: true },
    orderBy: { name: "asc" },
  });
};

export const getServiceByIdRepo = async (id) => {
  return await prisma.laundryService.findUnique({
    where: { id },
    include: { category: true },
  });
};

export const updateServiceRepo = async (id, data) => {
  const { companyId, ...cleanData } = data;
  return await prisma.laundryService.update({
    where: { id },
    data: cleanData,
  });
};

export const deleteServiceRepo = async (id) => {
  return await prisma.laundryService.delete({
    where: { id },
  });
};

// ==========================================
// LAUNDRY ORDERS REPOSITORY
// ==========================================

export const createOrderRepo = async (companyId, orderData, itemsData, paymentData, deliveryData) => {
  return await prisma.$transaction(async (tx) => {
    // Generate order number
    const count = await tx.laundryOrder.count({
      where: { companyId },
    });
    const orderNumber = `LND-${(count + 1).toString().padStart(4, "0")}`;

    const isUUID = (str) => typeof str === "string" && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(str);
    const cleanCustomerId = isUUID(orderData.customerId) ? orderData.customerId : null;
    const cleanBranchId = isUUID(orderData.branchId) ? orderData.branchId : null;

    // Create the Order
    const order = await tx.laundryOrder.create({
      data: {
        companyId,
        laundryId: orderData.laundryId,
        branchId: cleanBranchId,
        customerId: cleanCustomerId,
        orderNumber,
        status: orderData.status || "RECEIVED",
        subtotal: orderData.subtotal,
        discountAmount: orderData.discountAmount || 0,
        taxAmount: orderData.taxAmount || 0,
        totalAmount: orderData.totalAmount,
        paidAmount: orderData.paidAmount || 0,
        balanceAmount: orderData.balanceAmount || 0,
        specialInstructions: orderData.specialInstructions || null,
        createdBy: orderData.createdBy || null,
        receivedAt: new Date(),
      },
    });

    // Create order items & individual garments
    let garmentSeq = 1;
    for (const item of itemsData) {
      const orderItem = await tx.laundryOrderItem.create({
        data: {
          orderId: order.id,
          serviceId: item.serviceId,
          garmentType: item.garmentType,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discountAmount: item.discountAmount || 0,
          taxAmount: item.taxAmount || 0,
          totalAmount: item.totalAmount,
          notes: item.notes || null,
        },
      });

      // Create individual garments for barcode tracking
      for (let i = 0; i < item.quantity; i++) {
        const tagNumber = `${orderNumber}-${garmentSeq.toString().padStart(3, "0")}`;
        await tx.laundryGarment.create({
          data: {
            orderItemId: orderItem.id,
            tagNumber,
            barcode: tagNumber,
            status: "RECEIVED",
            notes: `Garment ${i + 1} of type ${item.garmentType}`,
          },
        });
        garmentSeq++;
      }
    }

    // Add status history
    await tx.laundryStatusHistory.create({
      data: {
        orderId: order.id,
        oldStatus: null,
        newStatus: order.status,
        changedBy: orderData.createdBy || "SYSTEM",
        notes: "Order initially received",
      },
    });

    // Add delivery record if home delivery is requested
    if (deliveryData) {
      await tx.laundryDelivery.create({
        data: {
          orderId: order.id,
          deliveryAddress: deliveryData.deliveryAddress,
          phone: deliveryData.phone,
          deliveryDate: deliveryData.deliveryDate ? new Date(deliveryData.deliveryDate) : null,
          deliveryStatus: "PENDING",
          deliveryNotes: deliveryData.deliveryNotes || null,
        },
      });
    }

    // Process payment if amount paid > 0
    if (paymentData && parseFloat(paymentData.amount) > 0) {
      const payNumber = paymentData.paymentNumber || `PAY-LND-${Date.now().toString().slice(-6)}`;
      await tx.payment.create({
        data: {
          companyId,
          branchId: cleanBranchId,
          customerId: cleanCustomerId,
          laundryOrderId: order.id,
          paymentNumber: payNumber,
          paymentDate: new Date(),
          amount: parseFloat(paymentData.amount),
          method: paymentData.method || "CASH",
          referenceNumber: paymentData.referenceNumber || null,
          status: "PAID",
          notes: `Payment for Laundry Order ${orderNumber}`,
        },
      });
    }

    return await tx.laundryOrder.findUnique({
      where: { id: order.id },
      include: {
        items: {
          include: {
            service: true,
            garments: true,
          },
        },
        delivery: true,
        payments: true,
      },
    });
  });
};

export const getOrdersRepo = async (companyId, { laundryId, status, search }) => {
  const where = {};
  if (companyId) where.companyId = companyId;
  if (laundryId) where.laundryId = laundryId;
  if (status) where.status = status;

  if (search) {
    where.OR = [
      { orderNumber: { contains: search, mode: "insensitive" } },
      { customer: { name: { contains: search, mode: "insensitive" } } },
      { customer: { phone: { contains: search, mode: "insensitive" } } },
    ];
  }

  return await prisma.laundryOrder.findMany({
    where,
    include: {
      customer: true,
      laundry: true,
      branch: true,
      items: {
        include: {
          service: true,
          garments: true,
        },
      },
      delivery: true,
      payments: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

export const getOrderByIdRepo = async (companyId, id) => {
  return await prisma.laundryOrder.findFirst({
    where: { id, companyId },
    include: {
      customer: true,
      laundry: true,
      branch: true,
      items: {
        include: {
          service: true,
          garments: true,
        },
      },
      delivery: true,
      statusHistory: { orderBy: { timestamp: "desc" } },
      payments: true,
    },
  });
};

export const updateOrderStatusRepo = async (companyId, orderId, { status, notes, changedBy }) => {
  return await prisma.$transaction(async (tx) => {
    const order = await tx.laundryOrder.findFirst({
      where: { id: orderId, companyId },
    });

    if (!order) throw new Error("Order not found");

    const oldStatus = order.status;
    const updateData = { status };

    if (status === "PROCESSING" && !order.processingAt) {
      updateData.processingAt = new Date();
    } else if (status === "READY" && !order.readyAt) {
      updateData.readyAt = new Date();
    } else if ((status === "DELIVERED" || status === "COMPLETED") && !order.completedAt) {
      updateData.completedAt = new Date();
    }

    // Update main order status
    const updatedOrder = await tx.laundryOrder.update({
      where: { id: orderId },
      data: updateData,
    });

    // Update all garments in the order to follow the status
    const items = await tx.laundryOrderItem.findMany({
      where: { orderId },
    });
    for (const item of items) {
      await tx.laundryGarment.updateMany({
        where: { orderItemId: item.id },
        data: { status },
      });
    }

    // Add status history
    await tx.laundryStatusHistory.create({
      data: {
        orderId,
        oldStatus,
        newStatus: status,
        changedBy: changedBy || "SYSTEM",
        notes: notes || `Order status moved from ${oldStatus} to ${status}`,
      },
    });

    // If status is DELIVERED, update the LaundryDelivery status if it exists
    if (status === "DELIVERED" || status === "COMPLETED") {
      await tx.laundryDelivery.updateMany({
        where: { orderId },
        data: { deliveryStatus: "DELIVERED", deliveryDate: new Date() },
      });
    }

    return updatedOrder;
  });
};

// ==========================================
// LAUNDRY GARMENTS REPOSITORY
// ==========================================

export const getGarmentByBarcodeRepo = async (companyId, barcode) => {
  return await prisma.laundryGarment.findFirst({
    where: {
      OR: [
        { barcode },
        { tagNumber: barcode }
      ],
      orderItem: {
        order: {
          companyId
        }
      }
    },
    include: {
      orderItem: {
        include: {
          order: {
            include: {
              customer: true,
              branch: true
            }
          },
          service: true
        }
      }
    }
  });
};

export const updateGarmentStatusRepo = async (id, status) => {
  return await prisma.laundryGarment.update({
    where: { id },
    data: { status },
  });
};

// ==========================================
// LAUNDRY DELIVERIES REPOSITORY
// ==========================================

export const updateDeliveryStatusRepo = async (orderId, { deliveryStatus, deliveryNotes }) => {
  const data = { deliveryStatus };
  if (deliveryStatus === "DELIVERED") {
    data.deliveryDate = new Date();
  }

  if (deliveryNotes) {
    data.deliveryNotes = deliveryNotes;
  }

  return await prisma.laundryDelivery.update({
    where: { orderId },
    data,
  });
};

// ==========================================
// LAUNDRY DASHBOARD & REPORTS REPOSITORY
// ==========================================

export const getLaundryStatsRepo = async (companyId, laundryId) => {
  const where = { companyId };
  if (laundryId) where.laundryId = laundryId;

  const orders = await prisma.laundryOrder.findMany({ where });

  const activeStatuses = ["RECEIVED", "INSPECTING", "PROCESSING"];
  const readyStatuses = ["READY", "OUT_FOR_DELIVERY"];

  const stats = {
    totalOrders: orders.length,
    activeOrders: orders.filter(o => activeStatuses.includes(o.status)).length,
    readyOrders: orders.filter(o => readyStatuses.includes(o.status)).length,
    completedOrders: orders.filter(o => o.status === "COMPLETED" || o.status === "DELIVERED").length,
    revenue: orders.reduce((sum, o) => sum + parseFloat(o.totalAmount || 0), 0),
    paidAmount: orders.reduce((sum, o) => sum + parseFloat(o.paidAmount || 0), 0),
    balanceAmount: orders.reduce((sum, o) => sum + parseFloat(o.balanceAmount || 0), 0),
  };

  return stats;
};
