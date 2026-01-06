// src/lib/auth.ts

const API_URL = "https://api.ndphong0307.tech";

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not defined");
}

export type User = {
  id: number;
  email: string;
  role: "admin" | "staff" | "user";
  first_name?: string;
  last_name?: string;
};

/* ================= LOGIN ================= */

export async function signin(
  email: string,
  password: string
): Promise<User> {
  const res = await fetch(`${API_URL}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  console.log(res)
  localStorage.removeItem("token")
  if (!res.ok) {
    throw new Error("Login failed");
  }

  const data = await res.json();
  localStorage.setItem("token", data.token);

  return data.user;
}

/* ================= ME ================= */

export async function getMe() {
  if (typeof window === "undefined") return null;
  console.log("TOKEN =", localStorage.getItem("token"));

  const token = localStorage.getItem("token");
  if (!token) {
    console.warn("getMe skipped: no token");
    return null;
  }

  const res = await fetch(`${API_URL}/api/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    console.warn("getMe failed:", res.status);
    return null;
  }

  const data = await res.json();
  return data.user;
}

/* ================= SIGNUP (FIX LỖI BUILD) ================= */

export async function signup(
  email: string,
  password: string
): Promise<void> {
  const res = await fetch(`${API_URL}/api/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      password,
      password_confirmation: password,
    }),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.errors?.join(", ") || "Signup failed");
  }
}

/* ================= LOGOUT ================= */

export function signout() {
  localStorage.removeItem("token");
}
