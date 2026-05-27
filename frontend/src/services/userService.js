import { API_BASE_URL } from "../config/api";

const API_URL = `${API_BASE_URL}/users`;

const normalizeEmail = (email) =>
  typeof email === "string" ? email.trim().toLowerCase() : email;

export const syncUser = async (user) => {
  const payload = {
    ...user,
    email: normalizeEmail(user.email),
  };

  const response = await fetch(`${API_URL}/sync`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "Failed to sync user account");
  }

  if (data?.success === false) {
    throw new Error(data?.message || "Failed to sync user account");
  }

  return data;
};
