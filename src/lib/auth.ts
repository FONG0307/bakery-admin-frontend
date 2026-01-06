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

export async function signin(email: string, password: string): Promise<User> {
  const res = await fetch(`${API_URL}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) throw new Error("Login failed");

  const data = await res.json();
  localStorage.setItem("token", data.token);

  return data.user; // ✅ user trực tiếp
}

export async function getMe(): Promise<User | null> {
  if (typeof window === "undefined") return null;

  const token = localStorage.getItem("token");
  if (!token) return null;

  const res = await fetch(`${API_URL}/api/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) return null;

  const data = await res.json();

  return data.user; // ✅ CHUẨN
}

export function signout() {
  localStorage.removeItem("token");
}
