import React, { Suspense } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
const ThreeBackground = React.lazy(() => import('../components/ThreeBackground'))

const features = [
  {
    icon: '🔍',
    title: 'Understand Your Habits',
    desc: 'Deep pattern detection across screen time, spending, and activity data.',
  },
  {
    icon: '⚡',
    title: 'Detect Hidden Patterns',
    desc: 'ML-powered clustering reveals behavior cycles you never noticed.',
  },
  {
    icon: '🎯',
    title: 'Make Better Decisions',
    desc: 'AI-generated cause-effect insights guide real behavioral change.',
  },
]

const mockInsights = [
  { tag: 'Cause-Effect', text: 'Late-night screen time reduces next-day productivity by 34%' },
  { tag: 'Pattern', text: 'Weekend spending is 415% higher than weekdays' },
  { tag: 'Prediction', text: 'At current rate, screen time increases 18% next week' },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Navbar />

      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* 3D Background */}
        <Suspense fallback={null}>
          <ThreeBackground className="opacity-80" />
        </Suspense>

        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(#0F172A 1px, transparent 1px), linear-gradient(90deg, #0F172A 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
          }}
        />

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent/20 bg-accent/5 text-accent text-sm font-medium mb-8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            Behavioral Intelligence Platform
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-6xl md:text-7xl font-bold text-text-primary leading-[1.1] mb-6"
          >
            Your Life,{' '}
            <span
              className="relative inline-block"
              style={{
                background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Decoded
            </span>{' '}
            by AI.
          </motion.h1>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed mb-10"
          >
            We don't track your life.{' '}
            <span className="text-text-primary font-medium">We explain it.</span>
            {' '}Transform raw behavioral data into actionable insights that drive real change.
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/signup" className="btn-primary text-base px-8 py-4">
              Get Started — It's Free
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 9h10M9 4l5 5-5 5"/>
              </svg>
            </Link>
            <Link to="/dashboard" className="btn-secondary text-base px-8 py-4">
              View Demo Dashboard
            </Link>
          </motion.div>

          {/* Social proof */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-sm text-text-secondary mt-6"
          >
            Trusted by students & professionals who want to understand themselves better.
          </motion.p>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5"
        >
          <span className="text-xs text-text-secondary font-medium tracking-wider">SCROLL</span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#64748B" strokeWidth="1.8">
            <path d="M4 6l4 4 4-4"/>
          </svg>
        </motion.div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-28 px-6 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold text-accent uppercase tracking-widest">What Vytel Does</span>
          <h2 className="font-display text-4xl font-bold text-text-primary mt-3 mb-4">
            Intelligence over information
          </h2>
          <p className="text-text-secondary text-lg max-w-xl mx-auto">
            Current tools give you data. Vytel gives you understanding.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.5 }}
              className="card p-7"
            >
              <div className="w-12 h-12 rounded-2xl bg-accent/8 flex items-center justify-center text-2xl mb-4">
                {f.icon}
              </div>
              <h3 className="font-semibold text-text-primary text-lg mb-2">{f.title}</h3>
              <p className="text-text-secondary text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* PREVIEW */}
      <section id="preview" className="py-24 px-6 bg-surface">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="font-display text-4xl font-bold text-text-primary mb-4">
              Sample AI Insights
            </h2>
            <p className="text-text-secondary">Here's what Vytel generates from your behavioral data</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-4">
            {mockInsights.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card p-5"
              >
                <span className="text-xs font-semibold text-accent bg-accent/8 px-2.5 py-1 rounded-full">
                  {item.tag}
                </span>
                <p className="text-text-primary font-medium text-sm mt-3 leading-relaxed">
                  "{item.text}"
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FOOTER */}
      <section className="py-28 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-display text-4xl font-bold text-text-primary mb-4">
            Ready to understand yourself?
          </h2>
          <p className="text-text-secondary text-lg mb-8 max-w-lg mx-auto">
            Start your behavioral analysis today. Upload your data, let the AI work, and discover what's really driving your habits.
          </p>
          <Link to="/signup" className="btn-primary text-base px-10 py-4">
            Start Your Analysis
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 9h10M9 4l5 5-5 5"/>
            </svg>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6 text-center">
        <p className="text-text-secondary text-sm">
          © {new Date().getFullYear()} Vytel · Behavioral Intelligence Platform ·{' '}
          <span className="text-accent">Your data stays yours.</span>
        </p>
      </footer>
    </div>
  )
}
