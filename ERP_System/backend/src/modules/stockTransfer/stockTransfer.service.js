import prisma from "../../config/prisma.js";
import * as stockTransferRepository from "./stockTransfer.repository.js";
import * as warehouseRepository from "../warehouse/warehouse.repository.js";
import * as productRepository from "../products/product.repository.js";

export const createStockTransfer = async (data) => {

  const existingTransfer =
    await stockTransferRepository.getStockTransferByTransferNo(
      data.transferNo
    );

  if (existingTransfer) {
    throw new Error("Transfer number already exists.");
  }

  const fromWarehouse = await warehouseRepository.getWarehouseById(
    data.fromWarehouseId
  );

  if (!fromWarehouse) {
    throw new Error("Source warehouse not found.");
  }

  const toWarehouse = await warehouseRepository.getWarehouseById(
    data.toWarehouseId
  );

  if (!toWarehouse) {
    throw new Error("Destination warehouse not found.");
  }
  if (data.fromWarehouseId === data.toWarehouseId) {
    throw new Error("Source and destination warehouses cannot be the same.");
  }

  return await prisma.$transaction(async (tx) => {
    const transfer = await tx.stockTransfer.create({
      data: {
        transferNo: data.transferNo,
        fromWarehouseId: data.fromWarehouseId,
        toWarehouseId: data.toWarehouseId,
        transferDate: data.transferDate,
        status: data.status,
        reason: data.reason,
        remarks: data.remarks,
        approvedBy: data.approvedBy,
      },
    });

    for (const item of data.items) {
      const product = await productRepository.getProductById(
        item.productId
      );

      if (!product) {
        throw new Error("Product not found.");
      }
      const sourceInventory = await tx.inventory.findFirst({
        where: {
          productId: item.productId,
          warehouseId: data.fromWarehouseId,
        },
      });

      if (!sourceInventory) {
        throw new Error("Product not available in source warehouse.");
      }

      const itemQty = parseInt(item.quantity);
      if (sourceInventory.quantity < itemQty) {
        throw new Error("Insufficient stock.");
      }

      await tx.stockTransferItem.create({
        data: {
          stockTransferId: transfer.id,
          productId: item.productId,
          quantity: itemQty,
        },
      });

      await tx.inventory.update({
        where: {
          id: sourceInventory.id,
        },
        data: {
          quantity: sourceInventory.quantity - itemQty,
        },
      });

      const destinationInventory = await tx.inventory.findFirst({
        where: {
          productId: item.productId,
          warehouseId: data.toWarehouseId,
        },
      });

      if (destinationInventory) {
        await tx.inventory.update({
          where: {
            id: destinationInventory.id,
          },
          data: {
            quantity: destinationInventory.quantity + itemQty,
          },
        });
      } else {
        await tx.inventory.create({
          data: {
            productId: item.productId,
            warehouseId: data.toWarehouseId,
            quantity: itemQty,
          },
        });
      }

      await tx.stockMovement.create({
        data: {
          productId: item.productId,
          warehouseId: data.fromWarehouseId,
          type: "TRANSFER_OUT",
          quantity: itemQty,
          referenceNo: data.transferNo,
          remarks: data.remarks,
        },
      });

      await tx.stockMovement.create({
        data: {
          productId: item.productId,
          warehouseId: data.toWarehouseId,
          type: "TRANSFER_IN",
          quantity: itemQty,
          referenceNo: data.transferNo,
          remarks: data.remarks,
        },
      });
    }

    return transfer;
  });
};

export const getAllStockTransfers = async () => {
  return await stockTransferRepository.getAllStockTransfers();
};

export const getStockTransferById = async (id) => {
  const transfer = await stockTransferRepository.getStockTransferById(id);

  if (!transfer) {
    throw new Error("Stock transfer not found.");
  }

  return transfer;
};

export const updateStockTransfer = async (id, data) => {
  const transfer = await stockTransferRepository.getStockTransferById(id);

  if (!transfer) {
    throw new Error("Stock transfer not found.");
  }

  return await stockTransferRepository.updateStockTransfer(id, data);
};

export const deleteStockTransfer = async (id) => {
  const transfer = await stockTransferRepository.getStockTransferById(id);

  if (!transfer) {
    throw new Error("Stock transfer not found.");
  }

  return await stockTransferRepository.deleteStockTransfer(id);
};