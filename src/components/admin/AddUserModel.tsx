"use client";

import React, {  useState } from "react";
import { createUser } from "@/lib/users";
import { useRouter } from "next/navigation";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: (user: any) => void;
};

export default function AddUserModal({ open, onClose, onCreated }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const[success, setSuccess] = useState(false);
  const router = useRouter();
  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
  
    try {
      const res = await createUser({ email, password, role });
  
      onCreated(res.user); // refresh list
      setSuccess(true);    // ✅ chỉ set khi thành công
  
      // reset form (OK làm ở đây)
      setEmail("");
      setPassword("");
      setRole("user");
    } catch (err: any) {
      setError(err.message || "Create user failed");
    } finally {
      setLoading(false);
    }
  }
  

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-xl bg-white dark:bg-gray-900 p-6 shadow-lg">
        <h2 className="text-lg font-semibold mb-4">Add User</h2>

        {error && (
          <div className="mb-3 rounded bg-red-100 text-red-700 px-3 py-2 text-sm">
            {error}
          </div>
        )}
        {success && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-lg dark:bg-gray-900">
                <h2 className="mb-2 text-lg font-semibold">
                    🎉 Thành công
                </h2>
                <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                    User đã được tạo thành công.
                </p>

                <button
                    onClick={() => {
                    setSuccess(false);
                    onClose();
                    }}
                    className="w-full rounded-lg bg-brand-500 px-4 py-2 text-white hover:bg-brand-600"
                >
                    OK
                </button>
                </div>
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded border px-3 py-2 dark:bg-gray-800"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded border px-3 py-2 dark:bg-gray-800"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded border px-3 py-2 dark:bg-gray-800"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded border"
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create"}
              
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
