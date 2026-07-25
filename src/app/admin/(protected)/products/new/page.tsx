import { ProductForm } from "@/components/admin/ProductForm";
import { createProductAction } from "../actions";

export default function NewProductPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-3xl">Add Product</h1>
      <ProductForm action={createProductAction} />
    </div>
  );
}
