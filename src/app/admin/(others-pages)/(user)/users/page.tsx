"use client";

import { useEffect, useState } from "react";
import { getUsers,deleteUser} from "@/lib/users";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUsers()
      .then((data) => {
        setUsers(Array.isArray(data) ? data : []);
      })
      .finally(() => setLoading(false));
  }, []);
  
  

  if (loading) return <p>Loading...</p>;

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow">
      <h1 className="text-xl font-semibold mb-4">User Management</h1>

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
