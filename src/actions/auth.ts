"use server";

import { redirect } from "next/navigation";
import { createSession, clearSession, verifyPassword } from "@/lib/auth";
import { DataService } from "@/lib/dataService";
import type { SessionUser } from "@/types";

export async function loginAction(
  _prevState: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email dan password harus diisi." };
  }

  try {
    const user = await DataService.getUserByEmail(email);

    if (!user) {
      return { error: "Email atau password salah." };
    }

    if (!user.active) {
      return { error: "Akun Anda tidak aktif. Hubungi admin." };
    }

    const isValid = verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return { error: "Email atau password salah." };
    }

    const sessionUser: SessionUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as "ADMIN" | "KASIR",
    };

    await createSession(sessionUser);

    // Audit log
    await DataService.addAuditLog({
      userId: user.id,
      userName: user.name,
      action: "Login",
      details: `User ${user.name} (${user.role}) berhasil login.`,
    });
  } catch (err) {
    console.error("Login error:", err);
    return { error: "Terjadi kesalahan saat login. Coba lagi." };
  }

  redirect("/dashboard");
}

export async function logoutAction(): Promise<void> {
  await clearSession();
  redirect("/login");
}
