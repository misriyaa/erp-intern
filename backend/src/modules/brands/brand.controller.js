import * as brandService from "./brand.service.js";

export const createBrand = async (req, res) => {
  try {
    const brand = await brandService.createBrand(req.body);

    return res.status(201).json({
      success: true,
      message: "Brand created successfully",
      data: brand,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllBrands = async (req, res) => {
  try {
    const brands = await brandService.getAllBrands();

    return res.status(200).json({
      success: true,
      message: "Brands fetched successfully",
      count: brands.length,
      data: brands,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getBrandById = async (req, res) => {
  try {
    const { id } = req.params;

    const brand = await brandService.getBrandById(id);

    return res.status(200).json({
      success: true,
      message: "Brand fetched successfully",
      data: brand,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateBrand = async (req, res) => {
  try {
    const { id } = req.params;

    const brand = await brandService.updateBrand(id, req.body);

    return res.status(200).json({
      success: true,
      message: "Brand updated successfully",
      data: brand,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteBrand = async (req, res) => {
  try {
    const { id } = req.params;

    await brandService.deleteBrand(id);

    return res.status(200).json({
      success: true,
      message: "Brand deleted successfully",
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};