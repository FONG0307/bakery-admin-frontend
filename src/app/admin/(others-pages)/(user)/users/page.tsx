"use client";

import { useEffect, useState } from "react";
import { getUsers,deleteUser} from "@/lib/users";
import AddUserModal from "@/components/admin/AddUserModel";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [openAdd, setOpenAdd] = useState(false);

  useEffect(() => {
    console.log("🔥 USERS PAGE MOUNTED");
  
    getUsers().then((data) => {
      console.log("🔥 USERS API DATA:", data);
      setUsers(Array.isArray(data) ? data : data?.users || []);
    });
  }, []);

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow">
      <h1 className="text-xl font-semibold mb-4">User Management</h1>
      <button
            onClick={() => setOpenAdd(true)}
            className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
        >
            + Add User
        </button>
        <AddUserModal
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        onCreated={(newUser) => setUsers((prev) => [...prev, newUser])}
        />
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-800">
            <th className="p-2 text-left">Email</th>
            <th className="p-2 text-left">Role</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 && (
            <tr>
              <td colSpan={3} className="p-4 text-center">
                No users
              </td>
            </tr>
          )}

          {users.map((u) => (
            <tr key={u.id} className="border-b">
              <td className="p-2">{u.email}</td>
              <td className="p-2">{u.role}</td>
              <td className="p-2 text-center">
                <button
                  onClick={() =>
                    deleteUser(u.id).then(() =>
                      setUsers(users.filter((x) => x.id !== u.id))
                    )
                  }
                  className="text-red-500 hover:underline"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
