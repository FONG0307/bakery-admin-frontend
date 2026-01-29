// src/lib/cart.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/* =========================
   TYPES
========================= */

export interface AddToCartPayload {
  product_id: number;
  quantity: number;
  size?: string | null;
}

export interface CartItem {
  id: number;
  product_id: number;
  name: string;
  image: string | null;
  price: number;
  size?: string | null;
  quantity: number;
}

export interface CartResponse {
  items: CartItem[];
}

/* =========================
   HELPER
========================= */
async function fetchJSON(
  url: string,
  options: RequestInit = {}
) {
  const res = await fetch(`${API_URL}${url}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error("UNAUTHORIZED");
    }

    const error = await res.text();
    throw new Error(error || "Request failed");
  }

  return res.json();
}

/* =========================
   API CALLS
========================= */

/**
 * Lấy cart hiện tại
 * GET /api/cart
 */
export function getCart(): Promise<CartResponse> {
  return fetchJSON("/api/cart", {
    method: "GET",
  });
}

/**
 * Thêm sản phẩm vào cart
 * POST /api/cart/add
 */
export function addToCart(
  payload: AddToCartPayload
): Promise<CartResponse> {
  return fetchJSON("/api/cart/add", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Xoá item khỏi cart (nếu backend có)
 */
export function removeFromCart(product_id: number): Promise<CartResponse> {
  return fetchJSON("/api/cart", {
    method: "DELETE",
    body: JSON.stringify({ product_id }),
  });
}

/**
 * Update số lượng (nếu backend có)
 */
export function updateCartItem(
  itemId: number,
  quantity: number
): Promise<CartResponse> {
  return fetchJSON(`/api/cart/items/${itemId}`, {
    method: "PATCH",
    body: JSON.stringify({ quantity }),
  });
}
