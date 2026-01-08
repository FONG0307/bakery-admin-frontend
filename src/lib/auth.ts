// src/lib/auth.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL;

import { User } from "@/context/AuthContext";

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not defined");
}

/* ================= LOGIN ================= */
export type SigninResponse = {
  token: string;
  user: User;
}

export async function signin(
  email: string,
  password: string
): Promise<SigninResponse> {
  const res = await fetch(`${API_URL}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    throw new Error("Login failed");
  }

  const data: SigninResponse = await res.json();
  localStorage.setItem("token", data.token);
  return data;
}

/* ================= ME ================= */

export async function getMe(token?: string) {
  const t = token ?? localStorage.getItem("token");
  if (!t) throw new Error("No token");

  const res = await fetch(`${API_URL}/api/me`, {
    headers: {
      Authorization: `Bearer ${t}`,
    },
  });

  if (!res.ok) throw new Error("Unauthorized");
  return res.json();
}

/* ================= SIGNUP (FIX LỖI BUILD) ================= */

export async function signup(
  email: string,
  password: string,
  passwordConfirmation: string
): Promise<void> {
  const res = await fetch(`${API_URL}/api/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      password,
      password_confirmation: passwordConfirmation,
    }),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.errors?.join(", ") || "Signup failed");
  }
}

/* ================= LOGOUT ================= */

export async function signout() {
  const token = localStorage.getItem("token");

  try {
    await fetch(`${API_URL}/api/logout`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch {
    // ignore
  } finally {
    localStorage.removeItem("token");
  }
}
