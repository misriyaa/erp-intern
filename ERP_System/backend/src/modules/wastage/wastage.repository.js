import prisma from "../../config/prisma.js";

export const createWastage = async (data) => {
  const { items, ...wastageData } = data;

  const wastageNumber = wastageData.wastageNumber || `WST-${Date.now().toString().slice(-6)}`;

  return await prisma.$transaction(async (tx) => {
    let totalCost = 0;
    const formattedItems = [];

    if (items && items.length > 0) {
      for (const item of items) {
        const qty = parseFloat(item.quantity) || 1;
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        const unitCost = parseFloat(item.unitCost) || (product ? parseFloat(product.costPrice) : 0);
        const itemTotal = unitCost * qty;
        totalCost += itemTotal;

        formattedItems.push({
          productId: item.productId,
          quantity: qty,
          unitCost,
          totalCost: itemTotal,
          reason: item.reason || wastageData.reason || "SPOILED",
        });

        // Reduce inventory if warehouseId is provided
        if (wastageData.warehouseId) {
          const inventory = await tx.inventory.findFirst({
            where: {
              productId: item.productId,
              warehouseId: wastageData.warehouseId,
            },
          });

          if (inventory) {
            await tx.inventory.update({
              where: { id: inventory.id },
              data: {
                quantity: parseFloat(inventory.quantity) - qty,
              },
            });
          }

          // Create stock movement record
          await tx.stockMovement.create({
            data: {
              companyId: wastageData.companyId,
              productId: item.productId,
              warehouseId: wastageData.warehouseId,
              type: "WASTAGE",
              quantity: -qty,
              referenceNo: wastageNumber,
              remarks: `Wastage (${item.reason || wastageData.reason || "SPOILED"}): ${wastageData.notes || ""}`,
            },
          });
        }
      }
    }

    const wastage = await tx.wastage.create({
      data: {
        ...wastageData,
        wastageNumber,
        totalCost,
        items: {
          create: formattedItems,
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        restaurant: true,
        warehouse: true,
      },
    });

    return wastage;
  });
};

export const getWastages = async (params) => {
  const { companyId, restaurantId, warehouseId } = params;
  const where = {};

  if (companyId) where.companyId = companyId;
  if (restaurantId) where.restaurantId = restaurantId;
  if (warehouseId) where.warehouseId = warehouseId;

  return await prisma.wastage.findMany({
    where,
    include: {
      items: {
        include: {
          product: true,
        },
      },
      restaurant: true,
      warehouse: true,
    },
    orderBy: { wastageDate: "desc" },
  });
};

export const getWastageById = async (id) => {
  return await prisma.wastage.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: true,
        },
      },
      restaurant: true,
      warehouse: true,
    },
  });
};

export const deleteWastage = async (id) => {
  return await prisma.wastage.delete({
    where: { id },
  });
};
