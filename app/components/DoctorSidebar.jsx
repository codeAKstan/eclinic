'use client'
import Link from 'next/link'

export default function DoctorSidebar({ items = [], activeIndex = 0, onItemClick, className }) {
  return (
    <nav className={className || 'space-y-1'}>
      {items.map((item, idx) => {
        const Icon = item.icon
        const isActive = idx === activeIndex
        const base = 'flex items-center gap-4 rounded-lg px-4 py-3 text-sm font-medium transition-colors'
        const state = isActive ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-700 hover:bg-zinc-50'
        const href = item.href || '#'
        return (
          <Link
            key={idx}
            href={href}
            className={`${base} ${state}`}
            onClick={onItemClick}
          >
            <Icon className="h-5 w-5" strokeWidth={1.5} />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}