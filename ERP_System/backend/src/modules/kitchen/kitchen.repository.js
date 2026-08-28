import prisma from "../../config/prisma.js";
import { processStockDeductionOnServed } from "../restaurantOrders/restaurantOrder.repository.js";

const kotInclude = {
  restaurant: true,
  order: {
    include: {
      table: {
        include: {
          area: true,
        },
      },
      customer: true,
    },
  },
  items: {
    include: {
      menuItem: true,
    },
  },
};

export const getKitchenOrders = async (restaurantId, status) => {
  const where = {};
  if (restaurantId) where.restaurantId = restaurantId;

  if (status) {
    where.status = status;
  } else {
    where.status = {
      in: ["NEW", "PREPARING", "READY"],
    };
  }

  return await prisma.kitchenOrder.findMany({
    where,
    include: kotInclude,
    orderBy: { createdAt: "asc" },
  });
};

export const getKitchenOrderById = async (id) => {
  return await prisma.kitchenOrder.findUnique({
    where: { id },
    include: kotInclude,
  });
};

export const updateKOTStatus = async (id, status) => {
  return await prisma.$transaction(async (tx) => {
    const kot = await tx.kitchenOrder.update({
      where: { id },
      data: { status },
      include: kotInclude,
    });

    let targetOrderItemsStatus = "PENDING";
    let targetOrderStatus = null;

    if (status === "PREPARING") {
      targetOrderItemsStatus = "PREPARING";
      targetOrderStatus = "PREPARING";
    } else if (status === "READY") {
      targetOrderItemsStatus = "READY";
      targetOrderStatus = "READY";
    } else if (status === "SERVED") {
      targetOrderItemsStatus = "SERVED";
      targetOrderStatus = "SERVED";
    }

    if (targetOrderStatus) {
      await tx.restaurantOrder.update({
        where: { id: kot.orderId },
        data: { status: targetOrderStatus },
      });

      await tx.restaurantOrderItem.updateMany({
        where: { orderId: kot.orderId },
        data: { status: targetOrderItemsStatus },
      });

      if (targetOrderStatus === "SERVED") {
        await processStockDeductionOnServed(kot.orderId, tx);
      }
    }

    return kot;
  });
};
