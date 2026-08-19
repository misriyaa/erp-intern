const designationsSchema = {
  Designation: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      companyId: { type: "string", format: "uuid" },
      name: { type: "string", example: "Software Engineer" },
      departmentId: { type: "string", format: "uuid", nullable: true },
      description: { type: "string", nullable: true },
      status: { type: "string", enum: ["ACTIVE", "INACTIVE"] },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
    },
  },
  CreateDesignation: {
    type: "object",
    required: ["name"],
    properties: {
      name: { type: "string", example: "Senior Accountant" },
      departmentId: { type: "string", format: "uuid" },
      description: { type: "string" },
      status: { type: "string", default: "ACTIVE" },
    },
  },
  UpdateDesignation: {
    type: "object",
    properties: {
      name: { type: "string" },
      departmentId: { type: "string", format: "uuid" },
      description: { type: "string" },
      status: { type: "string" },
    },
  },
};

export default designationsSchema;
