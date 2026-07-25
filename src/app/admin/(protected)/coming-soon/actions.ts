"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/auth";
import { createComingSoonItem, updateComingSoonItem, deleteComingSoonItem } from "@/lib/data/coming-soon";

export async function createComingSoonAction(formData: FormData) {
  if (!(await verifySession())) redirect("/admin/login");

  await createComingSoonItem({
    brand: String(formData.get("brand")),
    label: String(formData.get("label")),
    position: Number(formData.get("position") || 0),
  });
  revalidatePath("/admin/coming-soon");
}

export async function updateComingSoonAction(id: number, formData: FormData) {
  if (!(await verifySession())) redirect("/admin/login");

  await updateComingSoonItem(id, {
    brand: String(formData.get("brand")),
    label: String(formData.get("label")),
    position: Number(formData.get("position") || 0),
  });
  revalidatePath("/admin/coming-soon");
}

export async function deleteComingSoonAction(id: number) {
  if (!(await verifySession())) redirect("/admin/login");

  await deleteComingSoonItem(id);
  revalidatePath("/admin/coming-soon");
}
