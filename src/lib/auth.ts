// src/lib/auth.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL;

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
  if (!res.ok) {
    throw new Error("Login failed");
  }

  const data = await res.json();
  localStorage.setItem("token", data.token);

  return data.user;
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
