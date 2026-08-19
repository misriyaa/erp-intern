import prisma from "../../config/prisma.js";
import * as purchaseRepository from "./purchase.repository.js";
import * as supplierRepository from "../suppliers/supplier.repository.js";
import * as warehouseRepository from "../warehouse/warehouse.repository.js";
import * as productRepository from "../products/product.repository.js";

export const createPurchase = async (data) => {
  const supplier = await supplierRepository.getSupplierById(data.supplierId);

  if (!supplier) {
    throw new Error("Supplier not found.");
  }

  const warehouse = await warehouseRepository.getWarehouseById(
    data.warehouseId
  );

  if (!warehouse) {
    throw new Error("Warehouse not found.");
  }

  const existingPurchase =
    await purchaseRepository.getPurchaseByNumber(data.purchaseNo);

  if (existingPurchase) {
    throw new Error("Purchase number already exists.");
  }

  return await prisma.$transaction(async (tx) => {
    const purchase = await tx.purchase.create({
      data: {
        purchaseNo: data.purchaseNo,
        supplierId: data.supplierId,
        warehouseId: data.warehouseId,
        purchaseDate: data.purchaseDate,
        totalAmount: data.totalAmount,
        status: data.status,
        notes: data.notes,
      },
    });

    for (const item of data.items) {
      const product = await productRepository.getProductById(item.productId);

      if (!product) {
        throw new Error("Product not found.");
      }

      await tx.purchaseItem.create({
        data: {
          purchaseId: purchase.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
        },
      });

      const inventory = await tx.inventory.findFirst({
        where: {
          productId: item.productId,
          warehouseId: data.warehouseId,
        },
      });

      if (inventory) {
        await tx.inventory.update({
          where: {
            id: inventory.id,
          },
          data: {
            quantity: inventory.quantity + item.quantity,
          },
        });
      } else {
        await tx.inventory.create({
          data: {
            productId: item.productId,
            warehouseId: data.warehouseId,
            quantity: item.quantity,
          },
        });
      }

      await tx.stockMovement.create({
        data: {
          productId: item.productId,
          warehouseId: data.warehouseId,
          type: "PURCHASE",
          quantity: item.quantity,
          referenceNo: data.purchaseNo,
          remarks: data.notes,
        },
      });
    }

    return purchase;
  });
};

export const getAllPurchases = async () => {
  return await purchaseRepository.getAllPurchases();
};

export const getPurchaseById = async (id) => {
  const purchase = await purchaseRepository.getPurchaseById(id);

  if (!purchase) {
    throw new Error("Purchase not found.");
  }

  return purchase;
};

export const updatePurchase = async (id, data) => {
  const purchase = await purchaseRepository.getPurchaseById(id);

  if (!purchase) {
    throw new Error("Purchase not found.");
  }

  return await purchaseRepository.updatePurchase(id, data);
};

export const deletePurchase = async (id) => {
  const purchase = await purchaseRepository.getPurchaseById(id);

  if (!purchase) {
    throw new Error("Purchase not found.");
  }

  return await purchaseRepository.deletePurchase(id);
};