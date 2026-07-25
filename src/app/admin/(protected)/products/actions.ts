"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/auth";
import { saveImage } from "@/lib/storage";
import { createProduct, updateProduct, deleteProduct, type NewProduct } from "@/lib/data/products";

function readProductForm(formData: FormData): Omit<NewProduct, "images"> {
  return {
    slug: String(formData.get("slug")),
    brand: String(formData.get("brand")),
    name: String(formData.get("name")),
    price: String(formData.get("price")),
    size: String(formData.get("size")),
    condition: String(formData.get("condition")),
    origin: String(formData.get("origin")),
    description: formData.getAll("description").map(String).filter(Boolean),
    details: formData
      .getAll("detailLabel")
      .map((label, i) => ({
        label: String(label),
        value: String(formData.getAll("detailValue")[i] ?? ""),
      }))
      .filter((d) => d.label),
  };
}

export async function createProductAction(formData: FormData) {
  if (!(await verifySession())) redirect("/admin/login");

  const files = formData.getAll("newImages").filter((f): f is File => f instanceof File && f.size > 0);
  const uploadedUrls = await Promise.all(files.map(saveImage));

  await createProduct({ ...readProductForm(formData), images: uploadedUrls });
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function updateProductAction(id: number, formData: FormData) {
  if (!(await verifySession())) redirect("/admin/login");

  const keptImages = formData.getAll("keptImages").map(String);
  const files = formData.getAll("newImages").filter((f): f is File => f instanceof File && f.size > 0);
  const uploadedUrls = await Promise.all(files.map(saveImage));

  await updateProduct(id, {
    ...readProductForm(formData),
    images: [...keptImages, ...uploadedUrls],
  });
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function deleteProductAction(id: number) {
  if (!(await verifySession())) redirect("/admin/login");

  await deleteProduct(id);
  revalidatePath("/admin/products");
}
