"use client";
import { useEffect, useState } from 'react';
import { Home, Calendar, Users, Package, BarChart3, X, UserPlus } from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import AdminTopbar from '../components/AdminTopbar';

export default function AdminDashboard() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [users, setUsers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [medicines, setMedicines] = useState([]);

  useEffect(() => {
    let mounted = true;
    async function fetchData() {
      try {
        setLoading(true);
        setError("");
        const [uRes, aRes, mRes] = await Promise.all([
          fetch('/api/admin/users', { cache: 'no-store', credentials: 'include' }),
          fetch('/api/admin/appointments', { cache: 'no-store', credentials: 'include' }),
          fetch('/api/admin/inventory', { cache: 'no-store', credentials: 'include' }),
        ]);

        const uJson = await uRes.json();
        const aJson = await aRes.json();
        const mJson = await mRes.json();

        if (!uJson.ok) throw new Error(uJson.error || 'Failed to load users');
        if (!aJson.ok) throw new Error(aJson.error || 'Failed to load appointments');
        if (!mJson.ok) throw new Error(mJson.error || 'Failed to load inventory');

        if (!mounted) return;
        setUsers(uJson.users || []);
        setAppointments(aJson.appointments || []);
        setMedicines(mJson.medicines || []);
      } catch (e) {
        console.error('Admin dashboard load error', e);
        if (!mounted) return;
        setError(e.message || 'Failed to load data');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchData();
    return () => { mounted = false; };
  }, []);

  const totalUsers = users.length;
  const activeDoctors = users.filter(u => u.role === 'doctor').length;
  const totalStudents = users.filter(u => u.role === 'user').length;
  const totalAppointments = appointments.length;
  const completedAppointments = appointments.filter(a => a.status === 'completed').length;

  function formatDateTime(dt) {
    if (!dt) return '';
    try {
      const d = new Date(dt);
      return d.toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return String(dt);
    }
  }
  const sidebarItems = [
    { label: "Dashboard", icon: Home, href: "/admin" },
    { label: "Appointments", icon: Calendar, href: "/admin/appointments" },
    { label: "Manage Users", icon: Users, href: "/admin/manage-users" },
    { label: "Add Doctors", icon: UserPlus, href: "/admin/add-doctor" },
    { label: "Inventory", icon: Package, href: "/admin/inventory" },
    { label: "Reports", icon: BarChart3, href: "/admin#reports" },
  ];

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Topbar */}
      <AdminTopbar onOpenMenu={() => setMobileOpen(true)} mobileOpen={mobileOpen} />
      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
            <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
              <span className="text-sm font-semibold text-zinc-900">Menu</span>
              <button
                className="inline-flex items-center justify-center rounded-md p-2 text-zinc-700 hover:bg-zinc-100"
                aria-label="Close menu"
                onClick={() => setMobileOpen(false)}
              >
                <X className="h-5 w-5" strokeWidth={1.5} />
              </button>
            </div>
            <AdminSidebar items={sidebarItems} activeIndex={0} onItemClick={() => setMobileOpen(false)} className="space-y-1 p-3" />
          </div>
        </>
      )}

      {/* Fixed desktop sidebar */}
      <aside className="hidden lg:block fixed left-0 top-16 bottom-0 z-30 w-60 rounded-none border-r border-zinc-200 bg-white p-3">
        <AdminSidebar items={sidebarItems} activeIndex={0} />
      </aside>

      {/* Main content */}
      <div className="mx-auto max-w-7xl px-4 py-6 lg:pl-64">
        <main>
          <h1 className="text-2xl font-semibold text-zinc-900">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-zinc-600">System overview and management</p>

          {/* Stats */}
          <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: "Total Users", value: loading ? "…" : String(totalUsers), note: loading ? "Loading" : `${activeDoctors} doctors` },
              { title: "Active Doctors", value: loading ? "…" : String(activeDoctors), note: loading ? "Loading" : `${activeDoctors} active` },
              { title: "Total Students", value: loading ? "…" : String(totalStudents), note: loading ? "Loading" : `${totalStudents} registered` },
              { title: "Appointments", value: loading ? "…" : String(totalAppointments), note: loading ? "Loading" : `${completedAppointments} completed` },
            ].map((card, i) => (
              <div key={i} className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-zinc-700">{card.title}</div>
                    <div className="mt-2 text-2xl font-semibold text-zinc-900">{card.value}</div>
                    <div className="mt-1 text-xs text-zinc-500">{card.note}</div>
                  </div>
                  <span className="inline-block h-10 w-10 rounded-lg bg-zinc-100" />
                </div>
              </div>
            ))}
          </section>

          {/* All Appointments (Live) */}
          <section className="mt-6 rounded-xl border border-zinc-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-3">
              <h2 className="text-sm font-semibold text-zinc-900">All Appointments</h2>
              <button onClick={() => (window.location.href = '/admin/appointments')} className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs text-zinc-700 hover:bg-zinc-50">View All</button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-zinc-200 text-sm">
                <thead className="bg-zinc-50">
                  <tr>
                    {[
                      "Doctor",
                      "Patient",
                      "Date & Time",
                      "Status",
                      "Action",
                    ].map((h) => (
                      <th key={h} className="px-5 py-2 text-left font-medium text-zinc-700">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 bg-white">
                  {(loading ? [] : appointments.slice(0, 8)).map((a) => (
                    <tr key={a.id}>
                      <td className="px-5 py-2 text-zinc-900">{a.doctor?.name || '—'}</td>
                      <td className="px-5 py-2 text-zinc-900">{a.user?.name || a.user?.email || '—'}</td>
                      <td className="px-5 py-2 text-zinc-900">{formatDateTime(a.scheduledFor)}</td>
                      <td className="px-5 py-2">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs ${
                            a.status === 'completed'
                              ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                              : a.status === 'cancelled'
                              ? 'bg-red-50 text-red-700 ring-1 ring-red-200'
                              : 'bg-blue-50 text-blue-700 ring-1 ring-blue-200'
                          }`}
                        >
                          {a.status}
                        </span>
                      </td>
                      <td className="px-5 py-2">
                        <button className="text-xs font-medium text-emerald-700 hover:underline">View</button>
                      </td>
                    </tr>
                  ))}
                  {(!loading && appointments.length === 0) && (
                    <tr>
                      <td colSpan={5} className="px-5 py-4 text-center text-zinc-500">No appointments found</td>
                    </tr>
                  )}
                </tbody>
              </table>
              {loading && (
                <div className="px-5 py-3 text-sm text-zinc-500">Loading appointments…</div>
              )}
              {error && (
                <div className="px-5 py-3 text-sm text-red-600">{error}</div>
              )}
            </div>
          </section>

          {/* Medicine Inventory (Live) */}
          <section className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-zinc-900">Medicine Inventory</h2>
              <button onClick={() => (window.location.href = '/admin/inventory')} className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs text-white shadow hover:bg-emerald-700">+ Add Medicine</button>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {(loading ? [] : medicines.slice(0, 6)).map((m) => {
                const threshold = Number(m.threshold) || 0;
                const stock = Number(m.stock) || 0;
                const progress = threshold > 0 ? Math.min(100, Math.round((stock / threshold) * 100)) : 100;
                const isAlert = threshold > 0 && stock < threshold;
                const unit = m.form ? m.form.toLowerCase() : 'units';
                return (
                  <InventoryCard
                    key={m.id}
                    name={m.name}
                    stockLabel={`Stock: ${stock} ${unit}`}
                    threshold={`Threshold: ${threshold} ${unit}`}
                    progress={progress}
                    variant={isAlert ? 'alert' : undefined}
                  />
                );
              })}
              {(!loading && medicines.length === 0) && (
                <div className="rounded-xl border border-zinc-200 bg-white p-5 text-sm text-zinc-500">No medicines found</div>
              )}
            </div>
          </section>

          {/* User Management (Live) */}
          <section className="mt-6 rounded-xl border border-zinc-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-3">
              <h2 className="text-sm font-semibold text-zinc-900">User Management</h2>
              <div className="flex items-center gap-2">
                <button onClick={() => (window.location.href = '/admin/add-doctor')} className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs text-white shadow hover:bg-emerald-700">+ Add User</button>
                <button onClick={() => (window.location.href = '/admin/manage-users')} className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs text-zinc-700 hover:bg-zinc-50">Manage Users</button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-zinc-200 text-sm">
                <thead className="bg-zinc-50">
                  <tr>
                    {["Name", "Role", "Email", "Joined", "Action"].map((h) => (
                      <th key={h} className="px-5 py-2 text-left font-medium text-zinc-700">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 bg-white">
                  {(loading ? [] : users.slice(0, 8)).map((u) => (
                    <tr key={u.id}>
                      <td className="px-5 py-2 text-zinc-900">{u.name || '—'}</td>
                      <td className="px-5 py-2">
                        <span className="text-xs font-medium text-blue-700">{u.role === 'doctor' ? 'Doctor' : u.role === 'admin' ? 'Admin' : 'User'}</span>
                      </td>
                      <td className="px-5 py-2 text-zinc-900">{u.email}</td>
                      <td className="px-5 py-2 text-zinc-900">{formatDateTime(u.createdAt)}</td>
                      <td className="px-5 py-2">
                        <div className="flex items-center gap-3">
                          <button className="text-xs font-medium text-emerald-700 hover:underline">View</button>
                          <button className="text-xs font-medium text-red-700 hover:underline">Remove</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {(!loading && users.length === 0) && (
                    <tr>
                      <td colSpan={5} className="px-5 py-4 text-center text-zinc-500">No users found</td>
                    </tr>
                  )}
                </tbody>
              </table>
              {loading && (
                <div className="px-5 py-3 text-sm text-zinc-500">Loading users…</div>
              )}
              {error && (
                <div className="px-5 py-3 text-sm text-red-600">{error}</div>
              )}
            </div>
          </section>

          {/* System Analytics (Placeholder) */}
          <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-zinc-900">Appointment Trends</h3>
              <div className="mt-4 space-y-4 text-sm">
                <Progress label="This Week" value={324} max={400} />
                <Progress label="Last Week" value={298} max={400} />
                <Progress label="Month Average" value={312} max={400} />
              </div>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-zinc-900">User Distribution</h3>
              <div className="mt-4 space-y-4 text-sm">
                <Progress label="Users" value={totalUsers || 0} max={Math.max(1, totalUsers)} color="emerald" suffix={`(${totalUsers ? '100%' : '0%'})`} />
                <Progress label="Doctors" value={activeDoctors || 0} max={Math.max(1, totalUsers)} color="blue" />
                <Progress label="Admins" value={users.filter(u => u.role === 'admin').length || 0} max={Math.max(1, totalUsers)} color="purple" />
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

function InventoryCard({ name, stockLabel, threshold, progress, variant }) {
  const alert = variant === "alert";
  return (
    <div className={`rounded-xl border p-5 shadow-sm ${alert ? "border-red-200 bg-red-50" : "border-zinc-200 bg-white"}`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm font-medium text-zinc-900">{name}</div>
          <div className={`mt-2 text-xs ${alert ? "text-red-700" : "text-zinc-700"}`}>{stockLabel}</div>
          <div className="mt-3 h-2 w-full rounded-full bg-zinc-200">
            <div
              className={`h-2 rounded-full ${alert ? "bg-red-500" : "bg-emerald-600"}`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-2 text-[11px] text-zinc-500">{threshold}</div>
        </div>
        <button className={`rounded-lg px-3 py-1.5 text-xs ${alert ? "bg-white text-zinc-700 ring-1 ring-red-200" : "border border-zinc-200 text-zinc-700 hover:bg-zinc-50"}`}>Edit</button>
      </div>
    </div>
  );
}

function Progress({ label, value, max, color = "emerald", suffix }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const bar = color === "blue" ? "bg-blue-600" : color === "purple" ? "bg-purple-600" : "bg-emerald-600";
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-zinc-700">{label}</span>
        <span className="text-zinc-500">{value}{suffix ? ` ${suffix}` : ""}</span>
      </div>
      <div className="mt-2 h-2 w-full rounded-full bg-zinc-200">
        <div className={`h-2 rounded-full ${bar}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}