import { useState } from "react";
import { useAuthSync } from "../../context/AuthSyncContext";
import { createProduct, uploadProductImage } from "../../services/ProductService";

function AddProductPage() {
  const { mongoUser, token } = useAuthSync();
  const [formData, setFormData] = useState({
    productName: "",
    batchNumber: "",
    manufactureDate: "",
    expiryDate: "",
    quantity: "",
    productImage: "",
  });
  const [createdProduct, setCreatedProduct] = useState(null);
  const [error, setError] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setImagePreview(URL.createObjectURL(file));

    if (!token) {
      setError("Sign-in session is still loading. Try the upload again.");
      return;
    }

    try {
      setUploading(true);
      const upload = await uploadProductImage(file, token);
      setFormData((current) => ({ ...current, productImage: upload.url }));
    } catch (err) {
      setError(err.message || "Image upload failed");
    } finally {
      setUploading(false);
    }
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
        <div className="rounded border border-gray-300 p-3">
          <label className="text-sm font-medium text-slate-700" htmlFor="product-image">Product Image</label>
          <input id="product-image" type="file" accept="image/*" onChange={handleImageChange} className="mt-2 block w-full text-sm" />
          {imagePreview ? (
            <img src={imagePreview} alt="Product preview" className="mt-3 h-32 w-32 rounded-lg object-cover" />
          ) : null}
          {uploading ? <p className="mt-2 text-sm text-blue-600">Uploading image...</p> : null}
        </div>
        <button type="submit" disabled={uploading} className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-60">Create Product</button>
      </form>

      {error ? <p className="text-red-600">{error}</p> : null}

      {createdProduct?.qrCode ? (
        <div className="space-y-3">
          <h2 className="font-semibold">QR Code</h2>
          {createdProduct.productImage ? (
            <img src={createdProduct.productImage} alt={createdProduct.productName} className="h-36 w-36 rounded-lg object-cover" />
          ) : null}
          <img src={createdProduct.qrCode} alt="QR Code" width="200" />
        </div>
      ) : null}
    </div>
  );
}

export default AddProductPage;
