"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/context/ToastContext";

type Props = {
  open: boolean;
  user: any;
  onClose: () => void;
  onUpdated: (user: any) => void;
};

export default function EditUserModal({
  open,
  user,
  onClose,
  onUpdated,
}: Props) {
  /* ===== HOOKS ===== */
  const { showSuccess, showError } = useToast();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    role: "",
    phone: "",
    password: "",
    password_confirmation: "",
  });

  const [avatar, setAvatar] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  /* ===== INIT ===== */
  useEffect(() => {
    if (!open || !user) return;

    setForm({
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      email: user.email || "",
      role: user.role || "user",
      phone: user.phone || "",
      password: "",
      password_confirmation: "",
    });

    setPreview(user.avatar_url || null);
    setAvatar(null);
  }, [user, open]);

  function updateField(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  /* ===== SUBMIT ===== */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) return showError("Unauthorized");

    const fd = new FormData();

    fd.append("user[first_name]", form.first_name);
    fd.append("user[last_name]", form.last_name);
    fd.append("user[email]", form.email);
    fd.append("user[role]", form.role);
    fd.append("user[phone]", form.phone);

    if (form.password) {
      fd.append("user[password]", form.password);
      fd.append("user[password_confirmation]", form.password_confirmation);
    }

    if (avatar) {
      fd.append("avatar", avatar);
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/${user.id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: fd,
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.errors?.join(", ") || "Update failed");
      }

      showSuccess("User updated successfully ✅");
      onUpdated(data);
      onClose();
    } catch (err: any) {
      showError(err.message || "Update failed");
    }
  }

  if (!open) return null;

  /* ===== UI ===== */
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-2xl rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        {/* HEADER */}
        <div className="px-5 py-4 border-b dark:border-gray-800">
          <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
            Edit User
          </h3>
        </div>

        {/* BODY */}
        <form
          onSubmit={handleSubmit}
          className="space-y-6 p-5 sm:p-6"
        >
          {/* AVATAR */}
          <div className="flex items-center gap-4">
            <img
              src={
                preview ||
                user.avatar_url ||
                "/images/user/avatar-placeholder.png"
              }
              className="h-16 w-16 rounded-full object-cover border"
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setAvatar(file);
                setPreview(URL.createObjectURL(file));
              }}
            />
          </div>

          {/* PERSONAL INFO */}
          <div className="-mx-2.5 flex flex-wrap gap-y-5">
            <InputBlock
              label="First Name"
              value={form.first_name}
              onChange={(v: string) => updateField("first_name", v)}
            />

            <InputBlock
              label="Last Name"
              value={form.last_name}
              onChange={(v: string) => updateField("last_name", v)}
            />

            <InputBlock
              full
              label="Email"
              value={form.email}
              onChange={(v: string) => updateField("email", v)}
            />

            <InputBlock
              label="Phone"
              value={form.phone}
              onChange={(v: string) => updateField("phone", v)}
            />

            <SelectBlock
              label="Role"
              value={form.role}
              onChange={(v: string) => updateField("role", v)}
              options={[
                { label: "Admin", value: "admin" },
                { label: "Staff", value: "staff" },
                { label: "User", value: "user" },
              ]}
            />
          </div>

          {/* PASSWORD */}
          <div className="border-t pt-4 dark:border-gray-800">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Change password (optional)
            </p>
          </div>

          <div className="-mx-2.5 flex flex-wrap gap-y-5">
            <InputBlock
              type="password"
              label="New password"
              value={form.password}
              onChange={(v: string) => updateField("password", v)}
            />

            <InputBlock
              type="password"
              label="Confirm password"
              value={form.password_confirmation}
              onChange={(v: string) =>
                updateField("password_confirmation", v)
              }
            />
          </div>

          {/* ACTIONS */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border px-4 py-2 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ===== REUSABLE INPUTS ===== */
function InputBlock({
  label,
  value,
  onChange,
  type = "text",
  full,
}: any) {
  return (
    <div className={`w-full px-2.5 ${full ? "" : "xl:w-1/2"}`}>
      <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
      />
    </div>
  );
}

function SelectBlock({
  label,
  value,
  onChange,
  options,
}: any) {
  return (
    <div className="w-full px-2.5 xl:w-1/2">
      <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
      >
        {options.map((o: any) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
