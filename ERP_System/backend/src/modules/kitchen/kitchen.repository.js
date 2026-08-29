import prisma from "../../config/prisma.js";
import { processStockDeductionOnServed } from "../restaurantOrders/restaurantOrder.repository.js";
import { emitOrderStatusUpdate } from "../../config/socket.js";

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
  if (restaurantId && restaurantId !== "ALL" && restaurantId.trim() !== "") {
    where.restaurantId = restaurantId;
  }

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
  const kot = await prisma.$transaction(async (tx) => {
    const updatedKot = await tx.kitchenOrder.update({
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
        where: { id: updatedKot.orderId },
        data: { status: targetOrderStatus },
      });

      await tx.restaurantOrderItem.updateMany({
        where: { orderId: updatedKot.orderId },
        data: { status: targetOrderItemsStatus },
      });

      if (targetOrderStatus === "SERVED") {
        await processStockDeductionOnServed(updatedKot.orderId, tx);
      }
    }

    return updatedKot;
  });

  if (kot?.orderId) {
    try {
      const fullOrder = await prisma.restaurantOrder.findUnique({
        where: { id: kot.orderId },
        include: {
          restaurant: true,
          table: { include: { area: true } },
          customer: true,
          items: { include: { menuItem: true } },
        },
      });
      if (fullOrder) {
        emitOrderStatusUpdate({ ...fullOrder, kot });
      }
    } catch (emitErr) {
      console.error("Failed to emit socket event after KOT update:", emitErr);
    }
  }

  return kot;
};
