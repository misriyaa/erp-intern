import prisma from "../../config/prisma.js";
import { convertUnit } from "../../utils/unitConverter.js";

const orderInclude = {
  restaurant: true,
  table: {
    include: {
      area: true,
    },
  },
  customer: true,
  items: {
    include: {
      menuItem: {
        include: {
          recipe: {
            include: {
              ingredients: {
                include: {
                  product: true,
                },
              },
            },
          },
        },
      },
    },
  },
  kitchenOrders: {
    include: {
      items: {
        include: {
          menuItem: true,
        },
      },
    },
  },
  payments: true,
};

export const createOrder = async (data) => {
  const { items, ...orderData } = data;

  const orderNumber = orderData.orderNumber || `RST-${Date.now().toString().slice(-6)}`;

  return await prisma.$transaction(async (tx) => {
    let subtotal = 0;
    let totalTax = 0;

    const formattedItems = [];

    if (items && items.length > 0) {
      for (const item of items) {
        const qty = parseFloat(item.quantity) || 1;
        const price = parseFloat(item.unitPrice) || 0;
        const discount = parseFloat(item.discount) || 0;
        const tax = parseFloat(item.tax) || 0;
        const itemTotal = price * qty - discount + tax;

        subtotal += price * qty;
        totalTax += tax;

        formattedItems.push({
          menuItemId: item.menuItemId,
          quantity: qty,
          unitPrice: price,
          discount,
          tax,
          total: itemTotal,
          notes: item.notes || null,
          modifiers: item.modifiers || null,
          status: "PENDING",
        });
      }
    }

    const discountAmount = parseFloat(orderData.discountAmount) || 0;
    const taxAmount = parseFloat(orderData.taxAmount) || totalTax;
    const totalAmount = subtotal - discountAmount + taxAmount;

    const isUUID = (str) => typeof str === "string" && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(str);
    const cleanCustomerId = isUUID(orderData.customerId) ? orderData.customerId : null;
    const cleanTableId = isUUID(orderData.tableId) ? orderData.tableId : null;

    let cleanRestaurantId = isUUID(orderData.restaurantId) ? orderData.restaurantId : null;
    if (!cleanRestaurantId) {
      const firstRest = await tx.restaurant.findFirst({
        where: orderData.branchId ? { branchId: orderData.branchId } : {},
      });
      cleanRestaurantId = firstRest?.id || null;
    }

    const order = await tx.restaurantOrder.create({
      data: {
        ...orderData,
        restaurantId: cleanRestaurantId,
        customerId: cleanCustomerId,
        tableId: cleanTableId,
        orderNumber,
        subtotal,
        discountAmount,
        taxAmount,
        totalAmount,
        status: orderData.status || "DRAFT",
        items: {
          create: formattedItems,
        },
      },
      include: orderInclude,
    });

    if (order.orderType === "DINE_IN" && order.tableId) {
      await tx.restaurantTable.update({
        where: { id: order.tableId },
        data: { status: "OCCUPIED" },
      });
    }

    return order;
  });
};

export const getOrders = async (params) => {
  const { restaurantId, branchId, companyId, tableId, status, orderType, search } = params;
  const where = {};

  if (restaurantId) where.restaurantId = restaurantId;
  if (branchId) where.branchId = branchId;
  if (companyId) where.companyId = companyId;
  if (tableId) where.tableId = tableId;
  if (status) {
    if (Array.isArray(status)) {
      where.status = { in: status };
    } else {
      where.status = status;
    }
  }
  if (orderType) where.orderType = orderType;
  if (search) {
    where.OR = [
      { orderNumber: { contains: search, mode: "insensitive" } },
      { notes: { contains: search, mode: "insensitive" } },
    ];
  }

  return await prisma.restaurantOrder.findMany({
    where,
    include: orderInclude,
    orderBy: { createdAt: "desc" },
  });
};

export const getOrderById = async (id) => {
  return await prisma.restaurantOrder.findUnique({
    where: { id },
    include: orderInclude,
  });
};

export const updateOrder = async (id, data) => {
  const { items, ...orderData } = data;

  return await prisma.$transaction(async (tx) => {
    if (items) {
      await tx.restaurantOrderItem.deleteMany({
        where: { orderId: id },
      });

      let subtotal = 0;
      let totalTax = 0;
      const formattedItems = [];

      for (const item of items) {
        const qty = parseFloat(item.quantity) || 1;
        const price = parseFloat(item.unitPrice) || 0;
        const discount = parseFloat(item.discount) || 0;
        const tax = parseFloat(item.tax) || 0;
        const itemTotal = price * qty - discount + tax;

        subtotal += price * qty;
        totalTax += tax;

        formattedItems.push({
          orderId: id,
          menuItemId: item.menuItemId,
          quantity: qty,
          unitPrice: price,
          discount,
          tax,
          total: itemTotal,
          notes: item.notes || null,
          modifiers: item.modifiers || null,
          status: item.status || "PENDING",
        });
      }

      await tx.restaurantOrderItem.createMany({
        data: formattedItems,
      });

      orderData.subtotal = subtotal;
      orderData.taxAmount = parseFloat(orderData.taxAmount) || totalTax;
      const disc = parseFloat(orderData.discountAmount) || 0;
      orderData.totalAmount = subtotal - disc + orderData.taxAmount;
    }

    const isUUID = (str) => typeof str === "string" && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(str);
    if (orderData.customerId !== undefined) {
      orderData.customerId = isUUID(orderData.customerId) ? orderData.customerId : null;
    }
    if (orderData.tableId !== undefined) {
      orderData.tableId = isUUID(orderData.tableId) ? orderData.tableId : null;
    }

    const updated = await tx.restaurantOrder.update({
      where: { id },
      data: orderData,
      include: orderInclude,
    });

    if (updated.status === "SERVED") {
      await processStockDeductionOnServed(id, tx);
    }

    return await tx.restaurantOrder.findUnique({
      where: { id },
      include: orderInclude,
    });
  });
};

export const processStockDeductionOnServed = async (orderId, tx) => {
  const db = tx || prisma;

  const order = await db.restaurantOrder.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          menuItem: {
            include: {
              recipe: {
                include: {
                  ingredients: {
                    include: {
                      product: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!order) return;

  if (order.stockDeducted) {
    return;
  }

  const defaultWh = await db.warehouse.findFirst({
    where: {
      companyId: order.companyId,
      status: "ACTIVE",
    },
  });

  const warehouseId = defaultWh?.id;
  if (!warehouseId) {
    await db.restaurantOrder.update({
      where: { id: orderId },
      data: { stockDeducted: true },
    });
    return;
  }

  const ingredientTotals = {};

  for (const item of order.items) {
    const recipe = item.menuItem?.recipe;
    if (recipe && recipe.ingredients) {
      for (const ing of recipe.ingredients) {
        if (!ing.product) continue;
        const itemQty = parseFloat(item.quantity) || 1;
        const ingQty = parseFloat(ing.quantity) || 0;
        const rawRequired = itemQty * ingQty;

        const recipeUnit = ing.unit || ing.product.stockUnit || ing.product.unit || "";
        const stockUnit = ing.product.stockUnit || ing.product.unit || "";

        const convertedQty = convertUnit(rawRequired, recipeUnit, stockUnit);

        if (!ingredientTotals[ing.productId]) {
          ingredientTotals[ing.productId] = {
            productId: ing.productId,
            productName: ing.product.name,
            recipeUnit,
            stockUnit,
            requiredQty: 0,
          };
        }
        ingredientTotals[ing.productId].requiredQty += convertedQty;
      }
    }
  }

  const prodIds = Object.keys(ingredientTotals);
  if (prodIds.length === 0) {
    await db.restaurantOrder.update({
      where: { id: orderId },
      data: { stockDeducted: true },
    });
    return;
  }

  const shortages = [];
  for (const prodId of prodIds) {
    const info = ingredientTotals[prodId];
    const inventory = await db.inventory.findFirst({
      where: { productId: prodId, warehouseId },
    });
    const currentStock = inventory ? parseFloat(inventory.quantity) : 0;
    if (currentStock < info.requiredQty) {
      shortages.push(
        `${info.productName}: Required ${info.requiredQty.toFixed(3)} ${info.stockUnit || "units"}, Available ${currentStock.toFixed(3)} ${info.stockUnit || "units"}`
      );
    }
  }

  if (shortages.length > 0) {
    throw new Error(`Insufficient kitchen stock to serve order: ${shortages.join("; ")}`);
  }

  for (const prodId of prodIds) {
    const info = ingredientTotals[prodId];
    const inventory = await db.inventory.findFirst({
      where: { productId: prodId, warehouseId },
    });

    const currentStock = inventory ? parseFloat(inventory.quantity) : 0;
    const newStock = currentStock - info.requiredQty;

    if (inventory) {
      await db.inventory.update({
        where: { id: inventory.id },
        data: { quantity: newStock },
      });
    } else {
      await db.inventory.create({
        data: {
          productId: prodId,
          warehouseId,
          quantity: newStock,
        },
      });
    }

    await db.stockMovement.create({
      data: {
        companyId: order.companyId,
        productId: prodId,
        warehouseId,
        type: "RECIPE_CONSUMPTION",
        quantity: -info.requiredQty,
        referenceNo: order.orderNumber,
        remarks: `Recipe stock deduction for Restaurant Order ${order.orderNumber} (Served) - ${info.productName}`,
      },
    });
  }

  await db.restaurantOrder.update({
    where: { id: orderId },
    data: { stockDeducted: true },
  });
};

export const checkStockAvailability = async (orderId, warehouseId) => {
  const order = await prisma.restaurantOrder.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          menuItem: {
            include: {
              recipe: {
                include: {
                  ingredients: {
                    include: {
                      product: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!order) throw new Error("Order not found.");

  let targetWarehouseId = warehouseId;
  if (!targetWarehouseId) {
    const defaultWh = await prisma.warehouse.findFirst({
      where: {
        companyId: order.companyId,
        status: "ACTIVE",
      },
    });
    targetWarehouseId = defaultWh?.id;
  }

  if (!targetWarehouseId) {
    return { available: true, shortages: [], message: "No warehouse specified for stock tracking." };
  }

  const ingredientTotals = {};

  for (const item of order.items) {
    const recipe = item.menuItem.recipe;
    if (recipe && recipe.ingredients) {
      for (const ing of recipe.ingredients) {
        const requiredQty = ing.quantity * item.quantity;
        if (!ingredientTotals[ing.productId]) {
          ingredientTotals[ing.productId] = {
            productId: ing.productId,
            productName: ing.product.name,
            required: 0,
            unit: ing.unit || ing.product.stockUnit || "unit",
          };
        }
        ingredientTotals[ing.productId].required += requiredQty;
      }
    }
  }

  const shortages = [];

  for (const prodId of Object.keys(ingredientTotals)) {
    const info = ingredientTotals[prodId];
    const inventory = await prisma.inventory.findFirst({
      where: {
        productId: prodId,
        warehouseId: targetWarehouseId,
      },
    });

    const currentQty = inventory ? parseFloat(inventory.quantity) : 0;
    if (currentQty < info.required) {
      shortages.push({
        productId: prodId,
        productName: info.productName,
        required: info.required,
        available: currentQty,
        shortage: info.required - currentQty,
        unit: info.unit,
      });
    }
  }

  return {
    available: shortages.length === 0,
    shortages,
    warehouseId: targetWarehouseId,
  };
};

export const confirmOrderAndSendKOT = async (orderId, warehouseId, allowStockOverride = false) => {
  return await prisma.$transaction(async (tx) => {
    const order = await tx.restaurantOrder.findUnique({
      where: { id: orderId },
      include: {
        restaurant: true,
        table: true,
        items: {
          include: {
            menuItem: {
              include: {
                recipe: {
                  include: {
                    ingredients: {
                      include: {
                        product: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!order) throw new Error("Order not found.");

    if (order.orderType === "DINE_IN" && (!order.tableId || !order.table)) {
      const err = new Error("Table selection is required before sending an order to the kitchen.");
      err.statusCode = 400;
      throw err;
    }

    if (order.table && order.restaurantId && order.table.restaurantId && order.table.restaurantId !== order.restaurantId) {
      const err = new Error("The selected table does not belong to the active restaurant outlet.");
      err.statusCode = 400;
      throw err;
    }

    let targetWarehouseId = warehouseId;
    if (!targetWarehouseId) {
      const defaultWh = await tx.warehouse.findFirst({
        where: {
          companyId: order.companyId,
          status: "ACTIVE",
        },
      });
      targetWarehouseId = defaultWh?.id;
    }

    // Check stock availability
    if (targetWarehouseId && !allowStockOverride) {
      const ingredientTotals = {};
      for (const item of order.items) {
        const recipe = item.menuItem.recipe;
        if (recipe && recipe.ingredients) {
          for (const ing of recipe.ingredients) {
            const requiredQty = ing.quantity * item.quantity;
            if (!ingredientTotals[ing.productId]) {
              ingredientTotals[ing.productId] = {
                productName: ing.product.name,
                required: 0,
              };
            }
            ingredientTotals[ing.productId].required += requiredQty;
          }
        }
      }

      const shortages = [];
      for (const prodId of Object.keys(ingredientTotals)) {
        const info = ingredientTotals[prodId];
        const inventory = await tx.inventory.findFirst({
          where: { productId: prodId, warehouseId: targetWarehouseId },
        });
        const currentStock = inventory ? parseFloat(inventory.quantity) : 0;
        if (currentStock < info.required) {
          shortages.push(`${info.productName}: Required ${info.required}, Available ${currentStock}`);
        }
      }

      if (shortages.length > 0) {
        throw new Error(`Insufficient stock for preparation: ${shortages.join("; ")}`);
      }
    }

    // Update order status
    const updatedOrder = await tx.restaurantOrder.update({
      where: { id: orderId },
      data: { status: "CONFIRMED" },
    });

    // Create KOT Ticket
    const countKOT = await tx.kitchenOrder.count({
      where: { restaurantId: order.restaurantId },
    });
    const kotNumber = `KOT-${(countKOT + 1).toString().padStart(4, "0")}`;

    const kot = await tx.kitchenOrder.create({
      data: {
        restaurantId: order.restaurantId,
        orderId: order.id,
        kotNumber,
        tableNumber: order.table?.tableNumber || null,
        orderType: order.orderType,
        status: "NEW",
        notes: order.notes,
        items: {
          create: order.items.map((item) => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            notes: item.notes,
            modifiers: item.modifiers,
            status: "NEW",
          })),
        },
      },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
      },
    });

    if (order.orderType === "DINE_IN" && order.tableId) {
      await tx.restaurantTable.update({
        where: { id: order.tableId },
        data: { status: "OCCUPIED" },
      });
    }

    return { order: updatedOrder, kot };
  });
};

export const completeOrderAndPay = async (orderId, paymentData) => {
  return await prisma.$transaction(async (tx) => {
    const order = await tx.restaurantOrder.findUnique({
      where: { id: orderId },
      include: {
        table: true,
        items: true,
        payments: true,
      },
    });

    if (!order) throw new Error("Order not found.");

    if (order.status === "COMPLETED") {
      const existingPay = order.payments?.[0];
      return { order, payment: existingPay, alreadyCompleted: true };
    }

    const existingPaid = order.payments?.find((p) => p.status === "PAID");
    let payment = existingPaid || null;

    if (!payment && paymentData) {
      const payNumber = paymentData.paymentNumber || `PAY-RST-${Date.now().toString().slice(-6)}`;
      payment = await tx.payment.create({
        data: {
          companyId: order.companyId,
          branchId: order.branchId,
          customerId: order.customerId,
          restaurantOrderId: order.id,
          paymentNumber: payNumber,
          paymentDate: new Date(),
          amount: parseFloat(paymentData.amount || order.totalAmount),
          method: paymentData.method || "CASH",
          referenceNumber: paymentData.referenceNumber || null,
          status: "PAID",
          notes: paymentData.notes || `Payment for Restaurant Order ${order.orderNumber}`,
        },
      });
    }

    const updatedOrder = await tx.restaurantOrder.update({
      where: { id: orderId },
      data: { status: "COMPLETED" },
    });

    if (order.tableId && order.orderType === "DINE_IN") {
      await tx.restaurantTable.update({
        where: { id: order.tableId },
        data: { status: "AVAILABLE" },
      });
    }

    return { order: updatedOrder, payment };
  });
};

export const cancelOrder = async (orderId, reason) => {
  return await prisma.$transaction(async (tx) => {
    const order = await tx.restaurantOrder.findUnique({
      where: { id: orderId },
    });

    if (!order) throw new Error("Order not found.");

    const updatedOrder = await tx.restaurantOrder.update({
      where: { id: orderId },
      data: {
        status: "CANCELLED",
        notes: order.notes ? `${order.notes} | Cancelled: ${reason}` : `Cancelled: ${reason}`,
      },
    });

    if (order.tableId && order.orderType === "DINE_IN") {
      await tx.restaurantTable.update({
        where: { id: order.tableId },
        data: { status: "AVAILABLE" },
      });
    }

    await tx.kitchenOrder.updateMany({
      where: { orderId: order.id },
      data: { status: "CANCELLED" },
    });

    return updatedOrder;
  });
};
