"use client";

import { useEffect, useMemo, useState } from "react";
import UserTopbar from "../../components/UserTopbar";
import UserSidebar from "../../components/UserSidebar";
import { Home, Calendar, FileText, MessageSquare, CreditCard, Package, Search, ShoppingCart, CheckCircle } from "lucide-react";

export default function UserInventoryPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [medicines, setMedicines] = useState([]);
  const [query, setQuery] = useState("");
  const [buyOpen, setBuyOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const sidebarItems = useMemo(() => ([
    { label: "Dashboard", icon: Home, href: "/dashboard" },
    { label: "Appointments", icon: Calendar, href: "/dashboard/appointments" },
    { label: "Medical Records", icon: FileText, href: "/dashboard/medical-records" },
    { label: "Consultations", icon: MessageSquare, href: "/dashboard/consultations" },
    { label: "Get Card", icon: CreditCard, href: "/dashboard/card" },
    { label: "Inventory", icon: Package, href: "/dashboard/inventory" },
  ]), []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/inventory", { cache: "no-store" });
        const data = await res.json();
        if (cancelled) return;
        if (res.ok && data.ok) {
          setMedicines(Array.isArray(data.medicines) ? data.medicines : []);
        } else {
          setError(data.error || "Failed to load inventory");
        }
      } catch (e) {
        if (!cancelled) setError("Failed to load inventory");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return medicines;
    return medicines.filter(m => (
      (m.name || "").toLowerCase().includes(q) ||
      (m.genericName || "").toLowerCase().includes(q) ||
      (m.manufacturer || "").toLowerCase().includes(q)
    ));
  }, [query, medicines]);

  const selectedItem = useMemo(() => medicines.find(m => m.id === selectedId) || null, [selectedId, medicines]);

  function openBuy(item) {
    setSelectedId(item?.id ?? null);
    setQuantity(1);
    setBuyOpen(true);
  }

  function onChangeQuantity(val) {
    const max = selectedItem?.stock ?? 1;
    const parsed = Math.max(1, Math.min(Number(val) || 1, max));
    setQuantity(parsed);
  }

  function confirmBuy() {
    // No backend call – demo only
    setBuyOpen(false);
    setSuccessOpen(true);
  }

  function formatExpiry(dt) {
    if (!dt) return "—";
    try {
      const d = new Date(dt);
      return d.toLocaleDateString();
    } catch {
      return String(dt);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white">
      <UserTopbar onOpenMenu={() => setMobileOpen(true)} mobileOpen={mobileOpen} />

      {/* Sidebar */}
      <aside className="hidden lg:block fixed left-0 top-16 bottom-0 z-30 w-60 border-r border-zinc-200 bg-white p-3">
        <UserSidebar items={sidebarItems} activeIndex={5} />
      </aside>

      {/* Main */}
      <div className="mx-auto max-w-7xl px-4 py-6 lg:pl-64">
        <div className="flex items-center gap-3">
          <Package className="h-6 w-6 text-zinc-700" />
          <h1 className="text-2xl font-semibold text-zinc-900">Inventory</h1>
        </div>
        <p className="mt-1 text-sm text-zinc-600">Browse available medicines and supplies</p>

        <div className="mt-6 flex items-center gap-3">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, generic, or manufacturer"
              className="w-full rounded-lg border border-zinc-300 bg-white pl-9 pr-3 py-2 text-sm text-black"
            />
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white">
          {loading ? (
            <div className="px-5 py-6 text-sm text-zinc-500">Loading inventory…</div>
          ) : error ? (
            <div className="px-5 py-6 text-sm text-red-600">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="px-5 py-6 text-sm text-zinc-500">No items found</div>
          ) : (
            <table className="w-full text-left">
              <thead className="border-b border-zinc-200 text-xs text-zinc-500">
                <tr>
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Generic</th>
                  <th className="px-5 py-3">Form & Strength</th>
                  <th className="px-5 py-3">Manufacturer</th>
                  <th className="px-5 py-3">Price</th>
                  <th className="px-5 py-3">Stock</th>
                  <th className="px-5 py-3">Expiry</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {filtered.map((m) => (
                  <tr key={m.id}>
                    <td className="px-5 py-3 text-sm text-zinc-900">{m.name}</td>
                    <td className="px-5 py-3 text-sm text-zinc-700">{m.genericName || "—"}</td>
                    <td className="px-5 py-3 text-sm text-zinc-700">{[m.form, m.strength].filter(Boolean).join(" ") || "—"}</td>
                    <td className="px-5 py-3 text-sm text-zinc-700">{m.manufacturer || "—"}</td>
                    <td className="px-5 py-3 text-sm text-zinc-900">{typeof m.price === "number" ? `$${m.price.toFixed(2)}` : "—"}</td>
                    <td className="px-5 py-3 text-sm text-zinc-900">{m.stock ?? "—"}</td>
                    <td className="px-5 py-3 text-sm text-zinc-700">{formatExpiry(m.expiryDate)}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end">
                        <button
                          className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
                          onClick={() => openBuy(m)}
                          disabled={!m.stock || m.stock <= 0}
                          title={!m.stock || m.stock <= 0 ? "Out of stock" : "Buy this item"}
                        >
                          <ShoppingCart className="h-4 w-4 text-emerald-600" /> Buy
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Buy Modal */}
        {buyOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
            <div className="w-full max-w-lg rounded-xl border border-zinc-200 bg-white p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-zinc-900">Buy Medicine</h2>
                <button onClick={() => setBuyOpen(false)} className="text-sm text-zinc-600 hover:text-zinc-900">Close</button>
              </div>

              <div className="mt-4 space-y-4">
                <div>
                  <label className="text-xs text-zinc-500">Select Item</label>
                  <select
                    className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-black"
                    value={selectedId ?? ""}
                    onChange={(e) => setSelectedId(e.target.value || null)}
                  >
                    <option value="">Choose an item</option>
                    {medicines.map((m) => (
                      <option key={m.id} value={m.id} disabled={!m.stock || m.stock <= 0}>
                        {m.name} {m.stock && m.stock > 0 ? `(In stock: ${m.stock})` : "(Out of stock)"}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-500">Quantity</label>
                  <input
                    type="number"
                    min={1}
                    max={selectedItem?.stock || 1}
                    value={quantity}
                    onChange={(e) => onChangeQuantity(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-black"
                  />
                  <div className="mt-1 text-xs text-zinc-500">Available: {selectedItem?.stock ?? 0}</div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-2">
                <button onClick={() => setBuyOpen(false)} className="rounded-lg border border-zinc-200 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50">Cancel</button>
                <button
                  onClick={confirmBuy}
                  disabled={!selectedItem || (selectedItem?.stock ?? 0) < 1}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  <ShoppingCart className="h-4 w-4" /> Buy
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success Modal */}
        {successOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
            <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                <h2 className="text-lg font-semibold text-zinc-900">Purchase Successful</h2>
              </div>
              <p className="mt-2 text-sm text-zinc-700">
                {selectedItem ? `You purchased ${quantity} × ${selectedItem.name}.` : "Purchase completed."}
              </p>
              <p className="mt-1 text-xs text-zinc-500">This is a demo flow; no actual payment or stock changes were made.</p>
              <div className="mt-6 flex justify-end">
                <button onClick={() => setSuccessOpen(false)} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}