import { Home, Calendar, Users, Package, BarChart3 } from 'lucide-react';
import LogoutButton from '../components/LogoutButton';

export default function AdminDashboard() {
  const sidebarItems = [
    { label: "Dashboard", icon: Home },
    { label: "Appointments", icon: Calendar },
    { label: "Manage Users", icon: Users },
    { label: "Inventory", icon: Package },
    { label: "Reports", icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Topbar */}
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="E-Clinic" className="h-8 w-8" />
            <span className="text-sm font-semibold text-zinc-900">E-Clinic</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm font-medium text-zinc-900">Admin</div>
              <div className="text-xs text-zinc-500">admin</div>
            </div>
            <div className="h-8 w-8 rounded-full bg-zinc-200" />
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-[240px_1fr]">
        {/* Sidebar */}
        <aside className="hidden rounded-xl border border-zinc-200 bg-white p-3 lg:block">
          <nav className="space-y-1">
            {sidebarItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <a
                  key={idx}
                  className={`flex items-center gap-4 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                    idx === 0
                      ? "bg-zinc-100 text-zinc-900"
                      : "text-zinc-700 hover:bg-zinc-50"
                  }`}
                  href="#"
                >
                  <Icon className="h-5 w-5" strokeWidth={1.5} />
                  {item.label}
                </a>
              );
            })}
          </nav>
        </aside>

        {/* Main content */}
        <main>
          <h1 className="text-2xl font-semibold text-zinc-900">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-zinc-600">System overview and management</p>

          {/* Stats */}
          <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: "Total Users", value: "1,240", note: "+12% this month" },
              { title: "Active Doctors", value: "45", note: "28 available today" },
              { title: "Total Students", value: "890", note: "156 new this month" },
              { title: "Appointments", value: "3,250", note: "2,890 completed" },
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

          {/* All Appointments */}
          <section className="mt-6 rounded-xl border border-zinc-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-3">
              <h2 className="text-sm font-semibold text-zinc-900">All Appointments</h2>
              <button className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs text-zinc-700 hover:bg-zinc-50">View All</button>
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
                  {[
                    ["Dr. Sarah Smith", "Alex Johnson", "Dec 15 - 2:00 PM", "Scheduled"],
                    ["Dr. John Doe", "Emily Brown", "Dec 14 - 4:30 PM", "Completed"],
                    ["Dr. Sarah Smith", "Michael Chen", "Dec 10 - 10:30 AM", "Scheduled"],
                    ["Dr. Emily Wilson", "Jessica Lee", "Dec 7 - 3:00 PM", "Scheduled"],
                  ].map((row, i) => (
                    <tr key={i}>
                      <td className="px-5 py-2 text-zinc-900">{row[0]}</td>
                      <td className="px-5 py-2 text-zinc-900">{row[1]}</td>
                      <td className="px-5 py-2 text-zinc-900">{row[2]}</td>
                      <td className="px-5 py-2">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs ${
                            row[3] === "Completed"
                              ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                              : "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                          }`}
                        >
                          {row[3]}
                        </span>
                      </td>
                      <td className="px-5 py-2">
                        <button className="text-xs font-medium text-emerald-700 hover:underline">Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Medicine Inventory */}
          <section className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-zinc-900">Medicine Inventory</h2>
              <button className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs text-white shadow hover:bg-emerald-700">+ Add Medicine</button>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Card */}
              <InventoryCard name="Paracetamol" stockLabel="Stock: 450 tablets" threshold="Threshold: 100 tablets" progress={80} />
              <InventoryCard name="Antibiotics (Amoxicillin)" stockLabel="Stock: 120 tablets" threshold="Threshold: 200 tablets" progress={40} variant="alert" />
              <InventoryCard name="Vitamin C" stockLabel="Stock: 800 tablets" threshold="Threshold: 300 tablets" progress={90} />
              <InventoryCard name="Bandages" stockLabel="Stock: 45 boxes" threshold="Threshold: 100 boxes" progress={30} variant="alert" />
              <InventoryCard name="Syringes" stockLabel="Stock: 250 units" threshold="Threshold: 150 units" progress={55} />
            </div>
          </section>

          {/* User Management */}
          <section className="mt-6 rounded-xl border border-zinc-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-3">
              <h2 className="text-sm font-semibold text-zinc-900">User Management</h2>
              <div className="flex items-center gap-2">
                <button className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs text-white shadow hover:bg-emerald-700">+ Add User</button>
                <button className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs text-zinc-700 hover:bg-zinc-50">Manage Users</button>
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
                  {[
                    ["Dr. James Wilson", "Doctor", "james@clinic.com", "Dec 1, 2024"],
                    ["Lisa Rodriguez", "Student", "lisa@student.com", "Dec 5, 2024"],
                    ["Dr. Robert Brown", "Doctor", "robert@clinic.com", "Nov 28, 2024"],
                  ].map((row, i) => (
                    <tr key={i}>
                      <td className="px-5 py-2 text-zinc-900">{row[0]}</td>
                      <td className="px-5 py-2">
                        <span className="text-xs font-medium text-blue-700">{row[1]}</span>
                      </td>
                      <td className="px-5 py-2 text-zinc-900">{row[2]}</td>
                      <td className="px-5 py-2 text-zinc-900">{row[3]}</td>
                      <td className="px-5 py-2">
                        <div className="flex items-center gap-3">
                          <button className="text-xs font-medium text-emerald-700 hover:underline">Edit</button>
                          <button className="text-xs font-medium text-red-700 hover:underline">Remove</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* System Analytics */}
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
                <Progress label="Students" value={890} max={1220} color="emerald" suffix="(72%)" />
                <Progress label="Doctors" value={45} max={1220} color="blue" suffix="(3.6%)" />
                <Progress label="Admins" value={10} max={1220} color="purple" suffix="(0.8%)" />
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