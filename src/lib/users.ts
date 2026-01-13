// src/lib/users.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL;


export type User = {
  id: number;
  email: string;
  role: "admin" | "staff" | "user";

  first_name?: string;
  last_name?: string;
  phone?: string;
  bio?: string;

  country?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  tax_id?: string;

  created_at?: string;

  avatar_url?: string;
};

function authHeaderOnly() {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No auth token");

  return {
    Authorization: `Bearer ${token}`,
  };
}

function authJsonHeaders() {
  return {
    ...authHeaderOnly(),
    "Content-Type": "application/json",
  };
}


// ✅ GET USERS
export async function getUsers(): Promise<User[]> {
  try {
    const res = await fetch(`${API_BASE}/api/users`, {
      headers: authHeaderOnly(),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("GET USERS FAILED:", data);
      return [];
    }

    return Array.isArray(data) ? data : data.users ?? [];
  } catch (err) {
    console.error("GET USERS ERROR:", err);
    return [];
  }
}

// ✅ CREATE USER (JSON only)
export async function createUser(payload: any) {
  const res = await fetch(`${API_BASE}/api/users`, {
    method: "POST",
    headers: authJsonHeaders(),
    body: JSON.stringify({ user: payload }),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.errors?.join(", ") || "Create user failed");
  }

  return res.json();
}

// ✅ UPDATE USER INFO (KHÔNG AVATAR)
export async function updateUser(
  id: number,
  data: Partial<User>
): Promise<User> {
  const res = await fetch(`${API_BASE}/api/users/${id}`, {
    method: "PATCH",
    headers: authJsonHeaders(),
    body: JSON.stringify({ user: data }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Update user failed");
  }

  return res.json();
}

export async function updateUserAvatar(
  userId: number,
  file: File
): Promise<{ avatar_url: string }> {
  const formData = new FormData();
  formData.append("avatar", file);

  const res = await fetch(`${API_BASE}/api/users/${userId}/update_avatar`, {
    method: "PATCH",
    headers: authHeaderOnly(),
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Update avatar failed");
  }

  return res.json();
}

// ✅ DELETE USER
export async function deleteUser(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/users/${id}`, {
    method: "DELETE",
    headers: authHeaderOnly(),
  });

  if (!res.ok) {
    throw new Error("Failed to delete user");
  }
}
