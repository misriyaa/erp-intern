import prisma from "../config/prisma.js";
import { migrateBatches } from "./migrate_batches.js";
import * as productService from "../modules/products/product.service.js";
import * as batchService from "../modules/batches/batch.service.js";
import * as salesService from "../modules/sales/sales.service.js";

async function runAcceptanceTest() {
  console.log("=== STARTING BATCH-WISE MULTI-MRP ACCEPTANCE TEST ===");

  try {
    // Step 1: Ensure database schema & migration
    console.log("\n[1/5] Ensuring database schema and migrations...");
    await migrateBatches();

    // Step 2: Get or create Category & Unit
    let category = await prisma.category.findFirst();
    if (!category) {
      category = await prisma.category.create({
        data: { name: "Beverages", code: "BEV" },
      });
    }

    let unit = await prisma.unit.findFirst();
    if (!unit) {
      unit = await prisma.unit.create({
        data: { name: "Piece", code: "PCS" },
      });
    }

    // Clean up any previous test product with SKU COKE-1L
    const existingCoke = await prisma.product.findFirst({
      where: { sku: "COKE-1L" },
    });
    if (existingCoke) {
      console.log("Cleaning up previous test product...");
      await prisma.product.delete({ where: { id: existingCoke.id } });
    }

    // Step 3: Create Product "Coca-Cola 1L" with initial Batch "COKE001"
    console.log("\n[2/5] Creating Product: Coca-Cola 1L with Batch COKE001...");
    const createdProduct = await productService.createProduct({
      name: "Coca-Cola 1L",
      sku: "COKE-1L",
      productType: "RETAIL",
      categoryId: category.id,
      unitId: unit.id,
      costPrice: 50.0,
      sellingPrice: 60.0,
      initialStock: 100,
      batchNumber: "COKE001",
      mrp: 60.0,
      purchasePrice: 50.0,
      isBatchTracking: true,
    });
    console.log(`Product created with ID: ${createdProduct.id}`);

    // Step 4: Add Batch "COKE002" with MRP ₹65
    console.log("\n[3/5] Adding Batch COKE002 (MRP ₹65, Stock 80)...");
    const batch2 = await batchService.createProductBatch(createdProduct.id, {
      batchNumber: "COKE002",
      mrp: 65.0,
      purchasePrice: 54.0,
      sellingPrice: 65.0,
      quantity: 80,
    });
    console.log(`Batch 2 created with ID: ${batch2.id}`);

    // Step 5: Verify Product metrics
    console.log("\n[4/5] Verifying aggregated product metrics...");
    const productDetails = await productService.getProductById(createdProduct.id);
    console.log(`Product Name: ${productDetails.name}`);
    console.log(`Total Stock: ${productDetails.totalStock}`);
    console.log(`Batch Count: ${productDetails.batchCount}`);
    console.log(`MRP Range: ${productDetails.mrpRange}`);
    console.log("Batches in inventory:");
    productDetails.batches.forEach((b) => {
      console.log(`  ├── Batch ${b.batchNumber} → MRP ₹${Number(b.mrp).toFixed(2)} → Selling Price ₹${Number(b.sellingPrice).toFixed(2)} → Stock ${b.quantity}`);
    });

    if (productDetails.totalStock !== 180) {
      throw new Error(`Expected total stock 180, got ${productDetails.totalStock}`);
    }
    if (productDetails.batchCount !== 2) {
      throw new Error(`Expected batch count 2, got ${productDetails.batchCount}`);
    }

    // Step 6: Process POS Sale of 10 units from COKE001
    console.log("\n[5/5] Testing POS checkout: Selling 10 units from Batch COKE001...");
    const batch1 = productDetails.batches.find((b) => b.batchNumber === "COKE001");
    if (!batch1) throw new Error("COKE001 not found");

    const saleResult = await salesService.createSale({
      orderNumber: `SO-TEST-${Date.now()}`,
      orderDate: new Date(),
      status: "COMPLETED",
      paymentMethod: "Cash",
      totalAmount: 600.0,
      netAmount: 600.0,
      taxAmount: 0,
      discountAmount: 0,
      items: [
        {
          productId: createdProduct.id,
          batchId: batch1.id,
          batchNumber: "COKE001",
          quantity: 10,
          unitPrice: 60.0,
          totalPrice: 600.0,
        },
      ],
    });
    console.log(`Sale successfully processed! Invoice ID: ${saleResult.id}`);

    // Step 7: Verify Stock deduction and batch isolation
    const refreshedDetails = await productService.getProductById(createdProduct.id);
    const refreshedB1 = refreshedDetails.batches.find((b) => b.batchNumber === "COKE001");
    const refreshedB2 = refreshedDetails.batches.find((b) => b.batchNumber === "COKE002");

    console.log("\n=== POST-SALE INVENTORY VERIFICATION ===");
    console.log(`COKE001 Stock: ${refreshedB1.quantity} (Expected: 90)`);
    console.log(`COKE002 Stock: ${refreshedB2.quantity} (Expected: 80)`);
    console.log(`Product Total Stock: ${refreshedDetails.totalStock} (Expected: 170)`);

    if (refreshedB1.quantity !== 90) {
      throw new Error(`COKE001 stock expected 90, got ${refreshedB1.quantity}`);
    }
    if (refreshedB2.quantity !== 80) {
      throw new Error(`COKE002 stock expected 80 (isolated), got ${refreshedB2.quantity}`);
    }
    if (refreshedDetails.totalStock !== 170) {
      throw new Error(`Total stock expected 170, got ${refreshedDetails.totalStock}`);
    }

    console.log("\n SUCCESS: ALL BATCH-WISE MULTI-MRP ACCEPTANCE CRITERIA PASSED!");
  } catch (err) {
    console.error("\n❌ TEST FAILED:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runAcceptanceTest();
