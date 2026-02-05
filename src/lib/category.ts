const API_URL = process.env.NEXT_PUBLIC_API_URL;

/* =======================
   CATEGORY
======================= */

export async function getCategoriesAdmin() {
  const res = await fetch(`${API_URL}/api/categories`, {
    headers: authHeader(),
  });
  if (!res.ok) throw new Error("Failed to load categories");
  return res.json();
}

export async function createCategory(data: { name: string }) {
  const res = await fetch(`${API_URL}/api/categories`, {
    method: "POST",
    headers: authHeaderJson(),
    body: JSON.stringify({ category: data }),
  });
  if (!res.ok) throw new Error("Create category failed");
  return res.json();
}

export async function updateCategory(id: number, data: { name: string }) {
  const res = await fetch(`${API_URL}/api/categories/${id}`, {
    method: "PATCH",
    headers: authHeaderJson(),
    body: JSON.stringify({ category: data }),
  });
  if (!res.ok) throw new Error("Update category failed");
  return res.json();
}

export async function deleteCategory(id: number) {
  const res = await fetch(`${API_URL}/api/categories/${id}`, {
    method: "DELETE",
    headers: authHeader(),
  });
  if (!res.ok) throw new Error("Delete category failed");
}


/* =======================
   HELPERS
======================= */

function authHeader() {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
  };
}

function authHeaderJson() {
  return {
    ...authHeader(),
    "Content-Type": "application/json",
  };
}


/* =========================
   SUBCATEGORIES (ADMIN)
========================= */

export async function getSubcategoriesAdmin() {
  const res = await fetch(`${API_URL}/api/subcategories`, {
    headers: authHeader(),
  });

  if (!res.ok) {
    throw new Error("Failed to fetch subcategories");
  }

  return res.json();
}

export async function createSubcategory(payload: {
  name: string;
  category_id: number;
}) {
  const res = await fetch(`${API_URL}/api/subcategories`, {
    method: "POST",
    headers: {
      ...authHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ subcategory: payload }),
  });

  if (!res.ok) {
    throw new Error("Failed to create subcategory");
  }

  return res.json();
}

export async function updateSubcategory(
  id: number,
  payload: { name: string; category_id?: number }
) {
  const res = await fetch(`${API_URL}/api/subcategories/${id}`, {
    method: "PATCH",
    headers: {
      ...authHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ subcategory: payload }),
  });

  if (!res.ok) {
    throw new Error("Failed to update subcategory");
  }

  return res.json();
}

export async function deleteSubcategory(id: number) {
  const res = await fetch(`${API_URL}/api/subcategories/${id}`, {
    method: "DELETE",
    headers: authHeader(),
  });

  if (!res.ok) {
    throw new Error("Failed to delete subcategory");
  }
}
