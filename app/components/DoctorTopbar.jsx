'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Menu, Bell } from 'lucide-react'
import LogoutButton from './LogoutButton'

export default function DoctorTopbar({ onOpenMenu, mobileOpen }) {
  const [profile, setProfile] = useState({ name: '', role: '' })
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loadingNotif, setLoadingNotif] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch('/api/me', { cache: 'no-store' })
        const data = await res.json()
        if (!cancelled && res.ok && data.ok) {
          setProfile({
            name: data.user?.name || '',
            role: data.user?.role || '',
          })
        }
      } catch {}
    }
    load()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    let cancelled = false
    async function loadNotifications() {
      try {
        setLoadingNotif(true)
        const res = await fetch('/api/notifications', { cache: 'no-store' })
        const data = await res.json()
        if (!cancelled && res.ok && data.ok) {
          setNotifications(data.notifications || [])
          setUnreadCount(data.unreadCount || 0)
        }
      } catch {}
      finally { setLoadingNotif(false) }
    }
    // Load on mount and when opening dropdown
    if (notifOpen) loadNotifications()
    return () => { cancelled = true }
  }, [notifOpen])

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          {/* Mobile menu toggle */}
          <button
            className="-ml-1 inline-flex items-center justify-center rounded-md p-2 text-zinc-700 hover:bg-zinc-100 lg:hidden"
            aria-label="Open menu"
            aria-expanded={mobileOpen}
            onClick={() => onOpenMenu && onOpenMenu()}
          >
            <Menu className="h-6 w-6" strokeWidth={1.5} />
          </button>
          <img src="/logo.svg" alt="E-Clinic" className="h-8 w-8" />
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-zinc-900">E-Clinic</span>
            <span className="text-xs text-zinc-500">Healthcare Platform</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <div className="relative">
            <button
              aria-label="Notifications"
              className="relative inline-flex items-center justify-center rounded-md p-2 text-zinc-700 hover:bg-zinc-100"
              onClick={() => setNotifOpen((v) => !v)}
            >
              <Bell className="h-5 w-5" strokeWidth={1.5} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1 text-xs font-medium text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-lg">
                <div className="flex items-center justify-between border-b border-zinc-200 px-3 py-2">
                  <span className="text-sm font-semibold text-zinc-900">Notifications</span>
                  <button
                    className="text-xs text-blue-600 hover:underline disabled:text-zinc-400"
                    onClick={async () => {
                      try {
                        const res = await fetch('/api/notifications', {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ markAll: true }),
                        })
                        const data = await res.json()
                        if (res.ok && data.ok) {
                          setNotifications((list) => list.map(n => ({ ...n, read: true })))
                          setUnreadCount(0)
                        }
                      } catch {}
                    }}
                  >Mark all read</button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {loadingNotif ? (
                    <div className="px-3 py-4 text-sm text-zinc-500">Loading…</div>
                  ) : notifications.length === 0 ? (
                    <div className="px-3 py-4 text-sm text-zinc-500">No notifications</div>
                  ) : (
                    notifications.map((n) => (
                      <div key={n.id} className={`px-3 py-3 ${n.read ? 'bg-white' : 'bg-zinc-50'}`}>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="text-sm font-medium text-zinc-900">{n.title}</div>
                            <div className="text-sm text-zinc-600">{n.body}</div>
                            <div className="mt-1 text-xs text-zinc-400">{new Date(n.createdAt).toLocaleString()}</div>
                          </div>
                          {!n.read && (
                            <span className="mt-0.5 inline-flex h-2 w-2 rounded-full bg-blue-500" aria-hidden />
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 overflow-hidden rounded-full bg-zinc-200" aria-hidden>
              <img src="/next.svg" alt="avatar" className="h-full w-full object-cover" />
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-zinc-900">{profile.name || "Doctor"}</div>
              <div className="text-xs text-zinc-500">{profile.role || "Doctor"}</div>
            </div>
          </div>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}