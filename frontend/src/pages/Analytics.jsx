import React, { useState } from 'react'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import ChartCard from '../components/ChartCard'
import Chatbot from '../components/Chatbot'
import { weeklyScreenTime, weeklyExpenses } from '../data/sampleData'
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ZAxis,
} from 'recharts'

const radarData = [
  { subject: 'Screen Balance', A: 38 },
  { subject: 'Spending Control', A: 52 },
  { subject: 'Sleep Quality', A: 65 },
  { subject: 'Exercise', A: 28 },
  { subject: 'Productivity', A: 55 },
  { subject: 'Social Balance', A: 70 },
]

const correlationData = [
  { screen: 7.5, spending: 749, z: 1 }, { screen: 6.0, spending: 719, z: 1 },
  { screen: 4.5, spending: 250, z: 1 }, { screen: 8.0, spending: 1249, z: 1 },
  { screen: 5.0, spending: 180, z: 1 }, { screen: 9.0, spending: 1550, z: 1 },
  { screen: 10.0, spending: 1900, z: 1 },
]

const monthlyData = [
  { day: 'W1', hours: 6.2, amount: 4200 },
  { day: 'W2', hours: 7.1, amount: 5800 },
  { day: 'W3', hours: 6.8, amount: 4900 },
  { day: 'W4', hours: 7.5, amount: 6600 },
]

const PERIODS = ['7 Days', '30 Days']

export default function Analytics() {
  const [period, setPeriod] = useState('7 Days')

  const screenData = period === '7 Days' ? weeklyScreenTime : monthlyData
  const spendData  = period === '7 Days' ? weeklyExpenses  : monthlyData.map((d) => ({ ...d, amount: d.amount, budget: 3500 }))

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <Sidebar />

      <main className="ml-60 pt-16 min-h-screen">
        <div className="p-7 max-w-5xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-7"
          >
            <div>
              <h1 className="font-display text-2xl font-bold text-text-primary">Analytics</h1>
              <p className="text-text-secondary text-sm mt-0.5">Detailed charts and behavioral breakdowns</p>
            </div>
            <div className="flex gap-1.5 p-1 bg-white border border-border rounded-xl">
              {PERIODS.map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    period === p ? 'bg-accent text-white shadow-sm' : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Trend Charts */}
          <div className="grid md:grid-cols-2 gap-5 mb-5">
            <ChartCard
              title="Screen Time Trend"
              subtitle={`${period} average: 7.2 hrs/day`}
              data={screenData}
              type="area"
              dataKeys={[{ key: 'hours', label: 'Hours' }]}
              index={0}
            />
            <ChartCard
              title="Spending Trend"
              subtitle={`${period} total: ₹6,597`}
              data={spendData}
              type="area"
              dataKeys={[{ key: 'amount', label: 'Amount (₹)' }]}
              index={1}
            />
          </div>

          {/* Radar + Scatter */}
          <div className="grid md:grid-cols-2 gap-5 mb-5">
            {/* Radar — Behavior Balance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="card p-5"
            >
              <h3 className="font-semibold text-text-primary mb-1">Behavior Balance Radar</h3>
              <p className="text-xs text-text-secondary mb-4">Multi-dimensional behavioral score</p>
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={radarData} outerRadius={80}>
                  <PolarGrid stroke="#E2E8F0" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fontSize: 11, fill: '#64748B', fontFamily: 'DM Sans' }}
                  />
                  <Radar
                    name="Score"
                    dataKey="A"
                    stroke="#6366F1"
                    fill="#6366F1"
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Scatter — Screen vs Spending */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="card p-5"
            >
              <h3 className="font-semibold text-text-primary mb-1">Screen Time vs Spending</h3>
              <p className="text-xs text-text-secondary mb-4">Correlation visualization (r = 0.89)</p>
              <ResponsiveContainer width="100%" height={220}>
                <ScatterChart margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis
                    type="number" dataKey="screen" name="Screen Time"
                    unit="h" tick={{ fontSize: 11, fill: '#94A3B8', fontFamily: 'DM Sans' }}
                    axisLine={false} tickLine={false}
                  />
                  <YAxis
                    type="number" dataKey="spending" name="Spending"
                    unit="₹" tick={{ fontSize: 11, fill: '#94A3B8', fontFamily: 'DM Sans' }}
                    axisLine={false} tickLine={false}
                  />
                  <ZAxis range={[60, 60]} />
                  <Tooltip
                    cursor={{ strokeDasharray: '3 3' }}
                    contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }}
                    formatter={(v, n) => [n === 'Screen Time' ? `${v}h` : `₹${v}`, n]}
                  />
                  <Scatter data={correlationData} fill="#6366F1" fillOpacity={0.7} />
                </ScatterChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* Comparison Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-border">
              <h3 className="font-semibold text-text-primary">Weekday vs Weekend Comparison</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-surface text-left">
                    {['Metric', 'Weekdays (Avg)', 'Weekends (Avg)', 'Difference', 'Status'].map((h) => (
                      <th key={h} className="px-5 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    { metric: 'Screen Time', weekday: '6.0 hrs', weekend: '9.5 hrs', diff: '+58%', bad: true },
                    { metric: 'Spending',    weekday: '₹670',    weekend: '₹3,450',  diff: '+415%', bad: true },
                    { metric: 'Productivity', weekday: '6.2 hrs', weekend: '1.5 hrs', diff: '-76%', bad: true },
                    { metric: 'Exercise',    weekday: '0.5 hrs', weekend: '0.8 hrs', diff: '+60%', bad: false },
                    { metric: 'Sleep',       weekday: '6.8 hrs', weekend: '8.5 hrs', diff: '+25%', bad: false },
                  ].map(({ metric, weekday, weekend, diff, bad }) => (
                    <tr key={metric} className="hover:bg-surface/50 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-text-primary">{metric}</td>
                      <td className="px-5 py-3.5 text-text-secondary font-mono text-xs">{weekday}</td>
                      <td className="px-5 py-3.5 text-text-secondary font-mono text-xs">{weekend}</td>
                      <td className="px-5 py-3.5">
                        <span className={`font-mono text-xs font-semibold px-2 py-0.5 rounded ${
                          bad ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50'
                        }`}>{diff}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          bad ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'
                        }`}>
                          {bad ? '⚠ Needs attention' : '✓ On track'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </main>

      <Chatbot />
    </div>
  )
}
