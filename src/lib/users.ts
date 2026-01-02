// lib/users.ts
export async function getUsers() {
  const res = await fetch("/api/users", {
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to fetch users");

  const data = await res.json();

  // 🔥 RẤT QUAN TRỌNG
  return data.users;
}

export async function deleteUser(id: number) {
  const res = await fetch(`/api/users/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) throw new Error("Delete failed");
}
