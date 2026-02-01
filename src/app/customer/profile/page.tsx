"use client";

import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { updateMeWithProgress } from "@/lib/users.upload";
import { useToast } from "@/context/ToastContext";
import { getMe } from "@/lib/auth";

export default function Profile() {
  const { user, loading, setUser } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const { showProgress, hideToast, showSuccess, showError } = useToast();
  const uploadToastId = useRef<number | null>(null);

  // file + preview
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // form
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

  /* ================= AUTH GUARD ================= */
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/signin");
    }
  }, [loading, user, router]);

  /* ================= INIT FORM ================= */
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
  }, [user]);

  /* ================= FILE ================= */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleAvatarClick = () => {
    if (editing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  /* ================= POLLING ================= */
  async function waitForNewAvatar(oldUrl?: string) {
    const maxTries = 12;      // ~24s
    const interval = 2000;

    for (let i = 0; i < maxTries; i++) {
      await new Promise((r) => setTimeout(r, interval));
      try {
        const res = await getMe();
        const newUrl = res.user?.avatar_url ?? res.avatar_url;
        if (newUrl && newUrl !== oldUrl) {
          return res.user ?? res;
        }
      } catch {
        // ignore
      }
    }
    return null;
  }

  /* ================= SAVE ================= */
  async function handleSave() {
    try {
      setSaving(true);

      const oldAvatarUrl = user?.avatar_url;
      uploadToastId.current = Date.now();

      await updateMeWithProgress(
        {
          first_name: form.first_name,
          last_name: form.last_name,
          phone: form.phone,
          bio: form.bio,
          country: form.country,
          city: form.city,
          state: form.state,
          postal_code: form.postal_code,
          tax_id: form.tax_id,
        },
        selectedFile ?? undefined,
        (percent) => {
          if (!uploadToastId.current) return;
          showProgress(
            uploadToastId.current,
            `Uploading avatar… ${percent}%`,
            percent
          );
        }
      );

      if (uploadToastId.current) {
        hideToast(uploadToastId.current);
        uploadToastId.current = null;
      }

      // 🔥 ĐỢI AVATAR MỚI THẬT SỰ
      const freshUser = await waitForNewAvatar(oldAvatarUrl);

      if (freshUser) {
        setUser(freshUser);
        setForm((prev) => ({
          ...prev,
          avatar_url: freshUser.avatar_url,
        }));
      }

      // chỉ clear preview KHI avatar thật đã sẵn sàng
      setPreviewUrl(null);
      setSelectedFile(null);

      setEditing(false);
      showSuccess("Profile updated successfully");
    } catch (e) {
      console.error(e);
      showError("Upload failed");
    } finally {
      setSaving(false);
    }
  }

  /* ================= CLEANUP ================= */
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-Sky_Whisper pt-20">
        <div className="text-sm uppercase font-medium border-4 p-4 bg-white">
          Loading profile...
        </div>
      </div>
    );
  }

  const displayAvatar =
    previewUrl ||
    form.avatar_url ||
    `https://ui-avatars.com/api/?name=${form.first_name || "User"}&background=random&size=128`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-Sky_Whisper border-x-8 border-b-8 pt-24 pb-10 px-4 md:pt-32">
      <div className="w-full max-w-4xl bg-white border-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 md:p-10">
        <div className="flex flex-col items-center mb-10">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          <div
            className={`relative group mb-4 ${
              editing ? "cursor-pointer" : ""
            }`}
            onClick={handleAvatarClick}
          >
            {saving && (
              <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center z-10">
                <svg
                  className="animate-spin h-8 w-8 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
              </div>
            )}
            {/* 🔥 KEY QUYẾT ĐỊNH */}
            <img
              src={displayAvatar}
              alt="Profile"
              className={`w-32 h-32 rounded-full border-4 object-cover bg-gray-200 transition-all ${
                editing ? "group-hover:opacity-75" : ""
              }`}
            />
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
          <div className="flex justify-end gap-4 border-t-4 border-gray-200 pt-6">
            {editing ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setPreviewUrl(null);
                    setSelectedFile(null);
                    setForm((prev) => ({
                      ...prev,
                      avatar_url: user.avatar_url ?? "",
                    }));
                  }}
                  className="border-4 border-black bg-white px-6 py-3 text-sm uppercase font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="border-4 border-black bg-green-400 px-8 py-3 text-sm uppercase font-medium disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="px-8 py-3 text-sm uppercase font-medium border-4 border-black bg-yellow-400"
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