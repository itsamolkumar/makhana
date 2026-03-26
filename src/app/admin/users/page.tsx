"use client";

import { useEffect, useState } from "react";
import Loader from "@/components/Loader";
import toast from "react-hot-toast";
import { Search, ShieldAlert, ShieldCheck } from "lucide-react";

interface UserData {
  _id: string;
  name: string;
  email: string;
  role: string;
  isBlocked: boolean;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users?search=${debouncedSearch}`);
      const data = await res.json();
      if (data.success) {
        setUsers(data.data.users);
      } else {
        toast.error(data.message || "Failed to fetch users");
      }
    } catch (error) {
      toast.error("Error fetching users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [debouncedSearch]);

  const handleToggleBlock = async (userId: string, currentStatus: boolean, role: string) => {
    if (role === "admin") {
      toast.error("Cannot modify admin status");
      return;
    }

    const action = currentStatus ? "unblock" : "block";
    const confirmMessage = currentStatus
      ? "Are you sure you want to unblock this user?"
      : "Are you sure you want to block this user? They will be logged out globally.";

    if (!confirm(confirmMessage)) return;

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success(data.message);
        setUsers((prev) => 
          prev.map(u => u._id === userId ? { ...u, isBlocked: !currentStatus } : u)
        );
      } else {
        toast.error(data.message || `Failed to ${action} user`);
      }
    } catch (error) {
      toast.error(`Error attempting to ${action} user`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-[var(--heading-color)]">Users Management</h1>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm"
          />
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
            size={18}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-10 flex justify-center"><Loader /></div>
          ) : users.length === 0 ? (
            <div className="p-10 text-center text-neutral-500">No users found</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50 border-b text-sm font-medium text-neutral-500 uppercase tracking-wider">
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Joined Date</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-sm">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-neutral-50/50 transition">
                    <td className="p-4 font-medium text-neutral-800">{user.name}</td>
                    <td className="p-4 text-neutral-600">{user.email}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 
                        user.role === 'deliveryBoy' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4 text-neutral-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                        user.isBlocked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {user.isBlocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      {user.role !== 'admin' && (
                        <button
                          onClick={() => handleToggleBlock(user._id, user.isBlocked, user.role)}
                          className={`inline-flex flex-col items-center justify-center p-1.5 rounded transition ${
                            user.isBlocked 
                              ? 'text-green-600 hover:bg-green-50' 
                              : 'text-red-500 hover:bg-red-50'
                          }`}
                          title={user.isBlocked ? "Unblock User" : "Block User"}
                        >
                          {user.isBlocked ? <ShieldCheck size={18} /> : <ShieldAlert size={18} />}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
