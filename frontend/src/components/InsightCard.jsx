import React from 'react'
import { motion } from 'framer-motion'

const typeConfig = {
  causal:  { label: 'Cause-Effect', className: 'insight-tag causal',  icon: '⚡' },
  pattern: { label: 'Pattern',      className: 'insight-tag pattern', icon: '🔁' },
  compare: { label: 'Comparative',  className: 'insight-tag compare', icon: '📊' },
  predict: { label: 'Prediction',   className: 'insight-tag predict', icon: '🔮' },
}

const impactConfig = {
  high:   { color: '#EF4444', bg: '#FEF2F2', label: 'High Impact' },
  medium: { color: '#F59E0B', bg: '#FEF3C7', label: 'Medium Impact' },
  low:    { color: '#22C55E', bg: '#F0FDF4', label: 'Low Impact' },
}

export default function InsightCard({ insight, index = 0, compact = false }) {
  const type = typeConfig[insight.type] || typeConfig.pattern
  const impact = impactConfig[insight.impact] || impactConfig.medium
  const confidencePct = Math.round(insight.confidence * 100)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="card p-5 flex flex-col gap-4"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={type.className}>
              {type.icon} {type.label}
            </span>
            <span
              className="insight-tag"
              style={{ background: impact.bg, color: impact.color }}
            >
              {impact.label}
            </span>
          </div>
          <h3 className="font-semibold text-text-primary text-base leading-snug">
            {insight.title}
          </h3>
        </div>

        {/* Confidence Ring */}
        <div className="flex-shrink-0 flex flex-col items-center gap-1">
          <svg width="44" height="44" viewBox="0 0 44 44">
            <circle cx="22" cy="22" r="18" fill="none" stroke="#E2E8F0" strokeWidth="3.5"/>
            <circle
              cx="22" cy="22" r="18"
              fill="none"
              stroke="#6366F1"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 18}`}
              strokeDashoffset={`${2 * Math.PI * 18 * (1 - insight.confidence)}`}
              transform="rotate(-90 22 22)"
            />
            <text x="22" y="26" textAnchor="middle" fontSize="10" fontWeight="600" fill="#0F172A" fontFamily="DM Sans">
              {confidencePct}%
            </text>
          </svg>
          <span className="text-[10px] text-text-secondary font-medium">confidence</span>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-text-secondary leading-relaxed">
        {insight.description}
      </p>

      {!compact && (
        <>
          {/* Variables */}
          {insight.variables && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-text-secondary font-medium">Variables:</span>
              {insight.variables.map((v) => (
                <span key={v} className="font-mono text-[11px] px-2 py-0.5 bg-surface rounded text-text-secondary border border-border">
                  {v}
                </span>
              ))}
            </div>
          )}

          {/* Recommendation */}
          {insight.recommendation && (
            <div className="bg-accent/5 border border-accent/15 rounded-xl p-3.5 flex gap-3">
              <span className="text-base flex-shrink-0">💡</span>
              <p className="text-xs font-medium text-text-primary leading-relaxed">
                {insight.recommendation}
              </p>
            </div>
          )}
        </>
      )}
    </motion.div>
  )
}
