import { API_BASE_URL } from "../config/api";

const API_URL = `${API_BASE_URL}/products`;

export const createProduct = async (productData) => {
  const response = await fetch(`${API_URL}/create`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify(productData),
  });

  return response.json();
};

export const uploadProductImage = async (file, token) => {
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(`${API_URL}/upload-image`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Image upload failed");
  }

  return data;
};
