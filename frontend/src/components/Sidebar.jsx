import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'

const navItems = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="2" y="2" width="6" height="6" rx="1.5"/>
        <rect x="10" y="2" width="6" height="6" rx="1.5"/>
        <rect x="2" y="10" width="6" height="6" rx="1.5"/>
        <rect x="10" y="10" width="6" height="6" rx="1.5"/>
      </svg>
    ),
  },
  {
    label: 'Insights',
    path: '/insights',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M9 2a7 7 0 1 1 0 14A7 7 0 0 1 9 2z"/>
        <path d="M9 6v3l2 2"/>
      </svg>
    ),
  },
  {
    label: 'Analytics',
    path: '/analytics',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8">
        <polyline points="2,14 6,8 10,10 14,4"/>
        <line x1="2" y1="14" x2="16" y2="14"/>
      </svg>
    ),
  },
  {
    label: 'Profile',
    path: '/profile',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="9" cy="6" r="3"/>
        <path d="M3 16c0-3.3 2.7-6 6-6s6 2.7 6 6"/>
      </svg>
    ),
  },
]

export default function Sidebar() {
  const location = useLocation()

  return (
    <motion.aside
      initial={{ x: -80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="fixed left-0 top-0 h-full w-60 bg-white border-r border-border z-40 flex flex-col pt-20 pb-6 px-4"
    >
      {/* Brand */}
      <div className="mb-8 px-3">
        <p className="text-xs font-medium text-text-secondary uppercase tracking-widest">Navigation</p>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 space-y-1">
        {navItems.map(({ label, path, icon }) => {
          const active = location.pathname === path
          return (
            <Link
              key={path}
              to={path}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-10 text-sm font-medium transition-all duration-200 group ${
                active
                  ? 'text-accent bg-accent/8'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface'
              }`}
              style={{ borderRadius: 10 }}
            >
              {active && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 bg-accent/8 rounded-[10px]"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                />
              )}
              <span className={`relative z-10 ${active ? 'text-accent' : ''}`}>{icon}</span>
              <span className="relative z-10">{label}</span>
              {active && (
                <span className="ml-auto relative z-10 w-1.5 h-1.5 rounded-full bg-accent" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 pt-4 border-t border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent/20 to-accent/40 flex items-center justify-center">
            <span className="text-accent text-xs font-bold">V</span>
          </div>
          <div>
            <p className="text-xs font-semibold text-text-primary">Vytel</p>
            <p className="text-[11px] text-text-secondary">Behavioral Intelligence</p>
          </div>
        </div>
      </div>
    </motion.aside>
  )
}
