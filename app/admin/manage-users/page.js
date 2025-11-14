"use client";

import { useEffect, useMemo, useState } from "react";
import AdminTopbar from "../../components/AdminTopbar";
import AdminSidebar from "../../components/AdminSidebar";
import {
  Home,
  Calendar,
  Users,
  Package,
  BarChart3,
  UserPlus,
  Search,
  Mail,
  Phone,
  CalendarDays,
  MoreHorizontal,
  RefreshCw,
  CircleDot,
} from "lucide-react";

export default function ManageUsersPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [menuOpenId, setMenuOpenId] = useState(null);

  const sidebarItems = [
    { label: "Dashboard", icon: Home, href: "/admin" },
    { label: "Appointments", icon: Calendar, href: "/admin/appointments" },
    { label: "Manage Users", icon: Users, href: "/admin/manage-users" },
    { label: "Add Doctors", icon: UserPlus, href: "/admin/add-doctor" },
    { label: "Inventory", icon: Package, href: "/admin/inventory" },
    { label: "Reports", icon: BarChart3, href: "/admin#reports" },
  ];

  async function loadUsers() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Failed to load users");
      } else {
        setUsers(data.users || []);
      }
    } catch (e) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) =>
      (u.email || "").toLowerCase().includes(q) ||
      (u.name || "").toLowerCase().includes(q)
    );
  }, [users, query]);

  async function updateRole(id, role) {
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        alert(data.error || "Failed to update role");
      } else {
        setUsers((list) => list.map((u) => (u.id === id ? data.user : u)));
      }
    } catch (e) {
      alert("Network error");
    }
  }

  async function deleteUser(id) {
    const ok = confirm("Delete this user? This cannot be undone.");
    if (!ok) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        alert(data.error || "Failed to delete user");
      } else {
        setUsers((list) => list.filter((u) => u.id !== id));
      }
    } catch (e) {
      alert("Network error");
    }
  }

  function RoleBadge({ role }) {
    const styles = {
      admin: "bg-purple-50 text-purple-700 border-purple-100",
      doctor: "bg-blue-50 text-blue-700 border-blue-100",
      user: "bg-zinc-100 text-zinc-700 border-zinc-200",
    };
    const label = role || "user";
    return (
      <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs ${styles[label] || styles.user}`}>
        <CircleDot className="h-3 w-3" /> {label}
      </span>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white">
      <AdminTopbar onOpenMenu={() => setMobileOpen(true)} mobileOpen={mobileOpen} />

      <aside className="hidden lg:block fixed left-0 top-16 bottom-0 z-30 w-60 border-r border-zinc-200 bg-white p-3">
        <AdminSidebar items={sidebarItems} activeIndex={2} />
      </aside>

      <div className="mx-auto max-w-7xl px-4 py-6 lg:pl-64">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900">Manage Users</h1>
            <p className="mt-1 text-sm text-zinc-600">View all users, update roles, or remove accounts</p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <div className="relative w-full max-w-xl">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-zinc-400">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full rounded-lg border border-zinc-300 bg-white py-2.5 pl-9 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-600 focus:outline-none"
            />
          </div>
          <button
            onClick={loadUsers}
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 shadow-sm hover:bg-zinc-50"
          >
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </div>

        <div className="mt-6 overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-zinc-200 text-sm">
            <thead className="bg-zinc-50">
              <tr>
                {["Email","Name","Role","Speciality","Contact","Created","Actions"].map((h) => (
                  <th key={h} className="px-5 py-2 text-left font-medium text-zinc-700">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 bg-white">
              {loading ? (
                <tr>
                  <td className="px-5 py-4 text-zinc-600" colSpan={7}>Loading...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td className="px-5 py-4 text-red-600" colSpan={7}>{error}</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td className="px-5 py-4 text-zinc-600" colSpan={7}>No users found.</td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u.id}>
                    <td className="px-5 py-3 text-zinc-900">
                      <span className="inline-flex items-center gap-2">
                        <Mail className="h-4 w-4 text-zinc-500" /> {u.email}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-zinc-900">{u.name || "—"}</td>
                    <td className="px-5 py-3 text-zinc-900"><RoleBadge role={u.role} /></td>
                    <td className="px-5 py-3 text-zinc-900">{u.primarySpeciality || "—"}</td>
                    <td className="px-5 py-3 text-zinc-900">
                      <span className="inline-flex items-center gap-2">
                        <Phone className="h-4 w-4 text-zinc-500" /> {u.contactNumber || "—"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-zinc-900">
                      <span className="inline-flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-zinc-500" /> {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-zinc-900">
                      <div className="relative">
                        <button
                          aria-label="Actions"
                          onClick={() => setMenuOpenId(menuOpenId === u.id ? null : u.id)}
                          className="rounded-lg p-1 text-zinc-600 hover:bg-zinc-100"
                        >
                          <MoreHorizontal className="h-5 w-5" />
                        </button>
                        {menuOpenId === u.id && (
                          <div className="absolute right-0 z-10 mt-2 w-44 rounded-lg border border-zinc-200 bg-white p-1 text-sm shadow-lg">
                            <button className="block w-full rounded-md px-3 py-2 text-left hover:bg-zinc-50" onClick={() => { setMenuOpenId(null); updateRole(u.id, "admin"); }}>Make admin</button>
                            <button className="block w-full rounded-md px-3 py-2 text-left hover:bg-zinc-50" onClick={() => { setMenuOpenId(null); updateRole(u.id, "doctor"); }}>Make doctor</button>
                            <button className="block w-full rounded-md px-3 py-2 text-left hover:bg-zinc-50" onClick={() => { setMenuOpenId(null); updateRole(u.id, "user"); }}>Make user</button>
                            <div className="my-1 border-t border-zinc-200" />
                            <button className="block w-full rounded-md px-3 py-2 text-left text-red-700 hover:bg-red-50" onClick={() => { setMenuOpenId(null); deleteUser(u.id); }}>Delete</button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <p className="mt-3 text-xs text-zinc-600">Showing {filtered.length} of {users.length} users</p>
      </div>
    </div>
  );
}