const API_URL = process.env.NEXT_PUBLIC_API_URL;

function authHeaderOnly() {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No auth token");

  return {
    Authorization: `Bearer ${token}`,
  };
}

// ====================
// GET
// ====================
export async function getProducts() {
  const res = await fetch(`${API_URL}/api/products`, {
    headers: authHeaderOnly(),
  });

  if (!res.ok) throw new Error("GET failed");
  return res.json();
}

// ====================
// CREATE
// ====================
export async function createProduct(data: FormData) {
  const res = await fetch(`${API_URL}/api/products`, {
    method: "POST",
    headers: authHeaderOnly(),
    body: data,
  });

  if (!res.ok) throw new Error("Create failed");
  return res.json();
}

// ====================
// UPDATE
// ====================
export async function updateProduct(id: number, data: FormData) {
  const res = await fetch(`${API_URL}/api/products/${id}`, {
    method: "PUT",
    headers: authHeaderOnly(),
    body: data,
  });

  if (!res.ok) throw new Error("Update failed");
  return res.json();
}

// ====================
// DELETE
// ====================
export async function deleteProduct(id: number) {
  const res = await fetch(`${API_URL}/api/products/${id}`, {
    method: "DELETE",
    headers: authHeaderOnly(),
  });

  if (!res.ok) throw new Error("Delete failed");
}
