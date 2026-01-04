const API_URL = "http://localhost:3001/api";

export async function signin(email: string, password: string) {
  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) throw new Error("Login failed");

  const data = await res.json();
  localStorage.setItem("token", data.token);
  return data.user;
}

export async function getMe() {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token");

  const res = await fetch(`${API_URL}/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Unauthorized");
  return res.json();
}

export function signout() {
  localStorage.removeItem("token");
}

export async function signup(email: string, password: string) {
  const res = await fetch(`${API_URL}/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
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

  return res.json();
}
