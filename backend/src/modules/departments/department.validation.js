import { departmentSchema } from "./department.schema.js";

const validateDepartment = (req, res, next) => {
  const { error, value } = departmentSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
  }

  req.body = value;
  next();
};

export { validateDepartment };
