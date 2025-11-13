"use client";

import { useEffect, useMemo, useState } from "react";
import UserTopbar from "../../components/UserTopbar";
import UserSidebar from "../../components/UserSidebar";
import { Home, Calendar, FileText, MessageSquare, CreditCard, Plus } from "lucide-react";

export default function UserCardPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [me, setMe] = useState(null);
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [address, setAddress] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const sidebarItems = useMemo(() => ([
    { label: "Dashboard", icon: Home, href: "/dashboard" },
    { label: "Appointments", icon: Calendar, href: "/dashboard#appointments" },
    { label: "Medical Records", icon: FileText, href: "/dashboard#records" },
    { label: "Consultations", icon: MessageSquare, href: "/dashboard#consultations" },
    { label: "Get Card", icon: CreditCard, href: "/dashboard/card" },
  ]), []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const [meRes, cardRes] = await Promise.all([
          fetch("/api/me"),
          fetch("/api/card"),
        ]);
        const meData = await meRes.json();
        const cardData = await cardRes.json();
        if (meRes.ok && meData.ok && !cancelled) {
          setMe(meData.user);
        }
        if (cardRes.ok && cardData.ok && !cancelled) {
          setCard(cardData.card);
        }
      } catch (e) {
        if (!cancelled) setError("Network error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  async function onSave(e) {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setError("");
    try {
      const form = new FormData();
      form.append("address", address);
      if (imageFile) form.append("image", imageFile);
      const res = await fetch("/api/card", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Failed to save card");
      } else {
        setCard(data.card);
        setShowModal(false);
      }
    } catch (e) {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white">
      <UserTopbar onOpenMenu={() => setMobileOpen(true)} mobileOpen={mobileOpen} />

      <aside className="hidden lg:block fixed left-0 top-16 bottom-0 z-30 w-60 border-r border-zinc-200 bg-white p-3">
        <UserSidebar items={sidebarItems} activeIndex={4} />
      </aside>

      <div className="mx-auto max-w-7xl px-4 py-6 lg:pl-64">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900">Hospital Card</h1>
            <p className="mt-1 text-sm text-zinc-600">View or request your hospital card</p>
          </div>
        </div>

        {loading ? (
          <div className="mt-6 text-sm text-zinc-600">Loading...</div>
        ) : error ? (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        ) : card ? (
          <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-6">
            <div className="flex items-center gap-6">
              <div className="h-24 w-24 overflow-hidden rounded-md border border-zinc-200 bg-zinc-100">
                {card.imageUrl ? (
                  <img src={card.imageUrl} alt="Card" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-zinc-400">No image</div>
                )}
              </div>
              <div>
                <div className="text-lg font-semibold text-zinc-900">{me?.name || "User"}</div>
                <div className="text-sm text-zinc-600">{me?.email}</div>
                <div className="mt-1 text-sm text-zinc-600">{me?.contactNumber}</div>
                <div className="mt-1 text-sm text-zinc-600">{me?.gender ? me.gender : ""}{me?.dateOfBirth ? ` • ${new Date(me.dateOfBirth).toLocaleDateString()}` : ""}</div>
                <div className="mt-1 text-sm text-zinc-600">Address: {card.address}</div>
                <div className="mt-1 text-xs text-zinc-500">Issued: {card.issuedAt ? new Date(card.issuedAt).toLocaleString() : "—"}</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-6">
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
            >
              <Plus className="h-4 w-4" />
              Get Card
            </button>
            <p className="mt-2 text-sm text-zinc-600">You don’t have a hospital card yet.</p>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
            <div className="w-full max-w-lg rounded-xl border border-zinc-200 bg-white p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-zinc-900">Request Card</h2>
                <button onClick={() => setShowModal(false)} className="text-sm text-zinc-600 hover:text-zinc-900">Close</button>
              </div>

              <form onSubmit={onSave} className="mt-4 space-y-4">
                {/* Pre-filled details */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-xs text-zinc-500">Name</label>
                    <input className="mt-1 w-full rounded-lg border border-zinc-300 bg-zinc-100 py-2 px-3 text-sm" value={me?.name || ""} readOnly />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500">Email</label>
                    <input className="mt-1 w-full rounded-lg border border-zinc-300 bg-zinc-100 py-2 px-3 text-sm" value={me?.email || ""} readOnly />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500">Contact</label>
                    <input className="mt-1 w-full rounded-lg border border-zinc-300 bg-zinc-100 py-2 px-3 text-sm" value={me?.contactNumber || ""} readOnly />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500">Gender</label>
                    <input className="mt-1 w-full rounded-lg border border-zinc-300 bg-zinc-100 py-2 px-3 text-sm" value={me?.gender || ""} readOnly />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500">Date of Birth</label>
                    <input className="mt-1 w-full rounded-lg border border-zinc-300 bg-zinc-100 py-2 px-3 text-sm" value={me?.dateOfBirth ? new Date(me.dateOfBirth).toLocaleDateString() : ""} readOnly />
                  </div>
                </div>

                {/* New fields */}
                <div>
                  <label className="text-xs text-zinc-500">Address</label>
                  <input
                    type="text"
                    className="mt-1 w-full rounded-lg border border-zinc-300 bg-white py-2 px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-600 focus:outline-none"
                    placeholder="Enter your address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-500">Card Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    className="mt-1 w-full rounded-lg border border-zinc-300 bg-white py-2 px-3 text-sm"
                    required
                  />
                </div>
                <div className="flex items-center justify-end gap-2">
                  <button type="button" onClick={() => setShowModal(false)} className="rounded-lg border border-zinc-200 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50">Cancel</button>
                  <button type="submit" disabled={saving} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">
                    {saving ? "Saving..." : "Save"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}