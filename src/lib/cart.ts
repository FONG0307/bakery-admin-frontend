// src/lib/cart.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function fetchJSON(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}${url}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });

  if (res.status === 401) {
  // 🔥 Chưa login / token invalid → KHÔNG throw error
    return null;
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Request failed");
  }

  return res.json();
}

export function getCart() {
  // ensure we always fetch the latest cart after server-side changes
  return fetchJSON("/api/cart", { cache: "no-store" } as RequestInit);
}

export function addToCart(payload: {
  product_id: number;
  quantity: number;
  size?: string | null;
}) {
  return fetchJSON("/api/cart/add_item", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateCartItem(itemId: number, quantity: number) {
  return fetchJSON(`/api/cart/items/${itemId}`, {
    method: "PATCH",
    body: JSON.stringify({ quantity }),
  });
}

export function removeCartItem(itemId: number) {
  return fetchJSON(`/api/cart/items/${itemId}`, {
    method: "DELETE",
  });
}
export function applyVoucher(code: string) {
  return fetchJSON("/api/cart/apply-voucher", {
    method: "POST",
    body: JSON.stringify({ code }),
  });
}
