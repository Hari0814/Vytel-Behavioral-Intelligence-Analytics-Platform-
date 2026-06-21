import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useApp } from '../context/AppContext'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import InsightCard from '../components/InsightCard'
import Chatbot from '../components/Chatbot'

const FILTERS = ['All', 'Cause-Effect', 'Pattern', 'Comparative', 'Prediction']

const filterMap = {
  'All': null,
  'Cause-Effect': 'causal',
  'Pattern': 'pattern',
  'Comparative': 'compare',
  'Prediction': 'predict'
}

const CauseEffectDiagram = ({ insight }) => (
  <div className="card p-5 mb-4">
    <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
      <span>🔗</span> Cause-Effect Relationship
    </h3>

    <div className="flex items-center gap-3">

      <div className="flex-1 p-3.5 rounded-xl bg-warning/10 border border-warning/20 text-center">
        <p className="text-xs text-text-secondary mb-1">Cause</p>
        <p className="text-sm font-semibold text-text-primary">
          Late-night screen usage (10 PM–1 AM)
        </p>
      </div>

      <div className="flex flex-col items-center gap-1">
        <svg width="32" height="24" viewBox="0 0 32 24" fill="none">
          <path
            d="M2 12h24M20 6l6 6-6 6"
            stroke="#6366F1"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <span className="text-[10px] text-accent font-semibold">
          r = 0.87
        </span>
      </div>

      <div className="flex-1 p-3.5 rounded-xl bg-red-50 border border-red-100 text-center">
        <p className="text-xs text-text-secondary mb-1">Effect</p>
        <p className="text-sm font-semibold text-text-primary">
          34% lower productivity next day
        </p>
      </div>

    </div>

    <div className="mt-4 flex items-center gap-3 text-xs text-text-secondary">

      <span className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-accent"/>
        Correlation Strength:
        <strong className="text-text-primary">0.87</strong>
      </span>

      <span className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-success"/>
        Consistency:
        <strong className="text-text-primary">6/7 days</strong>
      </span>

    </div>
  </div>
)

export default function Insights() {

  const {
    insights,
    userData,
    runAnalysis,
    loading,
    lastAnalysisTime,
  } = useApp()

  const [filter, setFilter] = useState('All')

  const [sortBy, setSortBy] = useState('confidence')

  const [refreshing, setRefreshing] = useState(false)

  // ────────────────────────────────────────────────────────────────────────────
  // MANUAL REFRESH
  // ────────────────────────────────────────────────────────────────────────────

  const handleRefreshInsights = async () => {

    if (!userData) return

    try {

      setRefreshing(true)

      await runAnalysis(userData, true)

    } catch (err) {

      console.error('Refresh failed:', err)

    } finally {

      setRefreshing(false)
    }
  }

  // ────────────────────────────────────────────────────────────────────────────
  // TIMESTAMP FORMATTER
  // ────────────────────────────────────────────────────────────────────────────

  const formattedTimestamp = useMemo(() => {

    if (!lastAnalysisTime) {
      return 'No analysis yet'
    }

    return new Date(lastAnalysisTime).toLocaleString([], {
      dateStyle: 'medium',
      timeStyle: 'short',
    })

  }, [lastAnalysisTime])

  const displayInsights = insights || []

  const filtered = displayInsights
    .filter((i) =>
      !filterMap[filter] || i.type === filterMap[filter]
    )
    .sort((a, b) =>
      sortBy === 'confidence'
        ? b.confidence - a.confidence
        : sortBy === 'impact'
        ? ['high', 'medium', 'low'].indexOf(a.impact)
          - ['high', 'medium', 'low'].indexOf(b.impact)
        : 0
    )

  const avgConfidence = Math.round(
    (
      displayInsights.reduce((s, i) => s + i.confidence, 0)
      / displayInsights.length
    ) * 100
  )

  return (
    <div className="min-h-screen bg-surface">

      <Navbar />

      <Sidebar />

      <main className="ml-60 pt-16 min-h-screen">

        <div className="p-7 max-w-5xl">

          {/* HEADER */}

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-7"
          >

            <h1 className="font-display text-2xl font-bold text-text-primary">
              Behavioral Insights
            </h1>

            <p className="text-text-secondary text-sm mt-0.5">
              Deep AI-generated explanations of your patterns
            </p>

          </motion.div>

          {/* SUMMARY STATS */}

          <div className="grid grid-cols-4 gap-4 mb-7">

            {[
              {
                label: 'Total Insights',
                value: displayInsights.length,
                icon: '🧠'
              },
              {
                label: 'High Impact',
                value: displayInsights.filter(
                  (i) => i.impact === 'high'
                ).length,
                icon: '⚡'
              },
              {
                label: 'Avg Confidence',
                value: `${avgConfidence}%`,
                icon: '🎯'
              },
              {
                label: 'Data Window',
                value: '7 days',
                icon: '📅'
              },
            ].map(({ label, value, icon }, i) => (

              <motion.div
                key={label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="card px-4 py-3.5 flex items-center gap-3"
              >

                <span className="text-xl">{icon}</span>

                <div>

                  <p className="font-display text-xl font-bold text-text-primary">
                    {value}
                  </p>

                  <p className="text-xs text-text-secondary">
                    {label}
                  </p>

                </div>

              </motion.div>
            ))}

          </div>

          {/* CAUSE EFFECT */}

          <CauseEffectDiagram />

          {/* AI CONTROL BAR */}

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-4 mb-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
          >

            <div>

              <div className="flex items-center gap-2 mb-1">

                <span className="text-lg">🧠</span>

                <h3 className="font-semibold text-text-primary">
                  AI Insight Engine
                </h3>

                <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-600 font-semibold">
                  Cached
                </span>

              </div>

              <p className="text-xs text-text-secondary">
                Last updated: {formattedTimestamp}
              </p>

            </div>

            <button
              onClick={handleRefreshInsights}
              disabled={refreshing || loading}
              className="btn-secondary px-4 py-2 text-sm disabled:opacity-50"
            >

              {refreshing || loading
                ? 'Refreshing...'
                : '↻ Refresh AI Insights'}

            </button>

          </motion.div>

          {/* FILTERS & SORT */}

          <div className="flex items-center justify-between mb-5">

            <div className="flex gap-2 flex-wrap">

              {FILTERS.map((f) => (

                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    filter === f
                      ? 'bg-accent text-white'
                      : 'bg-white border border-border text-text-secondary hover:border-accent hover:text-accent'
                  }`}
                >

                  {f}

                </button>
              ))}

            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs border border-border rounded-lg px-3 py-2 text-text-secondary bg-white outline-none"
            >

              <option value="confidence">
                Sort: Confidence
              </option>

              <option value="impact">
                Sort: Impact
              </option>

            </select>

          </div>

          {/* INSIGHT CARDS */}

          <div className="space-y-4">

            {filtered.map((insight, i) => (

              <InsightCard
                key={insight.id || i}
                insight={insight}
                index={i}
                compact={false}
              />

            ))}

            {filtered.length === 0 && (

              <div className="text-center py-12 text-text-secondary">
                No insights for this filter. Try "All".
              </div>

            )}

          </div>

          {/* INFO SECTION */}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 p-5 rounded-2xl bg-white border border-border"
          >

            <h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2">

              <span>⚙️</span>

              How Insights Are Generated

            </h3>

            <div className="grid md:grid-cols-3 gap-4 text-xs text-text-secondary">

              {[
                {
                  step: '01',
                  title: 'Pattern Detection',
                  desc: 'K-Means clustering identifies behavioral clusters and time-based usage patterns.'
                },
                {
                  step: '02',
                  title: 'Correlation Analysis',
                  desc: 'Cross-variable correlation scores (r > 0.6 threshold) detect cause-effect relationships.'
                },
                {
                  step: '03',
                  title: 'LLM Explanation',
                  desc: 'Structured findings are sent to the AI to generate concise, human-readable insights.'
                },
              ].map(({ step, title, desc }) => (

                <div key={step} className="flex gap-3">

                  <span className="font-mono text-accent font-bold text-base flex-shrink-0">
                    {step}
                  </span>

                  <div>

                    <p className="font-semibold text-text-primary mb-0.5">
                      {title}
                    </p>

                    <p>{desc}</p>

                  </div>

                </div>
              ))}

            </div>

          </motion.div>

        </div>

      </main>

      <Chatbot />

    </div>
  )
}