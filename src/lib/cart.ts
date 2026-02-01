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

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Request failed");
  }

  return res.json();
}

export function getCart() {
  return fetchJSON("/api/cart");
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
