const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function uploadVideo(file: File) {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Missing auth token");
  }

    const formData = new FormData();
    formData.append("video[file]", file);


  const res = await fetch(`${API_URL}/api/videos`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    console.error("UPLOAD ERROR:", err);
    throw new Error("Upload failed");
  }

  return res.json();
}
