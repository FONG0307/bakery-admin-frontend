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

const ROLE_OPTIONS = [
  { label: "Admin", value: "admin" },
  { label: "Staff", value: "staff" },
  { label: "Customer", value: "user" },
] as const;

type RoleValue = typeof ROLE_OPTIONS[number]["value"];

export default function EditUserModal({
  open,
  user,
  onClose,
  onUpdated,
}: Props) {
  const [form, setForm] = useState({
    email: "",
    role: "",
    first_name: "",
    last_name: "",
    phone: "",
    password: "",
    password_confirmation: "",
  });

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
  }, [user, open]);

  function updateField(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit() {
    const { showSuccess, showError } = useToast();
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Unauthorized");
      return;
    }

    const payload: any = {
      email: form.email,
      role: form.role,
      first_name: form.first_name,
      last_name: form.last_name,
      phone: form.phone,
    };

    // 🔐 chỉ gửi password nếu có nhập
    if (form.password) {
      payload.password = form.password;
      payload.password_confirmation = form.password_confirmation;
    }

    const res = await fetch(
      `http://localhost:3001/api/users/${user.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // 🔥 DÒNG QUYẾT ĐỊNH
        },
        body: JSON.stringify({ user: payload }), // 🔥 PHẢI BỌC user
      }
    );

    const data = await res.json().catch(() => ({}));
   
    if (!res.ok) {
      showError(data.errors?.join(", ") || "Update failed");
      return;
    }
    showSuccess("User updated successfully ✅");
    onUpdated(data);
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow dark:bg-gray-900">
        <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">
          Edit User
        </h2>

        <div className="grid grid-cols-2 gap-4">
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
              onChange={(value) => {
                if (value === "admin" || value === "staff" || value === "user") {
                  updateField("role", value);
                }
              }}
            />
          </Field>

          {/* PASSWORD */}
          <div className="col-span-2 mt-4 border-t pt-4">
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

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg border px-4 py-2 text-sm"
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
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </p>
      {children}
    </div>
  );
}
