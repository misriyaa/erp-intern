import {
  fetchAllDesignations,
  fetchDesignationById,
  addDesignation,
  modifyDesignation,
  removeDesignation,
} from "./designations.service.js";

const getDesignations = async (req, res) => {
  try {
    const companyId = req.user?.companyId || req.query.companyId;
    const result = await fetchAllDesignations(companyId);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getDesignation = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await fetchDesignationById(id);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

const createDesignation = async (req, res) => {
  try {
    const companyId = req.user?.companyId;
    const result = await addDesignation({
      ...req.body,
      companyId: companyId || req.body.companyId,
    });
    return res.status(201).json(result);
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const updateDesignation = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await modifyDesignation(id, req.body);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteDesignation = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await removeDesignation(id);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export {
  getDesignations,
  getDesignation,
  createDesignation,
  updateDesignation,
  deleteDesignation,
};
