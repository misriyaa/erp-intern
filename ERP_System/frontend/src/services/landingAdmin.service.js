const API_URL = process.env.NEXT_PUBLIC_API_URL;

// ==============================
// GET LANDING PAGE
// ==============================

export async function getLandingPage() {
  const response = await fetch(`${API_URL}/api/landing`);

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || "Failed to fetch landing page"
    );
  }

  return result.data;
}

// ==============================
// UPDATE LANDING PAGE
// ==============================

export async function updateLandingPage(formData) {
  const response = await fetch(`${API_URL}/api/landing`, {
    method: "PUT",
    body: formData,
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || "Failed to update landing page"
    );
  }

  return result;
}