import {
  fetchAllEmployees,
  fetchEmployeeById,
  addEmployee,
  modifyEmployee,
  removeEmployee,
} from "./employees.service.js";


// Get all employees
const getEmployees = async (req, res, next) => {
  try {
    const companyId = req.user?.companyId || req.query.companyId;
    const type = req.user?.type || req.query.type;

    const result = await fetchAllEmployees(companyId, type);

    // If caller is NOT Super Admin (e.g. Manager or Admin), remove Admin and Super Admin accounts
    const callerRole = (req.user?.role || "").toUpperCase();
    if (callerRole !== "SUPER_ADMIN" && callerRole !== "SUPERADMIN" && result?.data) {
      result.data = result.data.filter((emp) => {
        const empRole = (emp.role || emp.roleRef?.name || "").toUpperCase();
        return (
          empRole !== "ADMIN" &&
          empRole !== "SUPER_ADMIN" &&
          empRole !== "SUPERADMIN"
        );
      });
    }

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};


// Get employee by ID
const getEmployee = async (
  req,
  res,
  next
) => {

  try {

    const { id } =
      req.params;

    const result =
      await fetchEmployeeById(id);

    return res.status(200).json(result);

  } catch (error) {

    next(error);
  }
};


// Add employee
const createEmployee = async (
  req,
  res,
  next
) => {

  try {

    const result =
      await addEmployee(
        req.body,
        req
      );

    return res.status(201).json(result);

  } catch (error) {

    next(error);
  }
};


// Update employee
const updateEmployee = async (
  req,
  res,
  next
) => {

  try {

    const { id } =
      req.params;

    const result =
      await modifyEmployee(
        id,
        req.body,
        req
      );

    return res.status(200).json(result);

  } catch (error) {

    next(error);
  }
};


// Delete employee
const deleteEmployee = async (
  req,
  res,
  next
) => {

  try {

    const { id } =
      req.params;

    const result =
      await removeEmployee(
        id,
        req
      );

    return res.status(200).json(result);

  } catch (error) {

    next(error);
  }
};


export {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};
