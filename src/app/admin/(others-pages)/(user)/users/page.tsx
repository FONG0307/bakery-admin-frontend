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
    if (!confirm("Are you sure you want to delete this user?")) return;
    await deleteUser(id);
    setUsers((prev) => prev.filter((u) => u.id !== id));
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white pt-4 dark:border-gray-800 dark:bg-gray-900">
      {/* HEADER */}
      <div className="mb-4 flex items-center justify-between px-5 sm:px-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          User Management
        </h3>

        <button
          onClick={() => setOpenAdd(true)}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          + Add User
        </button>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto px-5 sm:px-6">
        <table className="min-w-full">
          <thead className="border-y border-gray-100 dark:border-gray-800">
            <tr>
              <th className="py-3 text-left text-sm text-gray-500">
                User
              </th>
              <th className="py-3 text-left text-sm text-gray-500">
                Role
              </th>
              <th className="py-3 text-right text-sm text-gray-500">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {users.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-8 text-center text-gray-400">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  {/* USER + AVATAR */}
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={u.avatar_url || "../images/user/avatar-placeholder.png"}
                        alt="avatar"
                        className="h-8 w-8 rounded-full object-cover"
                        
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-white">
                          {u.first_name || u.email}
                        </p>
                        <p className="text-xs text-gray-500">{u.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* ROLE */}
                  <td className="py-4 text-sm text-gray-700 dark:text-gray-300">
                    {u.role}
                  </td>

                  {/* ACTIONS */}
                  <td className="py-4 text-right">
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

      {/* MODALS */}
      <AddUserModal
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        onCreated={(user) => setUsers((prev) => [...prev, user])}
      />

      {editingUser && (
        <EditUserModal
          open
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
