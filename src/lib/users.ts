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
export async function getUsers(params: {
  page?: number;
  per_page?: number;
  q?: string;
}) {
  const token = localStorage.getItem("token");

  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined) as any
  ).toString();

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/users?${qs}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.error || "Fetch users failed");
  }

  return {
    data: json.users,
    meta: json.meta,
  };
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
  userId: number,
  data: Partial<User>,
  avatar?: File
): Promise<User> {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(`user[${key}]`, String(value));
    }
  });

  if (avatar) {
    formData.append("avatar", avatar);
  }

  const res = await fetch(`${API_BASE}/api/users/${userId}`, {
    method: "PATCH",
    headers: authHeaderOnly(),
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Update user failed");
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



export async function updateMe(
  data: Partial<User>,
  avatar?: File
): Promise<User> {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Unauthorized");

  const fd = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      fd.append(key, String(value));
    }
  });

  if (avatar) {
    fd.append("avatar", avatar);
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/me`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: fd,
    }
  );

  const payload = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(
      payload.errors?.join(", ") ||
      payload.error ||
      "Update profile failed"
    );
  }

  return payload.user;
}

