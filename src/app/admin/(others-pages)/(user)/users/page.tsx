"use client";

import { useEffect, useState } from "react";
import { getUsers, deleteUser } from "@/lib/users";
import AddUserModal from "@/components/admin/AddUserModel";
import EditUserModal from "@/components/admin/EditUserModal";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [openAdd, setOpenAdd] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);

  useEffect(() => {
    getUsers().then(setUsers);
  }, []);

  async function handleDelete(id: number) {
    const ok = confirm("Are you sure you want to delete this user?");
    
    if (!ok) return;
    
    await deleteUser(id);
    setUsers((prev) => prev.filter((u) => u.id !== id));
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow dark:bg-gray-900">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
          User Management
        </h1>
        <button
          onClick={() => setOpenAdd(true)}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          + Add User
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase">
                Email
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase">
                Role
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {users.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-4 py-3 text-sm">{u.email}</td>
                  <td className="px-4 py-3 text-sm">{u.role}</td>

                  {/* ACTIONS */}
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => setEditingUser(u)}
                        className="rounded-lg bg-blue-50 px-3 py-1 text-xs text-blue-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(u.id)}
                        className="rounded-lg bg-red-50 px-3 py-1 text-xs text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      <AddUserModal
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        onCreated={(newUser) => setUsers((prev) => [...prev, newUser])}
      />

      {editingUser && (
        <EditUserModal
          open={!!editingUser}
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onUpdated={(updated) =>
            setUsers((prev) =>
              prev.map((u) => (u.id === updated.id ? updated : u))
            )
          }
        />
      )}
    </div>
  );
}
