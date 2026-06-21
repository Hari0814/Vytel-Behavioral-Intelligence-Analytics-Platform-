import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useApp } from '../context/AppContext'

export default function Navbar() {
  const { user, logout } = useApp()
  const location = useLocation()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const isLanding = location.pathname === '/'

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || !isLanding ? 'glass shadow-sm' : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 2L14 6V12L9 16L4 12V6L9 2Z" stroke="white" strokeWidth="1.5" fill="none"/>
              <circle cx="9" cy="9" r="2" fill="white"/>
            </svg>
          </div>
          <span className="font-display font-semibold text-lg text-text-primary tracking-tight">
            Vytel<span className="text-accent">AI</span>
          </span>
        </Link>

        {/* Nav Links */}
        <nav className="hidden md:flex items-center gap-6">
          {user ? (
            <>
              {[
                { label: 'Dashboard', path: '/dashboard' },
                { label: 'Insights', path: '/insights' },
                { label: 'Analytics', path: '/analytics' },
              ].map(({ label, path }) => (
                <Link
                  key={path}
                  to={path}
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === path
                      ? 'text-accent'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {label}
                </Link>
              ))}
            </>
          ) : (
            <>
              <a href="#features" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">Features</a>
              <a href="#preview" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">Preview</a>
            </>
          )}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link to="/profile" className="flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
                <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center text-accent text-xs font-semibold">
                  {user.name?.[0]?.toUpperCase() || 'U'}
                </div>
                {user.name?.split(' ')[0] || 'User'}
              </Link>
              <button onClick={handleLogout} className="btn-secondary py-2 px-4 text-sm">
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-secondary py-2 px-4 text-sm">Sign In</Link>
              <Link to="/signup" className="btn-primary py-2 px-4 text-sm">Get Started</Link>
            </>
          )}
        </div>
      </div>
    </motion.header>
  )
}
