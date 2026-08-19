import {
  getAllDesignations,
  getDesignationById,
  getDesignationByCode,
  createDesignation,
  updateDesignation,
  deleteDesignation,
} from "./designations.repository.js";

const fetchAllDesignations = async () => {
  const designations = await getAllDesignations();
  return {
    success: true,
    data: designations,
  };
};

const fetchDesignationById = async (id) => {
  const designation = await getDesignationById(id);
  if (!designation) {
    throw new Error("Designation not found");
  }
  return {
    success: true,
    data: designation,
  };
};

const addDesignation = async (designationData) => {
  const { designation, department, status, code } = designationData;

  if (!designation || !designation.trim()) {
    throw new Error("Designation name is required");
  }
  if (!department || !department.trim()) {
    throw new Error("Department is required");
  }

  // Generate unique code if not provided
  let designationCode = code;
  if (!designationCode) {
    const count = (await getAllDesignations()).length;
    designationCode = `DSG-${String(count + 1).padStart(3, "0")}`;
  }

  const existingCode = await getDesignationByCode(designationCode);
  if (existingCode) {
    designationCode = `DSG-${Date.now()}`;
  }

  const newDesignation = await createDesignation({
    code: designationCode,
    designation: designation.trim(),
    department: department.trim(),
    status: status || "ACTIVE",
  });

  return {
    success: true,
    message: "Designation created successfully",
    data: newDesignation,
  };
};

const modifyDesignation = async (id, updateData) => {
  const existing = await getDesignationById(id);
  if (!existing) {
    throw new Error("Designation not found");
  }

  if (updateData.code && updateData.code !== existing.code) {
    const existingCode = await getDesignationByCode(updateData.code);
    if (existingCode) {
      throw new Error("Designation code already exists");
    }
  }

  const payload = {};
  if (updateData.designation) payload.designation = updateData.designation.trim();
  if (updateData.department) payload.department = updateData.department.trim();
  if (updateData.status) payload.status = updateData.status;
  if (updateData.code) payload.code = updateData.code;

  const updated = await updateDesignation(id, payload);

  return {
    success: true,
    message: "Designation updated successfully",
    data: updated,
  };
};

const removeDesignation = async (id) => {
  const existing = await getDesignationById(id);
  if (!existing) {
    throw new Error("Designation not found");
  }

  await deleteDesignation(id);

  return {
    success: true,
    message: "Designation deleted successfully",
  };
};

export {
  fetchAllDesignations,
  fetchDesignationById,
  addDesignation,
  modifyDesignation,
  removeDesignation,
};
