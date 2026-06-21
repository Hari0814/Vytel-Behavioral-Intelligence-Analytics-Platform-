import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { heatmapData } from '../data/sampleData'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const HOURS = Array.from({ length: 24 }, (_, i) =>
  i === 0 ? '12A' : i < 12 ? `${i}A` : i === 12 ? '12P' : `${i - 12}P`
)

const intensityColors = [
  'bg-surface',          // 0
  'bg-indigo-100',       // 1
  'bg-indigo-300',       // 2
  'bg-indigo-500',       // 3
  'bg-indigo-700',       // 4+
]

export default function Heatmap({ data = heatmapData }) {
  const [tooltip, setTooltip] = useState(null)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.4 }}
      className="card p-5"
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-text-primary text-base">Behavior Heatmap</h3>
          <p className="text-xs text-text-secondary mt-0.5">Activity intensity by day & hour</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-secondary">Less</span>
          {intensityColors.map((c, i) => (
            <div key={i} className={`w-3 h-3 rounded-sm ${c} border border-border`} />
          ))}
          <span className="text-xs text-text-secondary">More</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-max">
          {/* Hour labels */}
          <div className="flex gap-0.5 mb-1 ml-8">
            {HOURS.map((h, i) => (
              <div key={i} className="w-[18px] text-[9px] text-text-secondary text-center leading-none">
                {i % 3 === 0 ? h : ''}
              </div>
            ))}
          </div>

          {/* Grid */}
          {data.map((dayRow, dayIdx) => (
            <div key={dayIdx} className="flex items-center gap-0.5 mb-0.5">
              <span className="w-8 text-[11px] text-text-secondary text-right pr-1.5 flex-shrink-0">
                {DAYS[dayIdx]}
              </span>
              {dayRow.map((val, hourIdx) => {
                const colorIdx = Math.min(val, 4)
                return (
                  <div
                    key={hourIdx}
                    className={`heatmap-cell w-[18px] h-[14px] cursor-pointer ${intensityColors[colorIdx]} border border-white`}
                    onMouseEnter={(e) => setTooltip({
                      day: DAYS[dayIdx],
                      hour: HOURS[hourIdx],
                      val,
                      x: e.clientX,
                      y: e.clientY,
                    })}
                    onMouseLeave={() => setTooltip(null)}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 bg-white border border-border shadow-lg rounded-lg px-3 py-2 text-xs pointer-events-none"
          style={{ top: tooltip.y - 60, left: tooltip.x - 60 }}
        >
          <p className="font-semibold text-text-primary">{tooltip.day} @ {tooltip.hour}</p>
          <p className="text-text-secondary">Intensity: {tooltip.val}/4</p>
        </div>
      )}
    </motion.div>
  )
}
