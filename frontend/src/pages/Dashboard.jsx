import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import InsightCard from '../components/InsightCard'
import LifeScore from '../components/LifeScore'
import ChartCard from '../components/ChartCard'
import Heatmap from '../components/Heatmap'
import Chatbot from '../components/Chatbot'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

const WeeklySummary = ({ avgScreenTime, avgSpending }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.4 }}
    className="card p-5"
  >
    <div className="flex items-center gap-2 mb-3">
      <span className="text-base">📅</span>

      <h3 className="font-semibold text-text-primary">
        Weekly AI Summary
      </h3>

      <span className="ml-auto text-xs font-mono text-text-secondary bg-surface px-2 py-0.5 rounded">
        Live Data
      </span>
    </div>

    <p className="text-sm text-text-secondary leading-relaxed">
      Your average daily screen time is{' '}
      <strong className="text-text-primary">
        {avgScreenTime.toFixed(1)} hours
      </strong>.

      Your average daily spending is{' '}
      <strong className="text-text-primary">
        ₹{avgSpending.toFixed(0)}
      </strong>.
    </p>
  </motion.div>
)

const SpendingPie = ({ categorySpending }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.3 }}
    className="card p-5"
  >
    <h3 className="font-semibold text-text-primary mb-1">
      Spending by Category
    </h3>

    <p className="text-xs text-text-secondary mb-4">
      Live spending distribution
    </p>

    <ResponsiveContainer width="100%" height={160}>
      <PieChart>
        <Pie
          data={categorySpending}
          cx="50%"
          cy="50%"
          innerRadius={45}
          outerRadius={72}
          paddingAngle={3}
          dataKey="value"
        >
          {categorySpending.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>

        <Tooltip
          formatter={(v) => [`₹${v}`, '']}
          contentStyle={{
            borderRadius: 12,
            border: '1px solid #E2E8F0',
            fontSize: 12,
          }}
        />
      </PieChart>
    </ResponsiveContainer>

    <div className="space-y-1.5 mt-2">
      {categorySpending.map((c) => (
        <div key={c.name} className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
            style={{ background: c.color }}
          />

          <span className="text-xs text-text-secondary flex-1">
            {c.name}
          </span>

          <span className="text-xs font-semibold text-text-primary font-mono">
            ₹{c.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  </motion.div>
)

const StatBar = ({
  label,
  value,
  unit,
  trend,
}) => (
  <div className="card px-5 py-4 flex items-center justify-between">
    <div>
      <p className="text-xs text-text-secondary font-medium mb-0.5">
        {label}
      </p>

      <p className="font-display text-2xl font-bold text-text-primary">
        {value}

        <span className="text-sm font-body font-normal text-text-secondary ml-1">
          {unit}
        </span>
      </p>
    </div>

    <div
      className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
        trend > 0
          ? 'bg-red-50 text-red-500'
          : 'bg-green-50 text-green-500'
      }`}
    >
      {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
    </div>
  </div>
)

export default function Dashboard() {

  const {
    insights,
    lifeScore,
    runAnalysis,
    loading,
  } = useApp()

  const navigate = useNavigate()

  const [data, setData] = useState([])

  // ────────────────────────────────────────────────────────────────────────────
  // FETCH REAL DATABASE DATA + RUN AI ANALYSIS
  // ────────────────────────────────────────────────────────────────────────────

  useEffect(() => {

    const fetchAndAnalyze = async () => {

      try {

        const res = await fetch('http://127.0.0.1:8000/data/')

        const result = await res.json()

        setData(result)

        // Convert DB records into backend AI format
        const formattedData = {

          screen_time: result.map((item) => ({
            date: item.date || '2025-01-01',
            hours: item.screen_time || 0,
            app: item.app || 'Unknown',
          })),

          expenses: result.map((item) => ({
            date: item.date || '2025-01-01',
            amount: item.expense || 0,
            category: item.category || 'General',
          })),

          activity: result.map((item) => ({
            date: item.date || '2025-01-01',
            type: item.activity_type || 'work',
            hours: item.activity_hours || 0,
            peak_time: item.peak_time || '10:00',
          })),
        }

        // REAL AI ANALYSIS
        await runAnalysis(formattedData)

      } catch (err) {

        console.error('Dashboard error:', err)

      }
    }

    fetchAndAnalyze()

  }, [])

  // ────────────────────────────────────────────────────────────────────────────
  // CHART DATA
  // ────────────────────────────────────────────────────────────────────────────

  const weeklyScreenTime = data.slice(0, 7).map((item, index) => ({
    day: `Day ${index + 1}`,
    hours: item.screen_time || 0,
    avg: 5,
  }))

  const weeklyExpenses = data.slice(0, 7).map((item, index) => ({
    day: `Day ${index + 1}`,
    amount: item.expense || 0,
    budget: 500,
  }))

  // ────────────────────────────────────────────────────────────────────────────
  // LIVE STATS
  // ────────────────────────────────────────────────────────────────────────────

  const avgScreenTime =
    weeklyScreenTime.reduce((s, d) => s + d.hours, 0) /
    Math.max(weeklyScreenTime.length, 1)

  const avgSpending =
    weeklyExpenses.reduce((s, d) => s + d.amount, 0) /
    Math.max(weeklyExpenses.length, 1)

  // Dynamic category spending
  const categoryMap = {}

  data.forEach((item) => {

    const category = item.category || 'General'

    categoryMap[category] =
      (categoryMap[category] || 0) + (item.expense || 0)

  })

  const colors = [
    '#22C55E',
    '#3B82F6',
    '#F59E0B',
    '#EF4444',
    '#8B5CF6',
  ]

  const categorySpending = Object.entries(categoryMap).map(
    ([name, value], index) => ({
      name,
      value,
      color: colors[index % colors.length],
    })
  )

  const displayInsights = insights || []
  const displayScore = lifeScore || 0

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <Sidebar />

      <main className="ml-60 pt-16 min-h-screen">
        <div className="p-7 max-w-6xl">

          {/* HEADER */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-7"
          >
            <div>
              <h1 className="font-display text-2xl font-bold text-text-primary">
                Dashboard
              </h1>

              <p className="text-text-secondary text-sm mt-0.5">
                Your behavioral intelligence overview
              </p>
            </div>

            <button
              onClick={() => navigate('/onboarding')}
              className="btn-secondary py-2 px-4 text-sm"
            >
              + Update Data
            </button>
          </motion.div>

          {/* LOADING */}
          {loading && (
            <div className="card p-4 mb-5 text-center text-text-secondary">
              🧠 AI is analyzing your behavioral data...
            </div>
          )}

          {/* STAT BARS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

            <StatBar
              label="Avg Daily Screen Time"
              value={avgScreenTime.toFixed(1)}
              unit="hrs"
              trend={18}
            />

            <StatBar
              label="Weekly Spending"
              value={`₹${Math.round(avgSpending * 7)}`}
              unit=""
              trend={31}
            />

            <StatBar
              label="Productive Hours"
              value="5.4"
              unit="hrs/day"
              trend={-12}
            />

            <StatBar
              label="Exercise Days"
              value="2"
              unit="/ 7"
              trend={-40}
            />

          </div>

          {/* MAIN GRID */}
          <div className="grid grid-cols-3 gap-5">

            {/* LEFT */}
            <div className="col-span-2 space-y-5">

              {/* AI INSIGHTS */}
              <div>

                <div className="flex items-center justify-between mb-3">

                  <h2 className="font-semibold text-text-primary flex items-center gap-2">

                    <span>⚡</span> AI Insights

                    <span className="text-xs bg-accent text-white px-2 py-0.5 rounded-full font-normal">
                      {displayInsights.length}
                    </span>

                  </h2>

                  <button
                    onClick={() => navigate('/insights')}
                    className="text-xs text-accent hover:underline font-medium"
                  >
                    View all →
                  </button>

                </div>

                <div className="grid md:grid-cols-2 gap-4">

                  {displayInsights.map((insight, i) => (

                    <InsightCard
                      key={insight.id || i}
                      insight={insight}
                      index={i}
                      compact
                    />

                  ))}

                </div>
              </div>

              {/* CHARTS */}

              <ChartCard
                title="Screen Time"
                subtitle="Daily hours vs 5hr target"
                data={weeklyScreenTime}
                type="area"
                dataKeys={[
                  { key: 'hours', label: 'Screen Time (hrs)' },
                  { key: 'avg', label: 'Target (5 hrs)' },
                ]}
                index={1}
              />

              <ChartCard
                title="Daily Spending"
                subtitle="Actual vs ₹500 daily budget"
                data={weeklyExpenses}
                type="bar"
                dataKeys={[
                  { key: 'amount', label: 'Spending (₹)' },
                  { key: 'budget', label: 'Budget (₹)' },
                ]}
                index={2}
              />

              <Heatmap />

            </div>

            {/* RIGHT */}
            <div className="col-span-1 space-y-5">

              <LifeScore score={displayScore} />

              <WeeklySummary
                avgScreenTime={avgScreenTime}
                avgSpending={avgSpending}
              />

              <SpendingPie
                categorySpending={categorySpending}
              />

            </div>

          </div>
        </div>
      </main>

      <Chatbot />
    </div>
  )
}