import * as restaurantRepository from "./restaurant.repository.js";

export const createRestaurant = async (data) => {
  if (!data.name) {
    throw new Error("Restaurant name is required.");
  }
  if (!data.branchId) {
    throw new Error("Branch ID is required.");
  }
  return await restaurantRepository.createRestaurant(data);
};

export const getAllRestaurants = async (companyId, branchId) => {
  return await restaurantRepository.getAllRestaurants(companyId, branchId);
};

export const getRestaurantById = async (id) => {
  const restaurant = await restaurantRepository.getRestaurantById(id);
  if (!restaurant) {
    throw new Error("Restaurant not found.");
  }
  return restaurant;
};

export const updateRestaurant = async (id, data) => {
  const existing = await restaurantRepository.getRestaurantById(id);
  if (!existing) {
    throw new Error("Restaurant not found.");
  }
  return await restaurantRepository.updateRestaurant(id, data);
};

export const deleteRestaurant = async (id) => {
  const existing = await restaurantRepository.getRestaurantById(id);
  if (!existing) {
    throw new Error("Restaurant not found.");
  }
  return await restaurantRepository.deleteRestaurant(id);
};
