const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export function updateMeWithProgress(
  data: Record<string, any>,
  avatar?: File,
  onProgress?: (percent: number) => void
): Promise<any> {
  return new Promise((resolve, reject) => {
    const token = localStorage.getItem("token");
    if (!token) {
      reject(new Error("Unauthorized"));
      return;
    }

    const xhr = new XMLHttpRequest();
    const fd = new FormData();

    // ✅ GIỐNG Y HỆT updateMe CŨ
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        fd.append(key, String(value));
      }
    });

    if (avatar) {
      fd.append("avatar", avatar);
    }

    // ✅ URL PHẢI GIỐNG
    xhr.open("PATCH", `${API_BASE}/api/me`);

    xhr.setRequestHeader(
      "Authorization",
      `Bearer ${token}`
    );

    // ✅ PROGRESS
    xhr.upload.onprogress = (e) => {
      if (!e.lengthComputable) return;
      const percent = Math.round((e.loaded / e.total) * 100);
      onProgress?.(percent);
    };

    xhr.onload = () => {
      let json: any = {};

      try {
        json = xhr.responseText
          ? JSON.parse(xhr.responseText)
          : {};
      } catch {
        reject({
          status: xhr.status,
          message: "INVALID_JSON",
          raw: xhr.responseText,
        });
        return;
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        // ✅ GIỐNG updateMe: return payload.user
        resolve(json.user ?? json);
      } else {
        reject({
          status: xhr.status,
          error:
            json.errors?.join(", ") ||
            json.error ||
            "Update profile failed",
        });
      }
    };

    xhr.onerror = () => {
      reject({
        status: 0,
        error: "NETWORK_ERROR",
      });
    };

    xhr.send(fd);
  });
}
