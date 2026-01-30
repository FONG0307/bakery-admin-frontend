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
  address?: string;
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

export async function getOrders(page = 1, perPage = 10) {
  const res = await fetch(
    `${API_URL}/api/orders?page=${page}&per_page=${perPage}`,
    {
      headers: authHeader(),
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch orders");
  }

  return res.json();
}

// src/lib/order.ts
export async function getOrdersPaginated(params: {
  page?: number;
  per_page?: number;
  q?: string;
  status?: string;
}) {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined) as any
  ).toString();

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/orders?${qs}`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );

  const json = await res.json();
  if (!res.ok) throw new Error("Fetch orders failed");

  return {
    data: json.orders,
    meta: json.meta,
  };
}


export async function getMyOrders(page = 1, perPage = 10) {
  const res = await fetch(
    `${API_URL}/api/my/orders?page=${page}&per_page=${perPage}`,
    {
      headers: authHeader(),
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch my orders");
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

export async function getOrder(orderId: number) {
  const res = await fetch(`${API_URL}/api/orders/${orderId}`, {
    headers: authHeader(),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch order");
  }
  return res.json();
}

export async function deleteOrder(orderId: number) {
  const res = await fetch(`${API_URL}/api/orders/${orderId}`, {
    method: "DELETE",
    headers: authHeader(),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to delete order");
  }
}

// ====================
// Stripe Checkout
// ====================
export async function createStripeCheckout(orderId: number) {
  const res = await fetch(
    `${API_URL}/api/orders/${orderId}/create_stripe_checkout`,
    {
      method: "POST",
      headers: authHeader(),
    }
  );

  if (!res.ok) {
    const errTxt = await res.text().catch(() => "");
    console.error("createStripeCheckout error:", errTxt);
    throw new Error("Failed to create Stripe checkout session");
  }

  return res.json();
}

export function createOrderFromCart() {
  const token = localStorage.getItem("token");

  return fetch(`${API_URL}/api/orders/from_cart`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  }).then((res) => {
    if (!res.ok) throw new Error("ORDER_FAILED");
    return res.json();
  });
}