import * as unitService from "./unit.service.js";

export const createUnit = async (req, res) => {
  try {
    const unit = await unitService.createUnit(req.body);

    res.status(201).json({
      success: true,
      message: "Unit created successfully",
      data: unit,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllUnits = async (req, res) => {
  try {
    const units = await unitService.getAllUnits();

    res.status(200).json({
      success: true,
      message: "Units fetched successfully",
      count: units.length,
      data: units,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getUnitById = async (req, res) => {
  try {
    const unit = await unitService.getUnitById(req.params.id);

    res.status(200).json({
      success: true,
      message: "Unit fetched successfully",
      data: unit,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateUnit = async (req, res) => {
  try {
    const unit = await unitService.updateUnit(
      req.params.id,
      req.body
    );

    res.status(200).json({
      success: true,
      message: "Unit updated successfully",
      data: unit,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteUnit = async (req, res) => {
  try {
    await unitService.deleteUnit(req.params.id);

    res.status(200).json({
      success: true,
      message: "Unit deleted successfully",
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};