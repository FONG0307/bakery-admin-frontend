"use client";

import { deleteUser, getUsers } from "@/lib/users";
import AddUserModal from "@/components/admin/AddUserModel";
import EditUserModal from "@/components/admin/EditUserModal";
import { usePaginatedFetch } from "@/hooks/usePaginatedFetch";
import { useState } from "react";

export default function UsersPage() {
  const {
    data: users,
    meta,
    loading,

    page,
    perPage,
    search,

    setPage,
    setPerPage,
    setSearch,
    reload,
  } = usePaginatedFetch(getUsers);

  const [openAdd, setOpenAdd] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);

  async function handleDelete(id: number) {
    if (!confirm("Delete this user?")) return;
    await deleteUser(id);
    reload(); // 🔥 debounce-safe reload
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
        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
          <span>Show</span>
          <select
            value={perPage}
            onChange={(e) => {
              setPerPage(Number(e.target.value));
              setPage(1); // reset về trang 1
            }}
            className="rounded-md border px-2 py-1 text-sm dark:bg-gray-800"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={15}>15</option>
          </select>
          <span>users</span>
        </div>

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
          
      {/* PAGINATION */}
      <div className="flex justify-between px-5 py-4">
        <span className="text-sm">
          Page {meta.page} / {meta.total_pages}
        </span>

        <div className="flex gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded border px-3 py-1 text-sm disabled:opacity-50"
          >
            Prev
          </button>
          <button
            disabled={page >= meta.total_pages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded border px-3 py-1 text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>


      {/* MODALS */}
      <AddUserModal
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        onCreated={reload}
      />

      {editingUser && (
        <EditUserModal
          open
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onUpdated={reload}
        />
      )}
    </div>
  );
}
