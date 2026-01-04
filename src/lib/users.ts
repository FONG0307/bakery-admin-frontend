// src/lib/users.ts
const API_BASE = "http://localhost:3001/api";

/* =======================
   TYPES
======================= */
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
};

/* =======================
   HELPERS
======================= */
function authHeaders() {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("No auth token");
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

/* =======================
   API CALLS
======================= */

// ✅ GET USERS
export async function getUsers(): Promise<User[]> {
  try {
    const res = await fetch(`${API_BASE}/users`, {
      headers: authHeaders(),
    });

    const data = await res.json();

    console.log("🔥 /api/users response:", data);

    if (!res.ok) {
      console.error("GET USERS FAILED:", data);
      return [];
    }

    // ✅ backend trả ARRAY TRỰC TIẾP
    if (Array.isArray(data)) {
      return data;
    }

    // (fallback nếu sau này đổi backend)
    if (Array.isArray(data.users)) {
      return data.users;
    }

    console.warn("⚠️ Unexpected users response shape:", data);
    return [];
  } catch (err) {
    console.error("GET USERS ERROR:", err);
    return [];
  }
}

// ✅ CREATE USER
export async function createUser(payload: any) {
  const token = localStorage.getItem("token");

  const res = await fetch("http://localhost:3001/api/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      user: payload, // 🔥 QUAN TRỌNG
    }),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.errors?.join(", ") || "Create user failed");
  }

  return res.json();
}


// ✅ UPDATE USER
export async function updateUser(id: number, data: any) {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token");

  const res = await fetch(`${API_BASE}/users/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // 🔥 BẮT BUỘC
    },
    body: JSON.stringify({ user: data }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Update user failed");
  }

  return res.json();
}

// ✅ DELETE USER
export async function deleteUser(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/users/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  if (!res.ok) {
    throw new Error("Failed to delete user");
  }
}
