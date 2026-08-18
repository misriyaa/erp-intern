import {
  getGymMembersRepo,
  getGymMemberByIdRepo,
  createGymMemberRepo,
  updateGymMemberRepo,
  deleteGymMemberRepo,
  getGymPlansRepo,
  createGymPlanRepo,
  updateGymPlanRepo,
  deleteGymPlanRepo,
  getGymTrainersRepo,
  createGymTrainerRepo,
  updateGymTrainerRepo,
  deleteGymTrainerRepo,
  getGymAttendanceRepo,
  recordAttendanceRepo,
  updateAttendanceRepo,
  getGymPaymentsRepo,
  createGymPaymentRepo,
  getGymDashboardStatsRepo,
} from "./gym.repository.js";

const parseDate = (val) => {
  if (!val || typeof val !== "string" || !val.trim()) return null;
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
};

// MEMBERS
export const getGymMembersService = async (companyId, query) => {
  return await getGymMembersRepo(companyId, query);
};

export const getGymMemberByIdService = async (companyId, id) => {
  const member = await getGymMemberByIdRepo(companyId, id);
  if (!member) throw new Error("Gym member not found");
  return member;
};

export const createGymMemberService = async (companyId, data) => {
  if (!companyId) throw new Error("Company ID is required to create a member");

  const memberId = data.memberId || `MEM-${Date.now().toString(36).toUpperCase()}`;

  const payload = {
    ...data,
    companyId,
    memberId,
    dob: parseDate(data.dob),
    startDate: parseDate(data.startDate) || new Date(),
    expiryDate: parseDate(data.expiryDate) || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    membershipPlanId: data.membershipPlanId || null,
    assignedTrainerId: data.assignedTrainerId || null,
  };

  return await createGymMemberRepo(payload);
};

export const updateGymMemberService = async (companyId, id, data) => {
  const payload = { ...data };
  if (data.dob !== undefined) payload.dob = parseDate(data.dob);
  if (data.startDate !== undefined) payload.startDate = parseDate(data.startDate) || new Date();
  if (data.expiryDate !== undefined) payload.expiryDate = parseDate(data.expiryDate) || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  if (data.membershipPlanId !== undefined) payload.membershipPlanId = data.membershipPlanId || null;
  if (data.assignedTrainerId !== undefined) payload.assignedTrainerId = data.assignedTrainerId || null;

  return await updateGymMemberRepo(id, companyId, payload);
};

export const deleteGymMemberService = async (companyId, id) => {
  return await deleteGymMemberRepo(id, companyId);
};

// PLANS
export const getGymPlansService = async (companyId) => {
  return await getGymPlansRepo(companyId);
};

export const createGymPlanService = async (companyId, data) => {
  if (!companyId) throw new Error("Company ID is required");
  return await createGymPlanRepo({
    ...data,
    companyId,
    price: Number(data.price || 0),
    joiningFee: Number(data.joiningFee || 0),
    durationMonths: Number(data.durationMonths || 1),
  });
};

export const updateGymPlanService = async (companyId, id, data) => {
  const payload = { ...data };
  if (data.price !== undefined) payload.price = Number(data.price);
  if (data.joiningFee !== undefined) payload.joiningFee = Number(data.joiningFee);
  if (data.durationMonths !== undefined) payload.durationMonths = Number(data.durationMonths);
  return await updateGymPlanRepo(id, companyId, payload);
};

export const deleteGymPlanService = async (companyId, id) => {
  return await deleteGymPlanRepo(id, companyId);
};

// TRAINERS
export const getGymTrainersService = async (companyId) => {
  return await getGymTrainersRepo(companyId);
};

export const createGymTrainerService = async (companyId, data) => {
  if (!companyId) throw new Error("Company ID is required");
  const trainerId = data.trainerId || `TRN-${Date.now().toString(36).toUpperCase()}`;
  return await createGymTrainerRepo({
    ...data,
    companyId,
    trainerId,
    salary: data.salary ? Number(data.salary) : null,
  });
};

export const updateGymTrainerService = async (companyId, id, data) => {
  const payload = { ...data };
  if (data.salary !== undefined) payload.salary = data.salary ? Number(data.salary) : null;
  return await updateGymTrainerRepo(id, companyId, payload);
};

export const deleteGymTrainerService = async (companyId, id) => {
  return await deleteGymTrainerRepo(id, companyId);
};

// ATTENDANCE
export const getGymAttendanceService = async (companyId, query) => {
  return await getGymAttendanceRepo(companyId, query);
};

export const recordAttendanceService = async (companyId, data) => {
  if (!companyId) throw new Error("Company ID is required");
  return await recordAttendanceRepo({
    ...data,
    companyId,
    date: parseDate(data.date) || new Date(),
  });
};

export const updateAttendanceService = async (companyId, id, data) => {
  const payload = { ...data };
  if (data.date !== undefined) payload.date = parseDate(data.date) || new Date();
  return await updateAttendanceRepo(id, companyId, payload);
};

// PAYMENTS
export const getGymPaymentsService = async (companyId, query) => {
  return await getGymPaymentsRepo(companyId, query);
};

export const createGymPaymentService = async (companyId, data) => {
  if (!companyId) throw new Error("Company ID is required");

  const paymentNumber = data.paymentNumber || `REC-${Date.now().toString(36).toUpperCase()}`;
  const receiptNumber = data.receiptNumber || `RCPT-${Math.floor(100000 + Math.random() * 900000)}`;

  const total = Number(data.totalAmount || 0);
  const paid = Number(data.paidAmount || 0);
  const pending = Math.max(0, total - paid);

  let status = "PAID";
  if (paid === 0) status = "PENDING";
  else if (pending > 0) status = "PARTIALLY_PAID";

  return await createGymPaymentRepo({
    ...data,
    companyId,
    paymentNumber,
    receiptNumber,
    paymentDate: parseDate(data.paymentDate) || new Date(),
    totalAmount: total,
    paidAmount: paid,
    pendingAmount: pending,
    status,
  });
};

// DASHBOARD STATS
export const getGymDashboardStatsService = async (companyId) => {
  return await getGymDashboardStatsRepo(companyId);
};
