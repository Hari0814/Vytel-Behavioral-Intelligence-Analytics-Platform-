import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

function getScoreLabel(score) {
  if (score >= 75) return { label: 'Good', color: '#22C55E', bg: '#F0FDF4' }
  if (score >= 50) return { label: 'Average', color: '#F59E0B', bg: '#FEF3C7' }
  return { label: 'Poor', color: '#EF4444', bg: '#FEF2F2' }
}

export default function LifeScore({ score = 0 }) {
  const [displayed, setDisplayed] = useState(0)
  const meta = getScoreLabel(score)

  const radius = 60
  const stroke = 7
  const normalizedRadius = radius - stroke / 2
  const circumference = 2 * Math.PI * normalizedRadius
  const progress = (score / 100) * circumference
  const dashOffset = circumference - progress

  useEffect(() => {
    // Animate the number
    let start = 0
    const end = score
    const duration = 1200
    const step = (timestamp) => {
      if (!start) start = timestamp
      const elapsed = timestamp - start
      const current = Math.min(Math.round((elapsed / duration) * end), end)
      setDisplayed(current)
      if (current < end) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [score])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="card p-6 flex flex-col items-center gap-4"
    >
      <div className="flex items-center gap-2 self-start">
        <span className="text-xs font-semibold text-text-secondary uppercase tracking-widest">Life Score</span>
      </div>

      {/* SVG Ring */}
      <div className="relative flex items-center justify-center" style={{ width: radius * 2, height: radius * 2 }}>
        <svg
          width={radius * 2}
          height={radius * 2}
          viewBox={`0 0 ${radius * 2} ${radius * 2}`}
          className="score-ring"
        >
          {/* Background track */}
          <circle
            cx={radius} cy={radius} r={normalizedRadius}
            fill="none"
            stroke="#E2E8F0"
            strokeWidth={stroke}
          />
          {/* Progress arc */}
          <motion.circle
            cx={radius} cy={radius} r={normalizedRadius}
            fill="none"
            stroke="#6366F1"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
            transform={`rotate(-90 ${radius} ${radius})`}
          />
        </svg>

        {/* Score Number */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-3xl font-bold text-text-primary leading-none">
            {displayed}
          </span>
          <span className="text-xs font-medium text-text-secondary mt-1">/ 100</span>
        </div>
      </div>

      {/* Label */}
      <span
        className="px-4 py-1.5 rounded-full text-sm font-semibold"
        style={{ background: meta.bg, color: meta.color }}
      >
        {meta.label}
      </span>

      {/* Breakdown */}
      <div className="w-full space-y-2.5">
        {[
          { label: 'Screen Balance', value: Math.max(20, 100 - score * 0.3) },
          { label: 'Spending Control', value: score * 0.7 },
          { label: 'Activity Level', value: score * 0.85 },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-center gap-3">
            <span className="text-xs text-text-secondary w-32 flex-shrink-0">{label}</span>
            <div className="flex-1 h-1.5 bg-surface rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, value)}%` }}
                transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
                className="h-full bg-accent rounded-full"
              />
            </div>
            <span className="text-xs font-mono text-text-secondary w-8 text-right">
              {Math.round(value)}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
