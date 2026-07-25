"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/auth";
import { createBrand, updateBrand, deleteBrand } from "@/lib/data/brands";

export async function createBrandAction(formData: FormData) {
  if (!(await verifySession())) redirect("/admin/login");

  await createBrand({
    name: String(formData.get("name")),
    note: String(formData.get("note") || "") || null,
    position: Number(formData.get("position") || 0),
  });
  revalidatePath("/admin/brands");
}

export async function updateBrandAction(id: number, formData: FormData) {
  if (!(await verifySession())) redirect("/admin/login");

  await updateBrand(id, {
    name: String(formData.get("name")),
    note: String(formData.get("note") || "") || null,
    position: Number(formData.get("position") || 0),
  });
  revalidatePath("/admin/brands");
}

export async function deleteBrandAction(id: number) {
  if (!(await verifySession())) redirect("/admin/login");

  await deleteBrand(id);
  revalidatePath("/admin/brands");
}
