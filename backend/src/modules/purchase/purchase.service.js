import prisma from "../../config/prisma.js";
import * as purchaseRepository from "./purchase.repository.js";
import * as supplierRepository from "../suppliers/supplier.repository.js";
import * as warehouseRepository from "../warehouse/warehouse.repository.js";
import * as productRepository from "../products/product.repository.js";
import { emitDashboardUpdate } from "../../config/socket.js";

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

  const created = await prisma.$transaction(async (tx) => {
    const purchase = await tx.purchase.create({
      data: {
        purchaseNo: data.purchaseNo,
        supplierId: data.supplierId,
        warehouseId: data.warehouseId,
        purchaseDate: data.purchaseDate,
        totalAmount: parseFloat(data.totalAmount),
        status: data.status,
        notes: data.notes,
        companyId: data.companyId || null,
      },
    });

    for (const item of data.items) {
      const product = await productRepository.getProductById(item.productId);

      if (!product) {
        throw new Error("Product not found.");
      }

      const itemQty = parseInt(item.quantity);
      const itemUnitPrice = parseFloat(item.unitPrice);
      const itemTotalPrice = parseFloat(item.totalPrice);
      const itemMrp = item.mrp ? parseFloat(item.mrp) : null;
      const itemExpiry = item.expiryDate ? new Date(item.expiryDate) : null;
      const rawBatchNumber = (item.batchNumber || item.batch?.batchNumber || "").trim();
      const batchNum = rawBatchNumber || `BATCH-${data.purchaseNo.slice(-6)}`;

      // 1. Batch management: check if batch already exists for this product
      let batchId = null;
      const existingBatch = await tx.productBatch.findUnique({
        where: {
          productId_batchNumber: {
            productId: item.productId,
            batchNumber: batchNum,
          },
        },
      });

      if (existingBatch) {
        // YES -> Increase that batch quantity
        const updatedBatch = await tx.productBatch.update({
          where: { id: existingBatch.id },
          data: {
            quantity: { increment: itemQty },
            ...(itemMrp && itemMrp > 0 ? { mrp: itemMrp } : {}),
            ...(itemUnitPrice > 0 ? { purchasePrice: itemUnitPrice } : {}),
            ...(item.sellingPrice ? { sellingPrice: parseFloat(item.sellingPrice) } : {}),
            ...(itemExpiry ? { expiryDate: itemExpiry } : {}),
          },
        });
        batchId = updatedBatch.id;
      } else {
        // NO -> Create new batch
        const mrpVal = itemMrp && itemMrp > 0
          ? itemMrp
          : Math.max(itemUnitPrice, Number(product.retailPrice || product.sellingPrice || itemUnitPrice));

        const sellingVal = item.sellingPrice
          ? parseFloat(item.sellingPrice)
          : Math.max(itemUnitPrice, Number(product.sellingPrice || mrpVal));

        const newBatch = await tx.productBatch.create({
          data: {
            productId: item.productId,
            batchNumber: batchNum,
            mrp: mrpVal,
            purchasePrice: itemUnitPrice,
            sellingPrice: sellingVal,
            quantity: itemQty,
            expiryDate: itemExpiry,
            companyId: data.companyId || null,
          },
        });
        batchId = newBatch.id;
      }

      await tx.purchaseItem.create({
        data: {
          purchaseId: purchase.id,
          productId: item.productId,
          quantity: itemQty,
          unitPrice: itemUnitPrice,
          totalPrice: itemTotalPrice,
          batchNumber: batchNum,
          batchId,
          mrp: itemMrp,
          expiryDate: itemExpiry,
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
            quantity: { increment: itemQty },
          },
        });
      } else {
        await tx.inventory.create({
          data: {
            productId: item.productId,
            warehouseId: data.warehouseId,
            quantity: itemQty,
          },
        });
      }

      // Sync product total stock
      const allProductBatches = await tx.productBatch.findMany({
        where: { productId: item.productId },
      });
      const totalBatchStock = allProductBatches.reduce((acc, b) => acc + (b.quantity || 0), 0);
      await tx.product.update({
        where: { id: item.productId },
        data: { initialStock: totalBatchStock },
      });

      await tx.stockMovement.create({
        data: {
          productId: item.productId,
          warehouseId: data.warehouseId,
          type: "PURCHASE",
          quantity: itemQty,
          referenceNo: data.purchaseNo,
          batchNumber: batchNum,
          batchId,
          remarks: data.notes || `Stock In via PO ${data.purchaseNo} to Batch ${batchNum}`,
        },
      });
    }

    return purchase;
  });

  try {
    emitDashboardUpdate(data.companyId, "purchase.created", { purchaseId: created.id });
    emitDashboardUpdate(data.companyId, "reports.updated", { source: "purchase" });
    emitDashboardUpdate(data.companyId, "stock.updated", { warehouseId: data.warehouseId });
  } catch (err) {
    // Socket emit fallback
  }

  return created;
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

  const { items, ...updateFields } = data;

  return await prisma.$transaction(async (tx) => {
    if (items && Array.isArray(items)) {
      await tx.purchaseItem.deleteMany({
        where: { purchaseId: id },
      });

      for (const item of items) {
        if (!item.productId) continue;
        const itemQty = parseInt(item.quantity) || 1;
        const itemUnitPrice = parseFloat(item.unitPrice) || 0;
        const itemTotalPrice = parseFloat(item.totalPrice) || itemQty * itemUnitPrice;

        await tx.purchaseItem.create({
          data: {
            purchaseId: id,
            productId: item.productId,
            quantity: itemQty,
            unitPrice: itemUnitPrice,
            totalPrice: itemTotalPrice,
          },
        });
      }
    }

    const cleanData = { ...updateFields };
    if (cleanData.totalAmount !== undefined) cleanData.totalAmount = parseFloat(cleanData.totalAmount);
    if (cleanData.purchaseDate !== undefined) cleanData.purchaseDate = new Date(cleanData.purchaseDate);

    const resPurchase = await tx.purchase.update({
      where: { id },
      data: cleanData,
      include: {
        supplier: true,
        warehouse: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return resPurchase;
  });

  try {
    emitDashboardUpdate(purchase.companyId, "purchase.updated", { purchaseId: id });
    emitDashboardUpdate(purchase.companyId, "reports.updated", { source: "purchase" });
  } catch (err) {
    // Socket emit fallback
  }

  return updated;
};



export const deletePurchase = async (id) => {
  const purchase = await purchaseRepository.getPurchaseById(id);

  if (!purchase) {
    throw new Error("Purchase not found.");
  }

  return await purchaseRepository.deletePurchase(id);
};