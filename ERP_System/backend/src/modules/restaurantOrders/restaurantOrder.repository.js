import prisma from "../../config/prisma.js";

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

    const order = await tx.restaurantOrder.create({
      data: {
        ...orderData,
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
  const { restaurantId, branchId, companyId, tableId, status, orderType } = params;
  const where = {};

  if (restaurantId) where.restaurantId = restaurantId;
  if (branchId) where.branchId = branchId;
  if (companyId) where.companyId = companyId;
  if (tableId) where.tableId = tableId;
  if (status) where.status = status;
  if (orderType) where.orderType = orderType;

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

    return await tx.restaurantOrder.update({
      where: { id },
      data: orderData,
      include: orderInclude,
    });
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

    // Consume recipe inventory and log StockMovement
    if (targetWarehouseId) {
      for (const item of order.items) {
        const recipe = item.menuItem.recipe;
        if (recipe && recipe.ingredients) {
          for (const ing of recipe.ingredients) {
            const requiredQty = ing.quantity * item.quantity;

            const existingInventory = await tx.inventory.findFirst({
              where: {
                productId: ing.productId,
                warehouseId: targetWarehouseId,
              },
            });

            if (existingInventory) {
              const currentStock = parseFloat(existingInventory.quantity);
              await tx.inventory.update({
                where: { id: existingInventory.id },
                data: {
                  quantity: currentStock - requiredQty,
                },
              });
            } else {
              await tx.inventory.create({
                data: {
                  productId: ing.productId,
                  warehouseId: targetWarehouseId,
                  quantity: -requiredQty,
                },
              });
            }

            await tx.stockMovement.create({
              data: {
                companyId: order.companyId,
                productId: ing.productId,
                warehouseId: targetWarehouseId,
                type: "RECIPE_CONSUMPTION",
                quantity: -requiredQty,
                referenceNo: order.orderNumber,
                remarks: `Consumed for KOT ${kotNumber} - ${item.menuItem.name} x${item.quantity}`,
              },
            });
          }
        }
      }
    }

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
      },
    });

    if (!order) throw new Error("Order not found.");

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

    let payment = null;
    if (paymentData) {
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
