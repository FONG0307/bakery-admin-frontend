"use client";

import { useEffect, useState } from "react";
import { uploadMedia, fetchMedia } from "@/lib/media";
import FileInput from "@/components/form/input/FileInput";
import Label from "@/components/form/Label";

type MediaItem = {
  id: number;
  type: "video" | "image";
  filename: string;
  size: number;
  url: string;
};

export default function AdminMediaPage() {
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState<"video" | "image">("video");
  const [items, setItems] = useState<MediaItem[]>([]);
  const [preview, setPreview] = useState<MediaItem | null>(null);
  const [loading, setLoading] = useState(false);

  async function loadMedia() {
    const data = await fetchMedia(type);
    setItems(data);
    setPreview(null);
  }

  useEffect(() => {
    loadMedia();
  }, [type]);

  async function handleUpload() {
    if (!file) return;
    setLoading(true);

    try {
      await uploadMedia(file);
      setFile(null);
      await loadMedia();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* ===== UPLOAD ===== */}
      <div className="max-w-md space-y-3">
        <Label>Upload {type}</Label>

        <select
          value={type}
          onChange={(e) => setType(e.target.value as "video" | "image")}
          className="border rounded px-2 py-1"
        >
          <option value="video">Video</option>
          <option value="image">Image</option>
        </select>

        <FileInput
          accept={type === "video" ? "video/*" : "image/*"}
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />

        <button
          disabled={!file || loading}
          onClick={handleUpload}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        >
          {loading ? "Đang upload..." : "Đăng lên"}
        </button>
      </div>

      {/* ===== MEDIA LIST ===== */}
      <div>
        <h2 className="font-semibold text-lg mb-3">
          Danh sách {type}
        </h2>

        <ul className="divide-y border rounded">
          {items.map((item) => (
            <li
              key={item.id}
              className="p-3 flex justify-between items-center cursor-pointer hover:bg-gray-50"
              onClick={() => setPreview(item)}
            >
              <div>
                <p className="font-medium">{item.filename}</p>
                <p className="text-sm text-gray-500">
                  {(item.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <span className="text-blue-600 text-sm">Xem</span>
            </li>
          ))}

          {items.length === 0 && (
            <li className="p-3 text-gray-500 text-sm">
              Chưa có file nào
            </li>
          )}
        </ul>
      </div>

      {/* ===== PREVIEW ===== */}
      {preview && (
        <div className="border rounded p-4 space-y-3">
          <h3 className="font-semibold">Preview</h3>

          {preview.type === "video" ? (
            <video
              src={preview.url}
              controls
              className="w-full max-w-xl rounded border"
              
            />
          ) : (
            <img
              src={preview.url}
              className="max-w-xl rounded border"
            />
          )}
        </div>
      )}
    </div>
  );
}
