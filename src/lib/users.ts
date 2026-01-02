// lib/users.ts
const API_BASE = "http://localhost:3001";

export async function getUsers() {
  const res = await fetch(`${API_BASE}/api/users`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch users");
  }

  const data = await res.json();
  return data.users;
}


export async function deleteUser(id: number) {
  const res = await fetch(`${API_BASE}/api/users/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to delete user");
  }
}

export async function createUser(data: {
  email: string;
  password: string;
  role: string;
}) {
  const res = await fetch("http://localhost:3001/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      email: data.email,
      password: data.password,
      password_confirmation: data.password, // 🔥 QUAN TRỌNG
      role: data.role,
    }),
  });

  if (!res.ok) {
    const result = await res.json();
    throw new Error(result.errors?.join(", ") || "Create user failed");
  }

  return res.json();
}