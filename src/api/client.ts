const API_URL = "http://localhost:3001";

export async function apiFetch(
  path: string,
  options: RequestInit = {}
) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include", // ⭐ CỰC KỲ QUAN TRỌNG (session)
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "API error");
  }

  return data;
}
