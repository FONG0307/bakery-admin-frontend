"use client";

import { useEffect, useState } from "react";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import { createUser } from "@/lib/users";
import { useToast } from "@/context/ToastContext";


type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: (user: any) => void;
};
type UserRole = "admin" | "staff" | "user";
export default function AddUserModal({ open, onClose, onCreated }: Props) {
  const { showSuccess, showError } = useToast();

 const [form, setForm] = useState<{
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    role: UserRole;
    password: string;
    password_confirmation: string;
  }>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    role: "staff",
    password: "",
    password_confirmation: "",
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔥 Reset form mỗi lần mở modal
  useEffect(() => {
    if (!open) return;

    setForm({
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      role: "staff",
      password: "",
      password_confirmation: "",
    });
    setError(null);
  }, [open]);

  function updateField<K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit() {
    setLoading(true);
    setError(null);

    if (form.password !== form.password_confirmation) {
      setError("Password confirmation does not match");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        email: form.email,
        role: form.role,
        first_name: form.first_name,
        last_name: form.last_name,
        phone: form.phone,
        password: form.password,
        password_confirmation: form.password_confirmation,
      };
      
      const res = await createUser(payload);
      showSuccess("User created successfully");
      onCreated(res);
      onClose();
    } catch (err: any) {
      showError(err.message || "Create user failed");
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow dark:bg-gray-900">
        <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">
          Add User
        </h2>

        {error && (
          <div className="mb-4 rounded bg-red-100 px-3 py-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Field label="First name">
            <Input
              placeholder="First name"
              onChange={(e) => updateField("first_name", e.target.value)}
            />
          </Field>

          <Field label="Last name">
            <Input
              placeholder="Last name"
              onChange={(e) => updateField("last_name", e.target.value)}
            />
          </Field>

          <div className="col-span-2">
            <Field label="Email address">
              <Input
                type="email"
                placeholder="Email address"
                onChange={(e) => updateField("email", e.target.value)}
              />
            </Field>
          </div>

          <Field label="Phone number">
            <Input
              placeholder="Phone number"
              onChange={(e) => updateField("phone", e.target.value)}
            />
          </Field>

          <Field label="Role">
            <Select
              placeholder="Select role"
              options={[
                { label: "Admin", value: "admin" , },
                { label: "Staff", value: "staff" },
                { label: "Customer", value: "user" },
              ]}
              onChange={(value) => updateField("role", value)}
            />
          </Field>

          {/* PASSWORD */}
          <div className="col-span-2 mt-4 border-t pt-4">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Set password
            </p>
          </div>

          <Field label="Password">
            <Input
              type="password"
              placeholder="Password"
              onChange={(e) => updateField("password", e.target.value)}
            />
          </Field>

          <Field label="Confirm password">
            <Input
              type="password"
              placeholder="Confirm password"
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
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create User"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- HELPER ---------- */
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
