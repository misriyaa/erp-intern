import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Restaurant ERP Test Data...");

  // 1. Get or create test Company & Branch
  let company = await prisma.company.findFirst();
  if (!company) {
    let industry = await prisma.industry.findFirst();
    if (!industry) {
      industry = await prisma.industry.create({
        data: { name: "Retail & Restaurant", code: "RESTAURANT" },
      });
    }
    company = await prisma.company.create({
      data: {
        name: "Grand Enterprise ERP",
        industryId: industry.id,
      },
    });
  }

  let branch = await prisma.branch.findFirst({
    where: { companyId: company.id },
  });
  if (!branch) {
    branch = await prisma.branch.create({
      data: {
        name: "Main City Branch",
        code: "BR-01",
        companyId: company.id,
      },
    });
  }

  // 2. Create Restaurant
  let restaurant = await prisma.restaurant.findFirst({
    where: { branchId: branch.id },
  });
  if (!restaurant) {
    restaurant = await prisma.restaurant.create({
      data: {
        name: "The Royal Dining Restaurant",
        code: "RST-01",
        companyId: company.id,
        branchId: branch.id,
      },
    });
  }

  // 3. Create Areas
  let areaGround = await prisma.restaurantArea.findFirst({
    where: { restaurantId: restaurant.id, name: "Ground Floor" },
  });
  if (!areaGround) {
    areaGround = await prisma.restaurantArea.create({
      data: {
        name: "Ground Floor",
        restaurantId: restaurant.id,
        sortOrder: 1,
      },
    });
  }

  let areaFirst = await prisma.restaurantArea.findFirst({
    where: { restaurantId: restaurant.id, name: "First Floor" },
  });
  if (!areaFirst) {
    areaFirst = await prisma.restaurantArea.create({
      data: {
        name: "First Floor",
        restaurantId: restaurant.id,
        sortOrder: 2,
      },
    });
  }

  // 4. Create Tables
  const tableNumbers = ["Table 1", "Table 2", "Table 3", "Table 4", "Table 5"];
  for (const num of tableNumbers) {
    const existing = await prisma.restaurantTable.findFirst({
      where: { restaurantId: restaurant.id, tableNumber: num },
    });
    if (!existing) {
      await prisma.restaurantTable.create({
        data: {
          restaurantId: restaurant.id,
          areaId: num.includes("5") ? areaFirst.id : areaGround.id,
          tableNumber: num,
          capacity: num.includes("5") ? 6 : 4,
          status: "AVAILABLE",
        },
      });
    }
  }

  // 5. Create Units & Category for Raw Materials
  let unitKg = await prisma.unit.findFirst({ where: { name: "Kilogram" } });
  if (!unitKg) {
    unitKg = await prisma.unit.create({
      data: { name: "Kilogram", code: "KG", companyId: company.id },
    });
  }

  let unitLitre = await prisma.unit.findFirst({ where: { name: "Litre" } });
  if (!unitLitre) {
    unitLitre = await prisma.unit.create({
      data: { name: "Litre", code: "L", companyId: company.id },
    });
  }

  let rawCategory = await prisma.category.findFirst({ where: { name: "Raw Ingredients" } });
  if (!rawCategory) {
    rawCategory = await prisma.category.create({
      data: { name: "Raw Ingredients", code: "RAW-01", companyId: company.id },
    });
  }

  // 6. Create Raw Material Products
  const rawMaterialsData = [
    { name: "Basmati Rice", sku: "RAW-RICE", unitId: unitKg.id, costPrice: 80, stockUnit: "KG" },
    { name: "Fresh Chicken", sku: "RAW-CHICKEN", unitId: unitKg.id, costPrice: 220, stockUnit: "KG" },
    { name: "Onion", sku: "RAW-ONION", unitId: unitKg.id, costPrice: 30, stockUnit: "KG" },
    { name: "Cooking Oil", sku: "RAW-OIL", unitId: unitLitre.id, costPrice: 150, stockUnit: "L" },
    { name: "Biryani Spices", sku: "RAW-SPICES", unitId: unitKg.id, costPrice: 400, stockUnit: "KG" },
  ];

  const createdProducts = {};
  for (const item of rawMaterialsData) {
    let prod = await prisma.product.findFirst({ where: { sku: item.sku } });
    if (!prod) {
      prod = await prisma.product.create({
        data: {
          name: item.name,
          sku: item.sku,
          productType: "RAW_MATERIAL",
          unitId: item.unitId,
          categoryId: rawCategory.id,
          costPrice: item.costPrice,
          sellingPrice: item.costPrice,
          companyId: company.id,
          stockUnit: item.stockUnit,
        },
      });
    }
    createdProducts[item.sku] = prod;
  }

  // 7. Create Warehouse & Add Stock
  let warehouse = await prisma.warehouse.findFirst({ where: { companyId: company.id } });
  if (!warehouse) {
    warehouse = await prisma.warehouse.create({
      data: {
        name: "Restaurant Kitchen Warehouse",
        code: "KITCHEN-WH",
        companyId: company.id,
      },
    });
  }

  for (const sku of Object.keys(createdProducts)) {
    const prod = createdProducts[sku];
    const existingInv = await prisma.inventory.findFirst({
      where: { productId: prod.id, warehouseId: warehouse.id },
    });
    if (!existingInv) {
      await prisma.inventory.create({
        data: {
          productId: prod.id,
          warehouseId: warehouse.id,
          quantity: 500, // 500 KG / Litres initial stock
        },
      });
    }
  }

  // 8. Create Menu Category & Menu Item
  let biryaniCategory = await prisma.menuCategory.findFirst({
    where: { restaurantId: restaurant.id, name: "Biryani Special" },
  });
  if (!biryaniCategory) {
    biryaniCategory = await prisma.menuCategory.create({
      data: {
        name: "Biryani Special",
        restaurantId: restaurant.id,
        sortOrder: 1,
      },
    });
  }

  let chickenBiryani = await prisma.menuItem.findFirst({
    where: { restaurantId: restaurant.id, name: "Chicken Biryani" },
  });
  if (!chickenBiryani) {
    chickenBiryani = await prisma.menuItem.create({
      data: {
        name: "Chicken Biryani",
        restaurantId: restaurant.id,
        categoryId: biryaniCategory.id,
        sellingPrice: 180.00,
        costPrice: 90.00,
        description: "Aromatic Hyderabadi dum biryani cooked with spices and chicken.",
      },
    });
  }

  // 9. Create Recipe (BOM) for Chicken Biryani
  // Rice 0.250kg (250g), Chicken 0.200kg (200g), Onion 0.050kg (50g), Oil 0.020L (20ml), Spices 0.010kg (10g)
  let recipe = await prisma.recipe.findUnique({
    where: { menuItemId: chickenBiryani.id },
  });

  if (!recipe) {
    recipe = await prisma.recipe.create({
      data: {
        menuItemId: chickenBiryani.id,
        name: "Chicken Biryani Standard Portion Recipe",
        yieldQuantity: 1,
        totalCost: 90.00,
        ingredients: {
          create: [
            { productId: createdProducts["RAW-RICE"].id, quantity: 0.250, unit: "KG", cost: 20.00 },
            { productId: createdProducts["RAW-CHICKEN"].id, quantity: 0.200, unit: "KG", cost: 44.00 },
            { productId: createdProducts["RAW-ONION"].id, quantity: 0.050, unit: "KG", cost: 1.50 },
            { productId: createdProducts["RAW-OIL"].id, quantity: 0.020, unit: "L", cost: 3.00 },
            { productId: createdProducts["RAW-SPICES"].id, quantity: 0.010, unit: "KG", cost: 4.00 },
          ],
        },
      },
    });
  }

  console.log("✅ Restaurant ERP Test Data Seeded Successfully!");
}

main()
  .catch((e) => {
    console.error("Error seeding restaurant data:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
