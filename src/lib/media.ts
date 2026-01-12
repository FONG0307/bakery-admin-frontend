const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function uploadMedia(file: File) {
  const token = localStorage.getItem("token");

  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_URL}/api/media`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(text);
    throw new Error("Upload failed");
  }

  return res.json();
}

export async function fetchMedia(type: "video" | "image") {
  const token = localStorage.getItem("token");

  const res = await fetch(
    `${API_URL}/api/media?type=${type}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  console.log(res);
  const text = await res.text();
  try {
    const data = JSON.parse(text);
    console.log("PARSED JSON:", data);
    return data;
  } catch (e) {
    console.error("❌ Response không phải JSON");
    throw new Error("Invalid JSON response");
  }
}

