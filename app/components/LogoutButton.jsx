'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

export default function LogoutButton({ className }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    if (loading) return
    setLoading(true)
    try {
      await fetch('/api/logout', { method: 'POST' })
    } catch (err) {
      // swallow errors; proceed to redirect so user leaves admin area
    }
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className={
        className ||
        'flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs text-zinc-700 hover:bg-zinc-50'
      }
      disabled={loading}
      aria-label="Logout"
      title="Logout"
    >
      <LogOut className="h-4 w-4" strokeWidth={1.5} />
      {loading ? 'Logging out...' : 'Logout'}
    </button>
  )
}