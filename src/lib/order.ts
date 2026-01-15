const API_URL = process.env.NEXT_PUBLIC_API_URL;

function authHeader() {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No auth token");

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export async function createOrder(payload: {
  payment_method?: string;
  day_part?: string;
}) {
  const res = await fetch(`${API_URL}/api/orders`, {
    method: "POST",
    headers: authHeader(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error("Create order failed");
  return res.json();
}

export async function addOrderItem(
  orderId: number,
  productId: number,
  quantity: number
) {
  const res = await fetch(
    `${API_URL}/api/orders/${orderId}/order_items`,
    {
      method: "POST",
      headers: authHeader(),
      body: JSON.stringify({
        product_id: productId,
        quantity: quantity,
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    console.error("AddOrderItem error:", err);
    throw new Error("Add item failed");
  }

  return res.json();
}

export async function getOrders() {
  const res = await fetch(`${API_URL}/api/orders`, {
    headers: authHeader(),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch orders");
  }

  return res.json();
}

export async function updateOrderStatus(orderId: number, status: string) {
  const res = await fetch(`${API_URL}/api/orders/${orderId}`, {
    method: "PATCH",
    headers: {
      ...authHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to update order status");
  }

  return res.json();
}
