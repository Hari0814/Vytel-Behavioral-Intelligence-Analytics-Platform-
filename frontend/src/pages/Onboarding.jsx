import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../context/AppContext'
import { sampleUserData } from '../data/sampleData'
import Navbar from '../components/Navbar'

const STEPS = [
  { title: 'Welcome to Vytel', subtitle: 'What we do' },
  { title: 'Upload Your Data', subtitle: 'Feed the intelligence engine' },
  { title: 'Data Permissions', subtitle: 'Your privacy matters' },
  { title: 'Analyzing Behavior', subtitle: 'AI at work' },
]

const ANALYSIS_STEPS = [
  { label: 'Connecting to backend', threshold: 10 },
  { label: 'Pattern Detection (K-Means)', threshold: 30 },
  { label: 'Relationship Analysis (Pearson r)', threshold: 55 },
  { label: 'Prediction Engine (Linear Regression)', threshold: 72 },
  { label: 'Generating AI Insights (Gemini)', threshold: 88 },
  { label: 'Confidence Scoring', threshold: 96 },
]

export default function Onboarding() {
  const [step, setStep]               = useState(0)
  const [dataMode, setDataMode]       = useState(null)
  const [uploadedData, setUploadedData] = useState(null)
  const [analyzeProgress, setAnalyzeProgress] = useState(0)
  const [analysisLog, setAnalysisLog] = useState([])
  const [backendOnline, setBackendOnline] = useState(null) // null=checking, true, false
  const [analysisError, setAnalysisError] = useState('')

  const { runAnalysis, checkBackend, insights } = useApp()
  const navigate = useNavigate()

  // Check backend on mount
  useEffect(() => {
    checkBackend().then(online => setBackendOnline(online))
  }, [])

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result)
        // Validate structure
        if (!parsed.screen_time && !parsed.expenses && !parsed.activity) {
          alert('Invalid format. File must have screen_time, expenses, or activity fields.')
          return
        }
        setUploadedData(parsed)
        setDataMode('upload')
      } catch {
        alert('Invalid JSON file. Please check the format and try again.')
      }
    }
    reader.readAsText(file)
  }

  const handleSimulate = () => {
    setUploadedData(sampleUserData)
    setDataMode('simulate')
  }

  const addLog = (msg, status = 'done') => {
    setAnalysisLog(prev => [...prev, { msg, status, time: new Date().toLocaleTimeString() }])
  }

  const handleAnalyze = async () => {
    setStep(3)
    setAnalysisError('')
    setAnalysisLog([])
    setAnalyzeProgress(0)

    const finalData = uploadedData || sampleUserData

    // Animated progress with real step labels
    let currentProgress = 0
    const progressInterval = setInterval(() => {
      setAnalyzeProgress(prev => {
        if (prev >= 95) { clearInterval(progressInterval); return 95 }
        return prev + Math.random() * 4
      })
    }, 180)

    // Log steps as progress advances
    addLog('Connecting to Vytel backend…', 'running')

    // Check backend first
    const online = await checkBackend()
    setBackendOnline(online)

    if (!online) {
      clearInterval(progressInterval)
      setAnalyzeProgress(0)
      setAnalysisError('Backend is not running. Start it with: uvicorn app.main:app --reload --port 8000')
      return
    }

    addLog('Backend connected ✓', 'done')
    addLog('Running pattern detection…', 'running')
    setAnalyzeProgress(25)

    // Run actual analysis
    const result = await runAnalysis(finalData)

    if (!result.success) {
      clearInterval(progressInterval)
      setAnalyzeProgress(0)
      setAnalysisError(`Analysis failed: ${result.error}. Check your backend terminal for details.`)
      addLog(`Error: ${result.error}`, 'error')
      return
    }

    addLog(`Pattern detection complete ✓`, 'done')
    addLog('Relationship analysis complete ✓', 'done')
    addLog('Predictions generated ✓', 'done')
    addLog(`${result.insights.length} insights generated ✓`, 'done')
    addLog(`Life Score: ${result.lifeScore}/100 ✓`, 'done')

    clearInterval(progressInterval)
    setAnalyzeProgress(100)

    await new Promise(r => setTimeout(r, 1000))
    navigate('/dashboard')
  }

  const progressPct = ((step + 1) / STEPS.length) * 100

  const stepVariants = {
    enter:  { opacity: 0, x: 30 },
    center: { opacity: 1, x: 0 },
    exit:   { opacity: 0, x: -30 },
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-20 pb-10">

        {/* Backend Status Banner */}
        {backendOnline === false && step < 3 && (
          <div className="w-full max-w-lg mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
            <span className="text-red-500 text-lg">⚠️</span>
            <div>
              <p className="text-sm font-semibold text-red-700">Backend not running</p>
              <p className="text-xs text-red-500 font-mono mt-0.5">
                cd vytel/backend → venv\Scripts\activate → uvicorn app.main:app --reload --port 8000
              </p>
            </div>
          </div>
        )}
        {backendOnline === true && step < 3 && (
          <div className="w-full max-w-lg mb-4 px-4 py-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <p className="text-sm font-medium text-green-700">Backend connected — ready to analyze</p>
          </div>
        )}

        {/* Step Progress */}
        <div className="w-full max-w-lg mb-8">
          <div className="flex items-center justify-between mb-3">
            {STEPS.map((s, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                  i < step ? 'bg-accent text-white'
                  : i === step ? 'bg-accent text-white ring-4 ring-accent/20'
                  : 'bg-surface border-2 border-border text-text-secondary'
                }`}>
                  {i < step ? (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="white" strokeWidth="2.5">
                      <polyline points="2,7 5.5,10.5 12,4"/>
                    </svg>
                  ) : i + 1}
                </div>
                <span className={`text-[10px] font-medium hidden sm:block ${i === step ? 'text-accent' : 'text-text-secondary'}`}>
                  {s.subtitle}
                </span>
              </div>
            ))}
          </div>
          <div className="h-1.5 bg-surface rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-accent rounded-full"
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="w-full max-w-lg">
          <AnimatePresence mode="wait">

            {/* STEP 0 — Introduction */}
            {step === 0 && (
              <motion.div key="step0" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="card p-8 text-center">
                <div className="text-5xl mb-5">🧠</div>
                <h2 className="font-display text-2xl font-bold text-text-primary mb-3">What Vytel Does</h2>
                <p className="text-text-secondary mb-6 leading-relaxed text-sm">
                  Vytel analyzes your screen time, spending, and activity using machine learning to generate real behavioral insights — not generic advice, but findings specific to your data.
                </p>
                <div className="space-y-3 text-left mb-8">
                  {[
                    ['🔍', 'Pattern Detection',   'K-Means clustering on your actual data'],
                    ['⚡', 'Cause-Effect Analysis', 'Pearson correlation between your variables'],
                    ['🤖', 'Gemini AI Insights',    'Real AI generates your insight text'],
                    ['🔮', 'Predictions',           'Linear regression on your behavioral trend'],
                  ].map(([icon, title, desc]) => (
                    <div key={title} className="flex items-start gap-3 p-3.5 rounded-xl bg-surface">
                      <span className="text-xl flex-shrink-0">{icon}</span>
                      <div>
                        <p className="text-sm font-semibold text-text-primary">{title}</p>
                        <p className="text-xs text-text-secondary">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={() => setStep(1)} className="btn-primary w-full justify-center">
                  Let's Start →
                </button>
              </motion.div>
            )}

            {/* STEP 1 — Data Upload */}
            {step === 1 && (
              <motion.div key="step1" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="card p-8">
                <h2 className="font-display text-2xl font-bold text-text-primary mb-2">Upload Your Data</h2>
                <p className="text-text-secondary text-sm mb-6">
                  Upload a real JSON file — or use simulated data to see the full AI pipeline in action.
                </p>

                {/* JSON Format Preview */}
                <div className="mb-4 p-3 bg-surface rounded-xl border border-border">
                  <p className="text-xs font-semibold text-text-secondary mb-2">Expected JSON format:</p>
                  <pre className="text-[10px] font-mono text-text-secondary leading-relaxed overflow-x-auto">{`{
  "screen_time": [
    { "date": "2024-01-01", "hours": 6.5, "app": "Instagram" }
  ],
  "expenses": [
    { "date": "2024-01-01", "amount": 450, "category": "Food" }
  ],
  "activity": [
    { "date": "2024-01-01", "type": "work", "hours": 8 }
  ]
}`}</pre>
                </div>

                <label className="block w-full border-2 border-dashed border-border rounded-2xl p-7 text-center cursor-pointer hover:border-accent hover:bg-accent/2 transition-all duration-200 mb-4">
                  <input type="file" accept=".json" className="hidden" onChange={handleFileUpload} />
                  <div className="text-3xl mb-3">📄</div>
                  <p className="font-semibold text-text-primary mb-1">Drop JSON file here</p>
                  <p className="text-xs text-text-secondary">or click to browse</p>
                  {dataMode === 'upload' && uploadedData && (
                    <p className="mt-3 text-success text-sm font-medium flex items-center justify-center gap-1.5">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="2,7 5.5,10.5 12,4"/></svg>
                      File loaded — {Object.values(uploadedData).flat().length} data points ready
                    </p>
                  )}
                </label>

                <div className="flex items-center gap-3 my-4">
                  <hr className="flex-1 border-border" />
                  <span className="text-xs text-text-secondary font-medium">OR</span>
                  <hr className="flex-1 border-border" />
                </div>

                <button
                  onClick={handleSimulate}
                  className={`w-full py-3.5 rounded-xl border-2 text-sm font-semibold transition-all duration-200 ${
                    dataMode === 'simulate'
                      ? 'border-accent bg-accent/8 text-accent'
                      : 'border-border text-text-secondary hover:border-accent hover:text-accent'
                  }`}
                >
                  {dataMode === 'simulate' ? '✓ Simulated data ready (28 data points)' : '🎲 Use Simulated Data'}
                </button>

                <div className="flex gap-3 mt-6">
                  <button onClick={() => setStep(0)} className="btn-secondary flex-1 justify-center">← Back</button>
                  <button
                    onClick={() => dataMode ? setStep(2) : null}
                    disabled={!dataMode}
                    className="btn-primary flex-1 justify-center disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Continue →
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2 — Permissions */}
            {step === 2 && (
              <motion.div key="step2" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="card p-8">
                <h2 className="font-display text-2xl font-bold text-text-primary mb-2">Data & Privacy</h2>
                <p className="text-text-secondary text-sm mb-6">Here's exactly what the AI uses and why:</p>

                <div className="space-y-3 mb-6">
                  {[
                    { icon: '📱', title: 'Screen Time', use: 'K-Means clustering + time segmentation', why: 'Detects usage patterns and peak activity windows' },
                    { icon: '💰', title: 'Expenses',    use: 'Pearson correlation + trend regression', why: 'Links spending to screen behavior and forecasts trends' },
                    { icon: '🏃', title: 'Activity',    use: 'Productivity scoring + exercise tracking', why: 'Connects activity to performance and behavioral outcomes' },
                  ].map(({ icon, title, use, why }) => (
                    <div key={title} className="p-4 rounded-xl bg-surface border border-border">
                      <div className="flex items-center gap-2 mb-2">
                        <span>{icon}</span>
                        <span className="font-semibold text-sm text-text-primary">{title}</span>
                        <span className="ml-auto text-xs text-success font-medium">✓ Used for ML</span>
                      </div>
                      <p className="text-xs text-text-secondary mb-1"><strong>How:</strong> {use}</p>
                      <p className="text-xs text-text-secondary"><strong>Why:</strong> {why}</p>
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-xl bg-accent/5 border border-accent/15 mb-6">
                  <p className="text-xs text-text-primary font-medium flex items-start gap-2">
                    <span>🔒</span>
                    Your data is processed only to generate your insights. It is never sold or shared.
                    Only structured ML findings (not raw data) are sent to Gemini AI.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="btn-secondary flex-1 justify-center">← Back</button>
                  <button
                    onClick={handleAnalyze}
                    disabled={backendOnline === false}
                    className="btn-primary flex-1 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {backendOnline === false ? 'Backend Offline ⚠️' : 'Analyze My Data →'}
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3 — Analyzing */}
            {step === 3 && (
              <motion.div key="step3" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="card p-8">
                <div className="text-4xl mb-4 text-center">
                  {analysisError ? '❌' : analyzeProgress === 100 ? '✅' : '🧠'}
                </div>
                <h2 className="font-display text-2xl font-bold text-text-primary mb-2 text-center">
                  {analysisError ? 'Analysis Failed' : analyzeProgress === 100 ? 'Analysis Complete!' : 'Analyzing Your Data…'}
                </h2>

                {/* Error State */}
                {analysisError ? (
                  <div className="mt-4">
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl mb-4">
                      <p className="text-sm font-semibold text-red-700 mb-1">Error</p>
                      <p className="text-xs text-red-600 leading-relaxed">{analysisError}</p>
                    </div>
                    <button onClick={() => { setStep(2); setAnalysisError(''); setAnalysisLog([]); }} className="btn-secondary w-full justify-center">
                      ← Try Again
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Progress Bar */}
                    <div className="h-2 bg-surface rounded-full overflow-hidden mb-2">
                      <motion.div
                        className="h-full bg-accent rounded-full transition-all duration-300"
                        style={{ width: `${analyzeProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-text-secondary font-mono text-center mb-5">
                      {Math.round(analyzeProgress)}%
                    </p>

                    {/* Live Log */}
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {ANALYSIS_STEPS.map(({ label, threshold }, i) => {
                        const done = analyzeProgress > threshold
                        const running = analyzeProgress > (ANALYSIS_STEPS[i - 1]?.threshold || 0) && !done
                        return (
                          <div key={label} className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
                              done ? 'bg-success' : running ? 'bg-accent animate-pulse' : 'bg-surface border border-border'
                            }`}>
                              {done && (
                                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="white" strokeWidth="2.5">
                                  <polyline points="1.5,5 4,7.5 8.5,2.5"/>
                                </svg>
                              )}
                            </div>
                            <span className={`text-sm font-medium ${done ? 'text-text-primary' : running ? 'text-accent' : 'text-text-secondary'}`}>
                              {label}
                            </span>
                            {running && <span className="text-xs text-accent animate-pulse ml-auto">running…</span>}
                            {done && <span className="text-xs text-success ml-auto">✓</span>}
                          </div>
                        )
                      })}
                    </div>
                  </>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}