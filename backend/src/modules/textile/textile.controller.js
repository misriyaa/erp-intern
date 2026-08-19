import * as textileService from "./textile.service.js";

export const getTextileProducts = async (req, res) => {
  try {
    const companyId = req.user?.companyId;
    const products = await textileService.getTextileProducts(companyId, req.query);
    return res.status(200).json({ success: true, data: products });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getTextileProductById = async (req, res) => {
  try {
    const companyId = req.user?.companyId;
    const product = await textileService.getTextileProductById(companyId, req.params.id);
    return res.status(200).json({ success: true, data: product });
  } catch (err) {
    return res.status(404).json({ success: false, message: err.message });
  }
};

export const createTextileProduct = async (req, res) => {
  try {
    const companyId = req.user?.companyId;
    const product = await textileService.createTextileProduct(companyId, req.body);
    return res.status(201).json({ success: true, message: "Textile product created successfully", data: product });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

export const updateTextileProduct = async (req, res) => {
  try {
    const companyId = req.user?.companyId;
    const product = await textileService.updateTextileProduct(companyId, req.params.id, req.body);
    return res.status(200).json({ success: true, message: "Textile product updated successfully", data: product });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

export const deleteTextileProduct = async (req, res) => {
  try {
    const companyId = req.user?.companyId;
    await textileService.deleteTextileProduct(companyId, req.params.id);
    return res.status(200).json({ success: true, message: "Textile product deleted successfully" });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};
