import prisma from "../config/prisma.js";

export async function migrateBatches() {
  console.log("Starting Product Batch schema & data migration...");

  try {
    // 1. Ensure product_batches table exists via raw SQL if prisma push hasn't run yet
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "product_batches" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "productId" TEXT NOT NULL,
        "batch_number" VARCHAR(100) NOT NULL,
        "mrp" DECIMAL(18, 2) NOT NULL,
        "purchase_price" DECIMAL(18, 2) NOT NULL,
        "selling_price" DECIMAL(18, 2) NOT NULL,
        "quantity" INTEGER NOT NULL DEFAULT 0,
        "expiry_date" TIMESTAMP(3),
        "company_id" TEXT,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "product_batches_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `).catch((err) => {
      console.log("Notice: Table creation / existence check:", err.message);
    });

    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "product_batches_productId_batch_number_key" ON "product_batches"("productId", "batch_number");
    `).catch(() => {});

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "product_batches_productId_idx" ON "product_batches"("productId");
    `).catch(() => {});

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "product_batches_company_id_idx" ON "product_batches"("company_id");
    `).catch(() => {});

    // Ensure columns on other models exist
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "purchase_items" ADD COLUMN IF NOT EXISTS "batch_number" VARCHAR(100);
      ALTER TABLE "purchase_items" ADD COLUMN IF NOT EXISTS "batch_id" TEXT;
      ALTER TABLE "purchase_items" ADD COLUMN IF NOT EXISTS "mrp" DECIMAL(18, 2);
      ALTER TABLE "purchase_items" ADD COLUMN IF NOT EXISTS "expiry_date" TIMESTAMP(3);
      ALTER TABLE "stock_movements" ADD COLUMN IF NOT EXISTS "batch_number" VARCHAR(100);
      ALTER TABLE "stock_movements" ADD COLUMN IF NOT EXISTS "batch_id" TEXT;
      ALTER TABLE "invoice_items" ADD COLUMN IF NOT EXISTS "batch_number" VARCHAR(100);
      ALTER TABLE "invoice_items" ADD COLUMN IF NOT EXISTS "batch_id" TEXT;
    `).catch((err) => {
      console.log("Notice: Column additions:", err.message);
    });

    // 2. Fetch all products and inspect batches
    const products = await prisma.product.findMany({
      include: {
        batches: true,
        inventories: true,
      },
    });

    console.log(`Found ${products.length} products to check for batch migration.`);

    let migratedCount = 0;

    for (const product of products) {
      if (!product.batches || product.batches.length === 0) {
        const invSum = product.inventories?.reduce(
          (sum, inv) => sum + (Number(inv.quantity) || 0),
          0
        ) || 0;

        const qty = Math.max(0, Math.floor(Number(product.initialStock || 0) || invSum));
        const costPrice = Number(product.costPrice || 0);
        const sellingPrice = Number(product.sellingPrice || 0);
        const retailPrice = Number(product.retailPrice || 0);
        const mrp = Math.max(sellingPrice, retailPrice > 0 ? retailPrice : sellingPrice);

        await prisma.productBatch.create({
          data: {
            productId: product.id,
            batchNumber: "BATCH-001",
            mrp: mrp > 0 ? mrp : 10,
            purchasePrice: costPrice > 0 ? costPrice : 0,
            sellingPrice: sellingPrice > 0 ? sellingPrice : mrp,
            quantity: qty,
            expiryDate: null,
            companyId: product.companyId || null,
          },
        });

        migratedCount++;
      }
    }

    console.log(`Successfully migrated ${migratedCount} products with initial default batches.`);
    return { success: true, migratedCount };
  } catch (error) {
    console.error("Migration error:", error);
    throw error;
  }
}

// Auto-run if executed directly
if (process.argv[1]?.endsWith("migrate_batches.js")) {
  migrateBatches()
    .then(() => {
      console.log("Migration finished.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("Migration failed:", err);
      process.exit(1);
    });
}
