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

// src/lib/product.ts
export async function getProductsPaginated(params: {
  page?: number;
  per_page?: number;
  q?: string;
}) {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined) as any
  ).toString();

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/products?${qs}`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );

  const json = await res.json();
  if (!res.ok) throw new Error("Fetch products failed");

  return {
    data: json.products,
    meta: json.meta,
  };
}


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
export async function getProductsPublic(
  params: {
    page?: number;
    per_page?: number;
    category?: string;
    subcategory?: string;
    q?: string;
  } = {} // 👈 QUAN TRỌNG
) {
  const qs = new URLSearchParams(
    Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== null)
      .map(([k, v]) => [k, String(v)])
  ).toString();

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/public/products${qs ? `?${qs}` : ""}`,
    { cache: "no-store" }
  );

  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}


export async function getProductPublicBySlug(slug: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/public/products/slug/${slug}`,
    { cache: "no-store" }
  );

  if (!res.ok) throw new Error("Product not found");
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
  const token = localStorage.getItem("token");
  
  const res = await fetch(`${API_URL}/api/products/${id}`, {
    method: "PATCH",
    headers: token
      ? { Authorization: `Bearer ${token}` }
      : undefined,
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
export async function getCategories() {
  const res = await fetch(`${API_URL}/api/categories`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  if (!res.ok) throw new Error("Failed to load categories");
  return res.json();
}

export async function getSubcategories() {
  const res = await fetch(`${API_URL}/api/subcategories`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  if (!res.ok) throw new Error("Failed to load subcategories");
  return res.json();
}