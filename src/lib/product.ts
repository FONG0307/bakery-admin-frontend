const API_URL = process.env.NEXT_PUBLIC_API_URL;

function authHeaderOnly() {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No auth token");

  return {
    Authorization: `Bearer ${token}`,
  };
}
export async function getProduct(id: number) {
  const res = await fetch(`${API_URL}/api/products/${id}`);
  if (!res.ok) throw new Error("Failed");
  return res.json();
}

type ProductsResponse = {
  products: any[];
  meta?: {
    page: number;
    per_page: number;
    total_pages: number;
    total_count?: number;
  };
};

export async function getProducts(
  page = 1,
  perPage = 8
): Promise<ProductsResponse> {
  const res = await fetch(
    `${API_URL}/api/products?page=${page}&per_page=${perPage}`,
    {
      headers: authHeaderOnly(),
    }
  );

  if (!res.ok) {
    throw new Error(`GET products failed (${res.status})`);
  }

  const data = await res.json();

  return {
    products: Array.isArray(data?.products) ? data.products : [],
    meta: data?.meta ?? {
      page: 1,
      per_page: perPage,
      total_pages: 1,
    },
  };
}


export async function getDailyStock() {
  const res = await fetch(`${API_URL}/api/daily_stocks`, {
    headers: authHeaderOnly(),
  });

  if (!res.ok) throw new Error("GET daily_stocks failed");
  return res.json();
}

// ====================
// PUBLIC (no auth)
// ====================
export async function getProductsPublic() {
  const res = await fetch(`${API_URL}/api/public/products`);
  if (!res.ok) return [];
  return res.json();
}

export async function getProductPublic(id: number) {
  const res = await fetch(`${API_URL}/api/public/products/${id}`);
  if (!res.ok) return null;
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

// DELETE
export async function deleteProduct(id: number) {
  const res = await fetch(`${API_URL}/api/products/${id}`, {
    method: "DELETE",
    headers: authHeaderOnly(),
  });

  if (!res.ok) throw new Error("Delete failed");
}
// Export daily stock update function
export async function updateDailyStock(productId: number, available: number) {
  const res = await fetch(`${API_URL}/api/products/${productId}/daily_stock`, {
    method: "PUT",
    headers: {
      ...authHeaderOnly(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ available }),
  });

  if (!res.ok) throw new Error("Daily stock update failed");
  return res.json();
}

// ====================
// ADD STOCK (new API)
// ====================
type AddStockPayload = {
  quantity: number;
  date?: string; // YYYY-MM-DD
  operation?: "add" | "set"; // default add
};

export async function addProductStock(
  productId: number,
  payload: AddStockPayload
) {
  const res = await fetch(`${API_URL}/api/products/${productId}/add_stock`, {
    method: "POST",
    headers: {
      ...authHeaderOnly(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error("Add stock failed");
  return res.json();
}