// Sample data for testing Vytel without real data

export const sampleUserData = {
  screen_time: [
    { date: "2024-01-01", hours: 7.5, app: "Instagram" },
    { date: "2024-01-01", hours: 2.0, app: "YouTube" },
    { date: "2024-01-01", hours: 1.5, app: "WhatsApp" },
    { date: "2024-01-02", hours: 6.0, app: "Instagram" },
    { date: "2024-01-02", hours: 3.0, app: "YouTube" },
    { date: "2024-01-02", hours: 2.0, app: "Twitter" },
    { date: "2024-01-03", hours: 4.5, app: "Instagram" },
    { date: "2024-01-03", hours: 1.5, app: "YouTube" },
    { date: "2024-01-03", hours: 3.0, app: "Netflix" },
    { date: "2024-01-04", hours: 8.0, app: "Instagram" },
    { date: "2024-01-04", hours: 2.5, app: "YouTube" },
    { date: "2024-01-04", hours: 1.0, app: "WhatsApp" },
    { date: "2024-01-05", hours: 5.0, app: "Instagram" },
    { date: "2024-01-05", hours: 2.0, app: "YouTube" },
    { date: "2024-01-06", hours: 9.0, app: "Netflix" },
    { date: "2024-01-06", hours: 3.0, app: "Instagram" },
    { date: "2024-01-07", hours: 10.0, app: "YouTube" },
    { date: "2024-01-07", hours: 4.0, app: "Instagram" },
  ],
  expenses: [
    { date: "2024-01-01", amount: 450, category: "Food" },
    { date: "2024-01-01", amount: 299, category: "Shopping" },
    { date: "2024-01-02", amount: 120, category: "Food" },
    { date: "2024-01-02", amount: 599, category: "Shopping" },
    { date: "2024-01-03", amount: 200, category: "Food" },
    { date: "2024-01-03", amount: 50, category: "Transport" },
    { date: "2024-01-04", amount: 350, category: "Food" },
    { date: "2024-01-04", amount: 899, category: "Shopping" },
    { date: "2024-01-05", amount: 180, category: "Food" },
    { date: "2024-01-06", amount: 1200, category: "Shopping" },
    { date: "2024-01-06", amount: 350, category: "Entertainment" },
    { date: "2024-01-07", amount: 1500, category: "Shopping" },
    { date: "2024-01-07", amount: 400, category: "Food" },
  ],
  activity: [
    { date: "2024-01-01", type: "work", hours: 8, peak_time: "10:00" },
    { date: "2024-01-01", type: "exercise", hours: 1, peak_time: "07:00" },
    { date: "2024-01-02", type: "work", hours: 6, peak_time: "11:00" },
    { date: "2024-01-02", type: "social", hours: 3, peak_time: "21:00" },
    { date: "2024-01-03", type: "work", hours: 7, peak_time: "10:00" },
    { date: "2024-01-03", type: "exercise", hours: 0.5, peak_time: "18:00" },
    { date: "2024-01-04", type: "work", hours: 5, peak_time: "14:00" },
    { date: "2024-01-04", type: "social", hours: 5, peak_time: "22:00" },
    { date: "2024-01-05", type: "work", hours: 4, peak_time: "15:00" },
    { date: "2024-01-06", type: "rest", hours: 10, peak_time: "23:00" },
    { date: "2024-01-07", type: "rest", hours: 12, peak_time: "00:00" },
  ]
}

// Pre-computed chart data for dashboard
export const weeklyScreenTime = [
  { day: 'Mon', hours: 7.5, avg: 5 },
  { day: 'Tue', hours: 6.0, avg: 5 },
  { day: 'Wed', hours: 4.5, avg: 5 },
  { day: 'Thu', hours: 8.0, avg: 5 },
  { day: 'Fri', hours: 5.0, avg: 5 },
  { day: 'Sat', hours: 9.0, avg: 5 },
  { day: 'Sun', hours: 10.0, avg: 5 },
]

export const weeklyExpenses = [
  { day: 'Mon', amount: 749, budget: 500 },
  { day: 'Tue', amount: 719, budget: 500 },
  { day: 'Wed', amount: 250, budget: 500 },
  { day: 'Thu', amount: 1249, budget: 500 },
  { day: 'Fri', amount: 180, budget: 500 },
  { day: 'Sat', amount: 1550, budget: 500 },
  { day: 'Sun', amount: 1900, budget: 500 },
]

export const categorySpending = [
  { name: 'Shopping', value: 4547, color: '#6366F1' },
  { name: 'Food', value: 2050, color: '#22C55E' },
  { name: 'Entertainment', value: 350, color: '#F59E0B' },
  { name: 'Transport', value: 50, color: '#64748B' },
]

// Heatmap data: hours[day][hour] = intensity 0-4
export const heatmapData = Array.from({ length: 7 }, (_, dayIdx) =>
  Array.from({ length: 24 }, (_, hour) => {
    // Simulate higher usage late night and weekends
    const isWeekend = dayIdx >= 5
    const isLateNight = hour >= 22 || hour <= 1
    const isEvening = hour >= 18 && hour < 22
    const isWorkHour = hour >= 9 && hour < 17
    let base = 0
    if (isLateNight && isWeekend) base = 4
    else if (isLateNight) base = 3
    else if (isEvening && isWeekend) base = 3
    else if (isEvening) base = 2
    else if (isWorkHour && !isWeekend) base = 1
    return base + (Math.random() > 0.7 ? 1 : 0)
  })
)

export const sampleInsights = [
  {
    id: 1,
    type: 'causal',
    title: 'Late-Night Usage Hurts Productivity',
    description: 'Your screen time consistently spikes after 10 PM (avg 3.2 hrs), correlating with 34% lower work output the following day.',
    confidence: 0.87,
    impact: 'high',
    variables: ['screen_time', 'productivity'],
    recommendation: 'Set a screen cutoff at 10 PM on weeknights to reclaim morning productivity.',
  },
  {
    id: 2,
    type: 'pattern',
    title: 'Weekend Spending Surge',
    description: 'Weekend daily spending averages ₹3,450 vs ₹670 on weekdays — a 415% increase, driven primarily by shopping and entertainment.',
    confidence: 0.92,
    impact: 'high',
    variables: ['spending', 'weekday_vs_weekend'],
    recommendation: 'Set a weekend spending budget of ₹1,500/day to reduce impulsive purchases.',
  },
  {
    id: 3,
    type: 'compare',
    title: 'Social Media Displaces Exercise',
    description: 'On days with 6+ hours of screen time, exercise drops to near zero. You exercised on only 2 of 7 days this week.',
    confidence: 0.79,
    impact: 'medium',
    variables: ['screen_time', 'exercise'],
    recommendation: 'Schedule 30 min of exercise before your phone usage begins each day.',
  },
  {
    id: 4,
    type: 'predict',
    title: 'Spending Trend: +18% Next Week',
    description: 'Based on your current velocity, projected weekly spending will reach ₹8,900 next week if patterns continue.',
    confidence: 0.71,
    impact: 'medium',
    variables: ['spending_trend'],
    recommendation: 'Review subscriptions and set daily spending alerts.',
  },
]
