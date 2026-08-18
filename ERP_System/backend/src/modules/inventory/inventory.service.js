import * as inventoryRepository from "./inventory.repository.js";
import * as productRepository from "../products/product.repository.js";
import * as warehouseRepository from "../warehouse/warehouse.repository.js";


export const createInventory = async (data) => {
  
    const product = await productRepository.getProductById(data.productId);

  if (!product) {
    throw new Error("Product not found.");
  }

  const warehouse = await warehouseRepository.getWarehouseById(
    data.warehouseId
  );

  if (!warehouse) {
    throw new Error("Warehouse not found.");
  }

  const existingInventory =
    await inventoryRepository.getInventoryByProductAndWarehouse(
      data.productId,
      data.warehouseId
    );

  if (existingInventory) {
    throw new Error("Inventory already exists for this product and warehouse.");
  }

  return await inventoryRepository.createInventory(data);
};

export const getAllInventories = async () => {
  return await inventoryRepository.getAllInventories();
};

export const getInventoryById = async (id) => {
  const inventory = await inventoryRepository.getInventoryById(id);

  if (!inventory) {
    throw new Error("Inventory not found.");
  }

  return inventory;
};

export const getInventoryByProduct = async (productId) => {
  return await inventoryRepository.getInventoryByProduct(productId);
};

export const getInventoryByWarehouse = async (warehouseId) => {
  return await inventoryRepository.getInventoryByWarehouse(warehouseId);
};

export const updateInventory = async (id, data) => {
  const inventory = await inventoryRepository.getInventoryById(id);

  if (!inventory) {
    throw new Error("Inventory not found.");
  }

  return await inventoryRepository.updateInventory(id, data);
};

export const deleteInventory = async (id) => {
  const inventory = await inventoryRepository.getInventoryById(id);

  if (!inventory) {
    throw new Error("Inventory not found.");
  }

  return await inventoryRepository.deleteInventory(id);
};