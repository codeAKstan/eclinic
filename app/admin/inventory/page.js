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
  RefreshCw,
  Plus,
  X,
} from "lucide-react";

export default function AdminInventoryPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  const sidebarItems = [
    { label: "Dashboard", icon: Home, href: "/admin" },
    { label: "Appointments", icon: Calendar, href: "/admin#appointments" },
    { label: "Manage Users", icon: Users, href: "/admin/manage-users" },
    { label: "Add Doctors", icon: UserPlus, href: "/admin/add-doctor" },
    { label: "Inventory", icon: Package, href: "/admin/inventory" },
    { label: "Reports", icon: BarChart3, href: "/admin#reports" },
  ];

  useEffect(() => {
    loadInventory();
  }, []);

  async function loadInventory() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/inventory", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Failed to load inventory");
        setItems([]);
      } else {
        setItems(data.medicines || []);
      }
    } catch (e) {
      setError("Network error");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((m) =>
      (m.name || "").toLowerCase().includes(q) ||
      (m.genericName || "").toLowerCase().includes(q) ||
      (m.form || "").toLowerCase().includes(q)
    );
  }, [items, query]);

  async function addMedicine(e) {
    e.preventDefault();
    const form = e.target;
    const payload = {
      name: form.name.value,
      genericName: form.genericName.value,
      form: form.form.value,
      strength: form.strength.value,
      batchNumber: form.batchNumber.value,
      manufacturer: form.manufacturer.value,
      price: form.price.value,
      stock: form.stock.value,
      threshold: form.threshold.value,
      expiryDate: form.expiryDate.value,
      notes: form.notes.value,
    };
    try {
      const res = await fetch("/api/admin/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        alert(data.error || "Failed to add medicine");
        return;
      }
      setShowAdd(false);
      form.reset();
      await loadInventory();
    } catch (err) {
      alert("Network error");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white">
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
                ×
              </button>
            </div>
            <AdminSidebar items={sidebarItems} activeIndex={4} onItemClick={() => setMobileOpen(false)} className="space-y-1 p-3" />
          </div>
        </>
      )}

      <aside className="hidden lg:block fixed left-0 top-16 bottom-0 z-30 w-60 border-r border-zinc-200 bg-white p-3">
        <AdminSidebar items={sidebarItems} activeIndex={4} />
      </aside>

      <div className="mx-auto max-w-7xl px-4 py-6 lg:pl-64">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900">Inventory</h1>
            <p className="mt-1 text-sm text-zinc-600">Manage medicines: add, view, and monitor stock</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAdd(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm text-white shadow-sm hover:bg-emerald-700"
            >
              <Plus className="h-4 w-4" /> Add Medicine
            </button>
            <button
              onClick={loadInventory}
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 shadow-sm hover:bg-zinc-50"
            >
              <RefreshCw className="h-4 w-4" /> Refresh
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="mt-4 flex items-center gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, generic name, or form..."
            className="w-full max-w-xl rounded-lg border border-zinc-300 bg-white py-2.5 px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-600 focus:outline-none"
          />
        </div>

        {/* Table */}
        <div className="mt-6 overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-zinc-200 text-sm">
            <thead className="bg-zinc-50">
              <tr>
                {["Name","Form","Strength","Stock","Threshold","Price","Expiry","Manufacturer","Added"].map((h) => (
                  <th key={h} className="px-5 py-2 text-left font-medium text-zinc-700">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 bg-white">
              {loading ? (
                <tr><td className="px-5 py-4 text-zinc-600" colSpan={9}>Loading...</td></tr>
              ) : error ? (
                <tr><td className="px-5 py-4 text-red-600" colSpan={9}>{error}</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td className="px-5 py-4 text-zinc-600" colSpan={9}>No medicines found.</td></tr>
              ) : (
                filtered.map((m) => (
                  <tr key={m.id}>
                    <td className="px-5 py-3 text-zinc-900">
                      <div className="font-medium">{m.name}</div>
                      <div className="text-xs text-zinc-500">{m.genericName || ""}</div>
                    </td>
                    <td className="px-5 py-3 text-zinc-900">{m.form || "—"}</td>
                    <td className="px-5 py-3 text-zinc-900">{m.strength || "—"}</td>
                    <td className="px-5 py-3 text-zinc-900">{m.stock ?? 0}</td>
                    <td className="px-5 py-3 text-zinc-900">{m.threshold ?? 0}</td>
                    <td className="px-5 py-3 text-zinc-900">{typeof m.price === "number" ? `₦${m.price.toFixed(2)}` : "₦0.00"}</td>
                    <td className="px-5 py-3 text-zinc-900">{m.expiryDate ? new Date(m.expiryDate).toLocaleDateString() : "—"}</td>
                    <td className="px-5 py-3 text-zinc-900">{m.manufacturer || "—"}</td>
                    <td className="px-5 py-3 text-zinc-900">{m.createdAt ? new Date(m.createdAt).toLocaleDateString() : "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Add modal */}
        {showAdd && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 overflow-y-auto">
            <div className="w-full max-w-2xl rounded-xl border border-zinc-200 bg-white p-5 shadow-xl max-h-[85vh] overflow-y-auto my-10">
              <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
                <h2 className="text-sm font-semibold text-zinc-900">Add Medicine</h2>
                <button className="rounded-md p-2 text-zinc-700 hover:bg-zinc-100" onClick={() => setShowAdd(false)}>
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2" onSubmit={addMedicine}>
                <div>
                  <label className="text-xs text-zinc-600">Name *</label>
                  <input name="name" required className="mt-1 w-full text-black rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs text-zinc-600">Generic Name</label>
                  <input name="genericName" className="mt-1 w-full text-black rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs text-zinc-600">Form</label>
                  <input name="form" placeholder="tablet, syrup, injection" className="mt-1 w-full text-black rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs text-zinc-600">Strength</label>
                  <input name="strength" placeholder="500 mg" className="mt-1 w-full text-black rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs text-zinc-600">Batch Number</label>
                  <input name="batchNumber" className="mt-1 w-full text-black rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs text-zinc-600">Manufacturer</label>
                  <input name="manufacturer" className="mt-1 w-full text-black rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs text-zinc-600">Price (₦)</label>
                  <input name="price" type="number" step="0.01" min="0" className="mt-1 w-full text-black rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs text-zinc-600">Stock</label>
                  <input name="stock" type="number" step="1" min="0" className="mt-1 w-full text-black rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs text-zinc-600">Threshold</label>
                  <input name="threshold" type="number" step="1" min="0" className="mt-1 w-full text-black rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs text-zinc-600">Expiry Date</label>
                  <input name="expiryDate" type="date" className="mt-1 w-full text-black rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs text-zinc-600">Notes</label>
                  <textarea name="notes" rows={3} className="mt-1 w-full text-black rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none" />
                </div>
                <div className="md:col-span-2 mt-2 flex items-center justify-end gap-2">
                  <button type="button" onClick={() => setShowAdd(false)} className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50">Cancel</button>
                  <button type="submit" className="rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white hover:bg-emerald-700">Save</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}