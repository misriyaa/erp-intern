const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ==========================================
// Get System Settings
// ==========================================
export async function getSettings() {
  const response = await fetch(`${API_URL}/api/settings`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to fetch settings");
  }

  return result.data;
}

// ==========================================
// Update System Settings
// ==========================================
export async function updateSettings(data) {
  let body;
  let headers = {};

  if (data instanceof FormData) {
    body = data;
  } else {
    body = JSON.stringify(data);
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_URL}/api/settings`, {
    method: "PUT",
    headers,
    body,
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to update settings");
  }

  return result;
}

// ==========================================
// Upload Logo Only
// ==========================================
export async function uploadLogo(file) {
  const formData = new FormData();
  formData.append("companyLogo", file);

  const response = await fetch(`${API_URL}/api/settings/logo`, {
    method: "POST",
    body: formData,
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to upload company logo");
  }

  return result;
}

// ==========================================
// Reset Settings to Factory Defaults
// ==========================================
export async function resetSettings() {
  const response = await fetch(`${API_URL}/api/settings/reset`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to reset settings");
  }

  return result;
}
