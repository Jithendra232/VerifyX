const API_URL = "http://localhost:5000/api/products";

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