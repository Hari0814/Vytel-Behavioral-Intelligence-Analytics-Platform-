import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useApp } from '../context/AppContext'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import Chatbot from '../components/Chatbot'
import { sampleUserData } from '../data/sampleData'
import { useNavigate } from 'react-router-dom'

export default function Profile() {
  const { user, logout, userData, setUserData, setInsights, setLifeScore } = useApp()
  const navigate = useNavigate()
  const [privacyMode, setPrivacyMode] = useState(false)
  const [notifications, setNotifications] = useState(true)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleDeleteData = () => {
    setUserData(null)
    setInsights([])
    setLifeScore(null)
    setDeleteConfirm(false)
    navigate('/onboarding')
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const displayName = user?.name || 'Demo User'
  const displayEmail = user?.email || 'demo@vytel.me'
  const initials = displayName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <Sidebar />

      <main className="ml-60 pt-16 min-h-screen">
        <div className="p-7 max-w-3xl">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-7">
            <h1 className="font-display text-2xl font-bold text-text-primary">Profile & Settings</h1>
            <p className="text-text-secondary text-sm mt-0.5">Manage your account, data, and preferences</p>
          </motion.div>

          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-6 mb-5"
          >
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent/30 to-accent/60 flex items-center justify-center text-accent text-xl font-bold font-display">
                {initials}
              </div>
              <div className="flex-1">
                <h2 className="font-semibold text-text-primary text-lg">{displayName}</h2>
                <p className="text-text-secondary text-sm">{displayEmail}</p>
                <span className="inline-flex items-center gap-1.5 mt-1.5 text-xs font-medium text-success bg-green-50 px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-success" />
                  Active Account
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-border">
              {[
                { label: 'Data Points', value: userData ? Object.values(userData).flat().length : '28' },
                { label: 'Insights Generated', value: '4' },
                { label: 'Days Tracked', value: '7' },
              ].map(({ label, value }) => (
                <div key={label} className="text-center">
                  <p className="font-display text-2xl font-bold text-text-primary">{value}</p>
                  <p className="text-xs text-text-secondary mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Settings Sections */}
          <div className="space-y-4">
            {/* Account Settings */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card p-6"
            >
              <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#6366F1" strokeWidth="1.8">
                  <circle cx="8" cy="5" r="3"/><path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6"/>
                </svg>
                Account Settings
              </h3>
              <div className="space-y-4">
                {[
                  { label: 'Full Name',     val: displayName,  type: 'text' },
                  { label: 'Email Address', val: displayEmail,  type: 'email' },
                ].map(({ label, val, type }) => (
                  <div key={label}>
                    <label className="block text-sm font-medium text-text-primary mb-1.5">{label}</label>
                    <input type={type} defaultValue={val} className="input-field" />
                  </div>
                ))}
                <button
                  onClick={handleSave}
                  className={`btn-primary py-2 px-5 text-sm ${saved ? 'bg-success' : ''}`}
                >
                  {saved ? '✓ Saved!' : 'Save Changes'}
                </button>
              </div>
            </motion.div>

            {/* Preferences */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="card p-6"
            >
              <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#6366F1" strokeWidth="1.8">
                  <circle cx="8" cy="8" r="2.5"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3 3l1.5 1.5M11.5 11.5L13 13M3 13l1.5-1.5M11.5 4.5L13 3"/>
                </svg>
                Preferences
              </h3>
              <div className="space-y-4">
                {[
                  {
                    label: 'Privacy Mode',
                    desc: 'Blur sensitive numbers in the dashboard',
                    value: privacyMode,
                    toggle: () => setPrivacyMode((v) => !v),
                  },
                  {
                    label: 'Weekly Insight Notifications',
                    desc: 'Get AI-generated weekly summaries',
                    value: notifications,
                    toggle: () => setNotifications((v) => !v),
                  },
                ].map(({ label, desc, value, toggle }) => (
                  <div key={label} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-text-primary">{label}</p>
                      <p className="text-xs text-text-secondary mt-0.5">{desc}</p>
                    </div>
                    <button
                      onClick={toggle}
                      className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${value ? 'bg-accent' : 'bg-border'}`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${value ? 'translate-x-5' : 'translate-x-0'}`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Data Management */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card p-6"
            >
              <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#6366F1" strokeWidth="1.8">
                  <rect x="2" y="4" width="12" height="10" rx="2"/><path d="M5 4V3a3 3 0 0 1 6 0v1"/>
                </svg>
                Data Management
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/onboarding')}
                  className="btn-secondary w-full justify-center py-2.5 text-sm"
                >
                  📤 Upload New Data
                </button>
                <button
                  onClick={() => {
                    const blob = new Blob([JSON.stringify(sampleUserData, null, 2)], { type: 'application/json' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a'); a.href = url; a.download = 'Vytel-data-export.json'; a.click()
                  }}
                  className="btn-secondary w-full justify-center py-2.5 text-sm"
                >
                  📥 Export My Data
                </button>

                {!deleteConfirm ? (
                  <button
                    onClick={() => setDeleteConfirm(true)}
                    className="w-full py-2.5 rounded-xl border-2 border-red-200 text-red-500 text-sm font-semibold hover:bg-red-50 transition-colors"
                  >
                    🗑 Delete All Data
                  </button>
                ) : (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-100">
                    <p className="text-sm font-medium text-red-700 mb-3">Are you sure? This cannot be undone.</p>
                    <div className="flex gap-2">
                      <button
                        onClick={handleDeleteData}
                        className="flex-1 py-2 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors"
                      >
                        Yes, Delete
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(false)}
                        className="flex-1 py-2 rounded-lg border border-border text-text-secondary text-sm font-semibold hover:bg-white transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Sign Out */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <button
                onClick={handleLogout}
                className="btn-secondary w-full justify-center py-3 text-sm text-text-secondary"
              >
                Sign Out
              </button>
            </motion.div>
          </div>
        </div>
      </main>

      <Chatbot />
    </div>
  )
}
