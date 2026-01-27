"use client";

import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { updateMe } from "@/lib/users";

// --- HÀM GIẢ LẬP UPLOAD ẢNH (BẠN CẦN THAY THẾ BẰNG LOGIC THẬT) ---
// Hàm này nhận vào một File, upload lên server và trả về URL string.
async function uploadAvatarImage(file: File): Promise<string> {
  console.log("Đang upload file...", file.name);
  // TODO: Thay thế đoạn này bằng code upload thật lên Firebase/S3/Cloudinary...
  // Ví dụ giả lập delay 1 giây rồi trả về một URL tạm
  await new Promise(resolve => setTimeout(resolve, 1000));

  // LƯU Ý: URL.createObjectURL chỉ là URL tạm thời trên trình duyệt này.
  // Bạn cần trả về URL thực tế từ server lưu trữ của bạn.
  return URL.createObjectURL(file); 
}
// ------------------------------------------------------------------


export default function Profile() {
  const { user, loading, setUser } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // State để lưu file ảnh mới chọn và URL preview cục bộ
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    bio: "",
    country: "",
    city: "",
    state: "",
    postal_code: "",
    avatar_url: "",
    tax_id: "",
  });

  /* ===== AUTH GUARD ===== */
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/signin");
    }
  }, [loading, user, router]);

  /* ===== INIT FORM ===== */
  useEffect(() => {
    if (!user) return;
    setForm({
      first_name: user.first_name ?? "",
      last_name: user.last_name ?? "",
      phone: user.phone ?? "",
      bio: user.bio ?? "",
      country: user.country ?? "",
      city: user.city ?? "",
      state: user.state ?? "",
      postal_code: user.postal_code ?? "",
      avatar_url: user.avatar_url ?? "",
      tax_id: user.tax_id ?? "",
    });
    setPreviewUrl(null); // Reset preview khi load lại user gốc
    setSelectedFile(null);
  }, [user]);

  /* ===== XỬ LÝ CHỌN FILE ẢNH ===== */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Tạo URL preview cục bộ ngay lập tức để người dùng thấy ảnh đã chọn
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleAvatarClick = () => {
    if (editing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  /* ===== SAVE ===== */
  async function handleSave() {
    try {
      setSaving(true);
      let finalAvatarUrl = form.avatar_url;

      if (selectedFile) {
        finalAvatarUrl = await uploadAvatarImage(selectedFile);
      }

      await updateMe({
        ...form,
        avatar_url: finalAvatarUrl,
      });

      // 🔥 FIX QUAN TRỌNG
      await router.refresh(); // refresh server data (Next 13+)
      
      setEditing(false);
      setSelectedFile(null);
      setPreviewUrl(null);

    } catch (error) {
      console.error(error);
      alert("Cập nhật thông tin thất bại.");
    } finally {
      setSaving(false);
    }
  }


  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-Sky_Whisper pt-20">
        <div className="text-sm uppercase font-medium border-4 p-4 bg-white">Loading profile...</div>
      </div>
    );
  }

  // Logic hiển thị ảnh: Ưu tiên ảnh preview vừa chọn -> ảnh hiện tại trong form -> ảnh mặc định
  const displayAvatar = previewUrl || form.avatar_url || "https://ui-avatars.com/api/?name=" + (form.first_name || "User") + "&background=random&size=128";

  return (
    // SỬA LỖI LAYOUT: Thêm pt-24 md:pt-32 để đẩy nội dung xuống khỏi header
    <div className="min-h-screen flex items-center justify-center bg-Sky_Whisper border-x-8 border-b-8 pt-24 pb-10 px-4 md:pt-32">
      <div className="w-full max-w-4xl bg-white border-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 md:p-10">
        
        {/* HEADER & AVATAR UPLOAD */}
        <div className="flex flex-col items-center mb-10">
          {/* Input file ẩn */}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            className="hidden" 
          />

          <div 
            className={`relative group mb-4 ${editing ? 'cursor-pointer' : ''}`}
            onClick={handleAvatarClick}
            title={editing ? "Click to upload new image" : ""}
          >
             {/* Avatar Image */}
            <img 
              src={displayAvatar} 
              alt="Profile" 
              className={`w-32 h-32 rounded-full border-4 object-cover bg-gray-200 transition-all ${editing ? 'group-hover:opacity-75' : ''}`}
            />
            
            {/* Overlay icon máy ảnh khi ở chế độ edit */}
            {editing && (
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            )}
          </div>

          <h1 className="text-2xl md:text-3xl uppercase font-normal tracking-tight text-center mb-1">
            {user.first_name} {user.last_name}
          </h1>
        </div>

        <form className="space-y-8">
          
          {/* SECTION: PERSONAL INFO */}
          <section>
            {/* TYPOGRAPHY FIX: Uppercase, smaller font, not bold */}
            <h3 className="text-sm uppercase font-medium tracking-wider border-b-4 border-black inline-block mb-6 pr-4">Personal Info</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field label="First name">
                <Input 
                  value={form.first_name} 
                  disabled={!editing}
                  onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                />
              </Field>
              <Field label="Last name">
                <Input 
                  value={form.last_name} 
                  disabled={!editing}
                  onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                />
              </Field>
              
              <Field label="Email" className="md:col-span-1">
                <Input 
                  value={user.email ?? ""} 
                  disabled={true}
                  className="bg-gray-100 cursor-not-allowed text-gray-500"
                />
              </Field>
              <Field label="Phone">
                <Input 
                  value={form.phone} 
                  disabled={!editing}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </Field>
              <Field label="Tax ID">
                <Input
                  value={form.tax_id}
                  disabled={!editing}
                  onChange={(e) =>
                    setForm({ ...form, tax_id: e.target.value })
                  }
                />
              </Field>

            </div>
          </section>

          {/* SECTION: ADDRESS */}
          <section>
             <h3 className="text-sm uppercase font-medium tracking-wider border-b-4 border-black inline-block mb-6 pr-4">Address</h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Field label="Country" className="md:col-span-3">
                  <Input 
                    value={form.country} 
                    disabled={!editing}
                    onChange={(e) => setForm({ ...form, country: e.target.value })}
                  />
                </Field>
                <Field label="City">
                  <Input 
                    value={form.city} 
                    disabled={!editing}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                  />
                </Field>
                <Field label="State / Province">
                  <Input 
                    value={form.state} 
                    disabled={!editing}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                  />
                </Field>
                <Field label="Postal Code">
                  <Input 
                    value={form.postal_code} 
                    disabled={!editing}
                    onChange={(e) => setForm({ ...form, postal_code: e.target.value })}
                  />
                </Field>
             </div>
          </section>

          {/* SECTION: ABOUT */}
          <section>
            <h3 className="text-sm uppercase font-medium tracking-wider border-b-4 border-black inline-block mb-6 pr-4">About Me</h3>
            <Field label="Bio">
              {/* TYPOGRAPHY FIX for Textarea */}
              <textarea
                value={form.bio}
                disabled={!editing}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                rows={4}
                className={`border-4 w-full px-4 py-3 resize-none text-sm font-normal outline-none transition-all
                  ${!editing ? "bg-gray-100 border-gray-300 text-gray-500" : "bg-white focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"}
                `}
              />
            </Field>
          </section>

          {/* ACTIONS */}
          <div className="pt-6 flex justify-end gap-4 border-t-4 border-gray-200 mt-8">
            {editing ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    // Reset form và các state file tạm
                    setForm(prev => ({...prev, ...user, avatar_url: user.avatar_url ?? ""}));
                    setSelectedFile(null);
                    setPreviewUrl(null);
                  }}
                  className="border-4 border-black bg-white px-6 py-3 text-sm uppercase font-medium hover:bg-gray-100 active:translate-y-1 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="border-4 border-black bg-green-400 px-8 py-3 text-sm uppercase font-medium shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:bg-green-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="px-8 py-3 text-sm uppercase font-medium border-4 border-black bg-yellow-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
              >
                Edit Profile
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

/* ===== Reusable Components ===== */

// TYPOGRAPHY FIX: Label nhỏ hơn, uppercase, không bold
function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex flex-col ${className}`}>
      <label className="text-xs uppercase font-medium tracking-wider mb-2 text-gray-700">{label}</label>
      {children}
    </div>
  );
}

// TYPOGRAPHY FIX: Input text nhỏ hơn, không bold
function Input({ disabled, className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      disabled={disabled}
      className={`
        border-4 w-full h-11 px-4 text-sm font-normal outline-none transition-all
        ${disabled 
          ? "bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed" 
          : "bg-white border-black focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:-translate-y-1"
        }
        ${className}
      `}
    />
  );
}