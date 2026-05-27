import { useState } from "react";
import { useAuthSync } from "../../context/AuthSyncContext";
import { createProduct } from "../../services/ProductService";

function AddProductPage() {
  const { mongoUser } = useAuthSync();
  const [formData, setFormData] = useState({
    productName: "",
    batchNumber: "",
    manufactureDate: "",
    expiryDate: "",
    quantity: "",
  });
  const [createdProduct, setCreatedProduct] = useState(null);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setCreatedProduct(null);

    try {
      const response = await createProduct({
        ...formData,
        clerkId: mongoUser?.clerkId,
      });

      if (response?.success === false) {
        setError(response.message || "Failed to create product");
        return;
      }

      setCreatedProduct(response);
    } catch {
      setError("Failed to create product");
    }
  };

  return (
    <div className="max-w-xl space-y-4">
      <h1 className="text-2xl font-bold">Add Product</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input name="productName" placeholder="Product Name" onChange={handleChange} className="w-full rounded border border-gray-300 px-3 py-2" />
        <input name="batchNumber" placeholder="Batch Number" onChange={handleChange} className="w-full rounded border border-gray-300 px-3 py-2" />
        <input type="date" name="manufactureDate" onChange={handleChange} className="w-full rounded border border-gray-300 px-3 py-2" />
        <input type="date" name="expiryDate" onChange={handleChange} className="w-full rounded border border-gray-300 px-3 py-2" />
        <input type="number" name="quantity" placeholder="Quantity" onChange={handleChange} className="w-full rounded border border-gray-300 px-3 py-2" />
        <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white">Create Product</button>
      </form>

      {error ? <p className="text-red-600">{error}</p> : null}

      {createdProduct?.qrCode ? (
        <div>
          <h2 className="font-semibold">QR Code</h2>
          <img src={createdProduct.qrCode} alt="QR Code" width="200" />
        </div>
      ) : null}
    </div>
  );
}

export default AddProductPage;
