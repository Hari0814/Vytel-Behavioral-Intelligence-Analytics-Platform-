import React, { createContext, useContext, useState, useEffect } from 'react'

const AppContext = createContext(null)

// ─── Helpers ──────────────────────────────────────────────────────────────────
const save = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {}
}

const load = (key, fallback = null) => {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : fallback
  } catch {
    return fallback
  }
}

export function AppProvider({ children }) {

  const [user, setUserState] =
    useState(() => load('vytel_user', null))

  const [token, setTokenState] =
    useState(() => load('vytel_token', null))

  const [userData, setUserDataState] =
    useState(() => load('vytel_userData', null))

  const [insights, setInsightsState] =
    useState(() => load('vytel_insights', []))

  const [lifeScore, setLifeScoreState] =
    useState(() => load('vytel_lifeScore', null))

  const [lastAnalysisTime, setLastAnalysisTimeState] =
    useState(() => load('vytel_lastAnalysisTime', null))

  const [loading, setLoading] = useState(false)

  // ── Persist every state change to localStorage ──────────────────────────────

  const setUser = (v) => {
    setUserState(v)
    save('vytel_user', v)
  }

  const setToken = (v) => {
    setTokenState(v)
    save('vytel_token', v)
  }

  const setUserData = (v) => {
    setUserDataState(v)
    save('vytel_userData', v)
  }

  const setInsights = (v) => {
    setInsightsState(v)
    save('vytel_insights', v)
  }

  const setLifeScore = (v) => {
    setLifeScoreState(v)
    save('vytel_lifeScore', v)
  }

  const setLastAnalysisTime = (v) => {
    setLastAnalysisTimeState(v)
    save('vytel_lastAnalysisTime', v)
  }

  // ── Auth ────────────────────────────────────────────────────────────────────

  const login = (userData, authToken) => {
    setUser(userData)
    setToken(authToken)
  }

  const logout = () => {

    setUser(null)
    save('vytel_user', null)

    setToken(null)
    save('vytel_token', null)

    setUserData(null)
    save('vytel_userData', null)

    setInsights([])
    save('vytel_insights', [])

    setLifeScore(null)
    save('vytel_lifeScore', null)

    setLastAnalysisTime(null)
    save('vytel_lastAnalysisTime', null)
  }

  // ── API ─────────────────────────────────────────────────────────────────────

  const apiBase =
    import.meta.env.VITE_API_URL || 'http://localhost:8000'

  const apiCall = async (
    endpoint,
    method = 'GET',
    body = null
  ) => {

    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    }

    const res = await fetch(`${apiBase}${endpoint}`, {
      method,
      headers,
      ...(body && { body: JSON.stringify(body) }),
    })

    if (!res.ok) {

      const errText = await res.text()

      throw new Error(errText || `HTTP ${res.status}`)
    }

    return res.json()
  }

  // ── Backend Health Check ────────────────────────────────────────────────────

  const checkBackend = async () => {

    try {

      const res = await fetch(`${apiBase}/health`, {
        method: 'GET'
      })

      return res.ok

    } catch {

      return false
    }
  }

  // ── Intelligent Insight Cache Logic ─────────────────────────────────────────

  const shouldRefreshInsights = (
    newData,
    forceRefresh = false
  ) => {

    // Manual refresh button
    if (forceRefresh) {
      return true
    }

    // No insights cached yet
    if (!insights || insights.length === 0) {
      return true
    }

    // No timestamp found
    if (!lastAnalysisTime) {
      return true
    }

    // Auto refresh after 6 hours
    const SIX_HOURS = 6 * 60 * 60 * 1000

    const expired =
      Date.now() -
      new Date(lastAnalysisTime).getTime() >
      SIX_HOURS

    if (expired) {
      return true
    }

    // Detect meaningful data changes
    const oldDataString =
      JSON.stringify(userData || {})

    const newDataString =
      JSON.stringify(newData || {})

    if (oldDataString !== newDataString) {
      return true
    }

    // Use cached insights
    return false
  }

  // ── Run AI Analysis ─────────────────────────────────────────────────────────

  const runAnalysis = async (
    data,
    forceRefresh = false
  ) => {

    // SMART CACHE CHECK
    if (!shouldRefreshInsights(data, forceRefresh)) {

      console.log('⚡ Using cached AI insights')

      return {
        success: true,
        insights,
        lifeScore,
        cached: true,
      }
    }

    console.log('🧠 Generating fresh AI insights')

    setLoading(true)

    try {

      const res = await apiCall(
        '/insights/analyze',
        'POST',
        { data }
      )

      if (res.insights && res.insights.length > 0) {

        setInsights(res.insights)

        setLifeScore(res.life_score)

        setUserData(data)

        setLastAnalysisTime(
          new Date().toISOString()
        )

        return {
          success: true,
          insights: res.insights,
          lifeScore: res.life_score,
          cached: false,
        }
      }

      throw new Error(
        'No insights returned from backend'
      )

    } catch (err) {

      console.error(
        'Analysis error:',
        err.message
      )

      return {
        success: false,
        error: err.message,
      }

    } finally {

      setLoading(false)
    }
  }

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,

        userData,
        setUserData,

        insights,
        setInsights,

        lifeScore,
        setLifeScore,

        lastAnalysisTime,
        setLastAnalysisTime,

        loading,
        setLoading,

        token,
        setToken,

        login,
        logout,

        apiCall,
        apiBase,

        checkBackend,

        runAnalysis,

        shouldRefreshInsights,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)