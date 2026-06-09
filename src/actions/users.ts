"use server";

import { DataService, type DataServiceType } from "@/lib/dataService";
import { getSession, hashNewPassword } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getUsers() {
  return await DataService.getUsers();
}

export async function createUser(data: {
  email: string;
  name: string;
  password: string;
  role: "ADMIN" | "KASIR";
}) {
  const user = await getSession();
  if (!user || user.role !== "ADMIN") throw new Error("Unauthorized");

  const passwordHash = hashNewPassword(data.password);

  const newUser = await DataService.createUser({
    email: data.email,
    name: data.name,
    passwordHash,
    role: data.role,
  });

  await DataService.addAuditLog({
    userId: user.id,
    userName: user.name,
    action: "Tambah User",
    details: `User "${data.name}" (${data.role}) ditambahkan.`,
  });

  revalidatePath("/users");
  return newUser;
}

export async function updateUser(
  id: string,
  data: {
    email?: string;
    name?: string;
    role?: "ADMIN" | "KASIR";
    active?: boolean;
    newPassword?: string;
  }
) {
  const user = await getSession();
  if (!user || user.role !== "ADMIN") throw new Error("Unauthorized");

  type UpdateUserPayload = Parameters<DataServiceType["updateUser"]>[1];
  const updateData: UpdateUserPayload = {};
  if (data.email) updateData.email = data.email;
  if (data.name) updateData.name = data.name;
  if (data.role) updateData.role = data.role;
  if (data.active !== undefined) updateData.active = data.active;
  if (data.newPassword) updateData.passwordHash = hashNewPassword(data.newPassword);

  const updated = await DataService.updateUser(id, updateData);

  await DataService.addAuditLog({
    userId: user.id,
    userName: user.name,
    action: data.newPassword ? "Reset Password User" : "Edit User",
    details: `User ID ${id} diperbarui.`,
  });

  revalidatePath("/users");
  return updated;
}
