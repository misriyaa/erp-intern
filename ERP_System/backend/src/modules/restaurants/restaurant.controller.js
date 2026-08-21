import * as restaurantService from "./restaurant.service.js";

export const createRestaurant = async (req, res, next) => {
  try {
    const companyId = req.companyId || req.user?.companyId;
    const data = { ...req.body, companyId };
    const restaurant = await restaurantService.createRestaurant(data);
    return res.status(201).json({
      success: true,
      message: "Restaurant created successfully",
      data: restaurant,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllRestaurants = async (req, res, next) => {
  try {
    const companyId = req.companyId || req.user?.companyId;
    const { branchId } = req.query;
    const restaurants = await restaurantService.getAllRestaurants(companyId, branchId);
    return res.status(200).json({
      success: true,
      data: restaurants,
    });
  } catch (error) {
    next(error);
  }
};

export const getRestaurantById = async (req, res, next) => {
  try {
    const restaurant = await restaurantService.getRestaurantById(req.params.id);
    return res.status(200).json({
      success: true,
      data: restaurant,
    });
  } catch (error) {
    next(error);
  }
};

export const updateRestaurant = async (req, res, next) => {
  try {
    const restaurant = await restaurantService.updateRestaurant(req.params.id, req.body);
    return res.status(200).json({
      success: true,
      message: "Restaurant updated successfully",
      data: restaurant,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteRestaurant = async (req, res, next) => {
  try {
    await restaurantService.deleteRestaurant(req.params.id);
    return res.status(200).json({
      success: true,
      message: "Restaurant deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
