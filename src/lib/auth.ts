const API_URL = "http://localhost:3001/api";

export async function signin(email: string, password: string) {
  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) throw new Error("Login failed");
  return res.json();
}

export async function getMe() {
  const res = await fetch(`${API_URL}/me`, {
    credentials: "include",
  });

  if (!res.ok) throw new Error("Unauthorized");
  return res.json();
}

export async function signout() {
  await fetch(`${API_URL}/logout`, {
    method: "DELETE",
    credentials: "include",
  });
}