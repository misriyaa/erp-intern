"use client";

import DashboardHome from "@/components/adminPanel/DashboardHome/DashboardHome";
import GymDashboard from "@/components/gym/GymDashboard";
import TextileDashboard from "@/components/textile/TextileDashboard";
import SingleRestaurantDashboard from "@/components/restaurant/SingleRestaurantDashboard";
import LaundryDashboardPage from "@/app/laundry/dashboard/page";
import MedicalDashboardPage from "@/app/medical/dashboard/page";
import { useCompany } from "@/context/CompanyContext";

const DASHBOARD_REGISTRY = {
  RETAIL: DashboardHome,
  GYM: GymDashboard,
  TEXTILE: TextileDashboard,
  RESTAURANT: SingleRestaurantDashboard,
  LAUNDRY: LaundryDashboardPage,
  MEDICAL_SHOP: MedicalDashboardPage,
  MEDICAL: MedicalDashboardPage,
};

export default function DashboardPage() {
  const { industryCode, loading } = useCompany();

  if (loading) {
    return (
      <div style={{ padding: "32px", textAlign: "center", color: "#64748b" }}>
        Loading Dashboard...
      </div>
    );
  }

  const codeUpper = (industryCode || "RETAIL").toUpperCase();
  const DashboardComponent = DASHBOARD_REGISTRY[codeUpper] || DashboardHome;

  return (
    <div>
      <DashboardComponent />
    </div>
  );
}
