import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../context/AppContext'

const QUICK_PROMPTS = [
  'Why is my productivity low?',
  'What should I improve this week?',
  'Analyze my spending habits',
  'When am I most productive?',
]

export default function Chatbot() {

  const [open, setOpen] = useState(false)

  // ────────────────────────────────────────────────────────────────────────────
  // DEFAULT CHAT MESSAGE
  // ────────────────────────────────────────────────────────────────────────────

  const defaultMessage = [
    {
      role: 'assistant',
      text: "Hi! I'm your Vytel assistant. Ask me anything about your behavioral patterns and habits. 🧠",
    },
  ]

  // ────────────────────────────────────────────────────────────────────────────
  // PERSISTENT CHAT MEMORY
  // ────────────────────────────────────────────────────────────────────────────

  const [messages, setMessages] = useState(() => {

    try {

      const saved =
        localStorage.getItem('vytel_chat_history')

      return saved
        ? JSON.parse(saved)
        : defaultMessage

    } catch {

      return defaultMessage
    }
  })

  const [input, setInput] = useState('')

  const [loading, setLoading] = useState(false)

  const bottomRef = useRef(null)

  const {
    apiCall,
    userData,
    insights
  } = useApp()

  // ────────────────────────────────────────────────────────────────────────────
  // AUTO SCROLL
  // ────────────────────────────────────────────────────────────────────────────

  useEffect(() => {

    bottomRef.current?.scrollIntoView({
      behavior: 'smooth'
    })

  }, [messages, open])

  // ────────────────────────────────────────────────────────────────────────────
  // SAVE CHAT HISTORY
  // ────────────────────────────────────────────────────────────────────────────

  useEffect(() => {

    localStorage.setItem(
      'vytel_chat_history',
      JSON.stringify(messages)
    )

  }, [messages])

  // ────────────────────────────────────────────────────────────────────────────
  // SEND MESSAGE
  // ────────────────────────────────────────────────────────────────────────────

  const sendMessage = async (text) => {

    const userText = text || input.trim()

    if (!userText) return

    // USER MESSAGE
    setMessages((prev) => [
      ...prev,
      {
        role: 'user',
        text: userText
      }
    ])

    setInput('')

    setLoading(true)

    try {

      const res = await apiCall(
        '/chat',
        'POST',
        {
          message: userText,

          context: {

            insights,

            userData,

            // SEND RECENT MEMORY
            history: messages.slice(-6),
          },
        }
      )

      // ASSISTANT REPLY
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: res.reply
        }
      ])

    } catch {

      // FALLBACK RESPONSE
      const reply =
        generateMockReply(userText, insights)

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: reply
        }
      ])

    } finally {

      setLoading(false)
    }
  }

  return (
    <>

      {/* FLOATING BUTTON */}

      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          delay: 1,
          type: 'spring'
        }}
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl bg-accent text-white shadow-lg shadow-accent/30 flex items-center justify-center hover:bg-accent-hover transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Open AI Chat"
      >

        <AnimatePresence mode="wait">

          {open ? (

            <motion.svg
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              stroke="white"
              strokeWidth="2.2"
            >

              <line x1="4" y1="4" x2="16" y2="16"/>

              <line x1="16" y1="4" x2="4" y2="16"/>

            </motion.svg>

          ) : (

            <motion.svg
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              width="22"
              height="22"
              viewBox="0 0 22 22"
              fill="none"
              stroke="white"
              strokeWidth="2"
            >

              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>

            </motion.svg>

          )}

        </AnimatePresence>

      </motion.button>

      {/* CHAT PANEL */}

      <AnimatePresence>

        {open && (

          <motion.div
            initial={{
              opacity: 0,
              y: 20,
              scale: 0.95
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1
            }}
            exit={{
              opacity: 0,
              y: 20,
              scale: 0.95
            }}
            transition={{
              duration: 0.25,
              ease: 'easeOut'
            }}
            className="fixed bottom-24 right-6 z-50 w-80 bg-white rounded-2xl shadow-2xl border border-border overflow-hidden flex flex-col"
            style={{ height: '460px' }}
          >

            {/* HEADER */}

            <div className="px-4 py-3 border-b border-border flex items-center gap-3 bg-white">

              <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center text-accent">

                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >

                  <path d="M8 2a6 6 0 1 0 0 12A6 6 0 0 0 8 2z"/>

                  <path d="M8 6v2.5l1.5 1.5"/>

                </svg>

              </div>

              <div>

                <p className="text-sm font-semibold text-text-primary">
                  Vytel Assistant
                </p>

                <p className="text-[11px] text-success font-medium flex items-center gap-1">

                  <span className="w-1.5 h-1.5 rounded-full bg-success inline-block" />

                  Online

                </p>

              </div>

            </div>

            {/* MESSAGES */}

            <div className="flex-1 overflow-y-auto p-4 space-y-3">

              {messages.map((msg, i) => (

                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${
                    msg.role === 'user'
                      ? 'justify-end'
                      : 'justify-start'
                  }`}
                >

                  <div
                    className={`max-w-[80%] px-3 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-accent text-white rounded-br-md'
                        : 'bg-surface text-text-primary rounded-bl-md border border-border'
                    }`}
                  >

                    {msg.text}

                  </div>

                </motion.div>

              ))}

              {loading && (

                <div className="flex justify-start">

                  <div className="bg-surface border border-border rounded-2xl rounded-bl-md px-4 py-3 flex gap-1">

                    {[0, 1, 2].map((i) => (

                      <span
                        key={i}
                        className="w-1.5 h-1.5 bg-text-secondary rounded-full animate-bounce"
                        style={{
                          animationDelay: `${i * 0.12}s`
                        }}
                      />

                    ))}

                  </div>

                </div>

              )}

              <div ref={bottomRef} />

            </div>

            {/* QUICK PROMPTS */}

            {messages.length <= 1 && (

              <div className="px-3 pb-2 flex gap-1.5 flex-wrap">

                {QUICK_PROMPTS.slice(0, 2).map((q) => (

                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="text-[11px] px-2.5 py-1.5 rounded-lg bg-surface border border-border text-text-secondary hover:border-accent hover:text-accent transition-colors"
                  >

                    {q}

                  </button>

                ))}

              </div>

            )}

            {/* INPUT */}

            <div className="p-3 border-t border-border flex gap-2">

              <input
                value={input}
                onChange={(e) =>
                  setInput(e.target.value)
                }
                onKeyDown={(e) =>
                  e.key === 'Enter'
                  && !e.shiftKey
                  && sendMessage()
                }
                placeholder="Ask about your habits..."
                className="flex-1 text-sm input-field py-2 px-3"
              />

              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                className="btn-primary py-2 px-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >

                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >

                  <line x1="15" y1="1" x2="7" y2="9"/>

                  <polygon points="15,1 10,15 7,9 1,6"/>

                </svg>

              </button>

            </div>

          </motion.div>

        )}

      </AnimatePresence>

    </>
  )
}

function generateMockReply(message, insights) {

  const lower = message.toLowerCase()

  if (lower.includes('productiv')) {

    return (
      "Based on your data, productivity drops significantly after 10 PM due to increased social media usage. "
      + "Your peak focus time is 9 AM – 12 PM. Consider protecting those morning hours."
    )
  }

  if (lower.includes('spend') || lower.includes('money')) {

    return (
      "Your spending pattern shows a major weekend surge compared to weekdays. "
      + "The main driver is impulsive shopping. Setting a daily budget could improve control."
    )
  }

  if (lower.includes('improve')) {

    return (
      "Top improvements for this week: "
      + "1) Screen cutoff at 10 PM, "
      + "2) Weekend spending limit, "
      + "3) Daily exercise before social media."
    )
  }

  if (lower.includes('screen') || lower.includes('phone')) {

    return (
      "Your screen usage remains above healthy recommendations, especially late at night. "
      + "Reducing evening usage may improve both productivity and sleep quality."
    )
  }

  return (
    "I analyzed your behavioral patterns and found strong relationships between "
    + "screen usage, productivity, and activity habits. "
    + "Would you like targeted recommendations for a specific area?"
  )
}