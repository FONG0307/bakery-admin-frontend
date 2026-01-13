"use client";

import { useEffect, useState } from "react";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
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
    email: "",
    role: "",
    first_name: "",
    last_name: "",
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
      email: user.email || "",
      role: user.role || "",
      first_name: user.first_name || "",
      last_name: user.last_name || "",
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

  /* ===== SUBMIT (1 REQUEST) ===== */
  async function handleSubmit() {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const fd = new FormData();

      fd.append("user[email]", form.email);
      fd.append("user[role]", form.role);
      fd.append("user[first_name]", form.first_name);
      fd.append("user[last_name]", form.last_name);
      fd.append("user[phone]", form.phone);

      if (form.password) {
        fd.append("user[password]", form.password);
        fd.append(
          "user[password_confirmation]",
          form.password_confirmation
        );
      }

      if (avatar) {
        fd.append("avatar", avatar);
      }

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

      const data = await res.json().catch(() => ({}));

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-xl bg-white p-4 shadow dark:bg-gray-900">
        <h2 className="mb-3 text-base font-semibold text-gray-800 dark:text-white">
          Edit User
        </h2>

        {/* AVATAR */}
        <div className="flex items-center gap-3 mb-4">
          <img
            src={
              preview ||
              user.avatar_url ||
              "/images/user/avatar-placeholder.png"
            }
            className="h-14 w-14 rounded-full object-cover border"
          />
          <input
            type="file"
            accept="image/*"
            className="text-sm"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setAvatar(file);
              setPreview(URL.createObjectURL(file));
            }}
          />
        </div>

        {/* FORM */}
        <div className="grid grid-cols-2 gap-3">
          <Field label="First name">
            <Input
              defaultValue={form.first_name}
              onChange={(e) => updateField("first_name", e.target.value)}
            />
          </Field>

          <Field label="Last name">
            <Input
              defaultValue={form.last_name}
              onChange={(e) => updateField("last_name", e.target.value)}
            />
          </Field>

          <div className="col-span-2">
            <Field label="Email address">
              <Input
                defaultValue={form.email}
                onChange={(e) => updateField("email", e.target.value)}
              />
            </Field>
          </div>

          <Field label="Phone number">
            <Input
              defaultValue={form.phone}
              onChange={(e) => updateField("phone", e.target.value)}
            />
          </Field>

          <Field label="Role">
            <Select
              defaultValue={form.role}
              options={[
                { label: "Admin", value: "admin" },
                { label: "Staff", value: "staff" },
                { label: "Customer", value: "user" },
              ]}
              onChange={(value) => updateField("role", value)}
            />
          </Field>

          {/* PASSWORD */}
          <div className="col-span-2 mt-3 border-t pt-3">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Change password
            </p>
            <p className="text-xs text-gray-500 mb-2">
              Leave blank to keep current password
            </p>
          </div>

          <Field label="New password">
            <Input
              type="password"
              onChange={(e) => updateField("password", e.target.value)}
            />
          </Field>

          <Field label="Confirm password">
            <Input
              type="password"
              onChange={(e) =>
                updateField("password_confirmation", e.target.value)
              }
            />
          </Field>
        </div>

        {/* ACTIONS */}
        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg border px-3 py-2 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---- HELPER ---- */
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
        {label}
      </p>
      {children}
    </div>
  );
}
