import { useEffect, useMemo, useRef, useState } from 'react'
import Home from './pages/Home'
import Statistics from './pages/Statistics'
import {
  CATEGORY_CONFIG,
  calculateBudgetInsights,
  getPenguinMood,
} from './utils/calculations'
import {
  buildInitialBudgetState,
  loadBudgetState,
  saveBudgetState,
} from './utils/storage'
import './App.css'

const playMoodSound = (type) => {
  if (typeof window === 'undefined') {
    return
  }

  const AudioContextClass = window.AudioContext || window.webkitAudioContext
  if (!AudioContextClass) {
    return
  }

  const context = new AudioContextClass()
  const oscillator = context.createOscillator()
  const gain = context.createGain()

  oscillator.type = type === 'danger' ? 'sawtooth' : 'triangle'
  oscillator.frequency.value = type === 'danger' ? 220 : 660
  gain.gain.setValueAtTime(0.001, context.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.12, context.currentTime + 0.03)
  gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.4)

  oscillator.connect(gain)
  gain.connect(context.destination)
  oscillator.start()
  oscillator.stop(context.currentTime + 0.42)
}

function MoneyRain() {
  const icons = ['💸', '💵', '🪙', '💰', '💸', '🪙', '💵', '💸']

  return (
    <div className="money-rain" aria-hidden="true">
      {icons.map((icon, index) => (
        <span
          className="money-rain__item"
          key={`${icon}-${index}`}
          style={{
            '--fall-delay': `${index * 0.14}s`,
            '--fall-left': `${8 + index * 11}%`,
          }}
        >
          {icon}
        </span>
      ))}
    </div>
  )
}

function PenguinAssistant({ insights }) {
  const mood = getPenguinMood(insights)

  return (
    <aside className={`penguin-stage penguin-stage--${mood.tone}`}>
      <div className="penguin-stage__speech">
        <p className="penguin-stage__headline">{mood.headline}</p>
        <p className="penguin-stage__message">{mood.message}</p>
      </div>

      <div className={`penguin penguin--${mood.emotion}`}>
        <span className="penguin__heart penguin__heart--one">❤</span>
        <span className="penguin__heart penguin__heart--two">❤</span>
        <div className="penguin__shadow" />
        <img 
              
              alt="Penguin mascot"
               className="penguin__image"
               src="/penguin-reference.png"
/>
        <span className="penguin__tear penguin__tear--left" />
        <span className="penguin__tear penguin__tear--right" />
      </div>
    </aside>
  )
}

function App() {
  const [activePage, setActivePage] = useState('home')
  const [budgetData, setBudgetData] = useState(() => loadBudgetState())
  const previousTone = useRef('')
  const previousOverLimitCount = useRef(0)

  useEffect(() => {
    saveBudgetState(budgetData)
  }, [budgetData])

  const insights = useMemo(
    () => calculateBudgetInsights(budgetData, CATEGORY_CONFIG),
    [budgetData],
  )

  const mood = getPenguinMood(insights)

  useEffect(() => {
    const overLimitCount = insights.overLimitCategories.length
    const crossedNewLimit = overLimitCount > previousOverLimitCount.current
    const changedToDanger =
      mood.tone === 'danger' && previousTone.current !== 'danger'

    if (crossedNewLimit || changedToDanger) {
      playMoodSound('danger')
    } else if (
      mood.tone === 'calm' &&
      previousTone.current &&
      previousTone.current !== 'calm'
    ) {
      playMoodSound('calm')
    }

    previousTone.current = mood.tone
    previousOverLimitCount.current = overLimitCount
  }, [insights.overLimitCategories.length, mood.tone])

  const updateBudget = (value) => {
    setBudgetData((current) => ({
      ...current,
      budget: value,
      updatedAt: new Date().toISOString(),
    }))
  }

  const updateSavingsGoal = (value) => {
    setBudgetData((current) => ({
      ...current,
      savingsGoal: value,
      updatedAt: new Date().toISOString(),
    }))
  }

  const updateCategoryLimit = (key, value) => {
    setBudgetData((current) => ({
      ...current,
      categories: current.categories.map((category) =>
        category.key === key ? { ...category, limit: value } : category,
      ),
      updatedAt: new Date().toISOString(),
    }))
  }

  const addExpenseEntry = ({ amount, categoryKey, date }) => {
    setBudgetData((current) => ({
      ...current,
      entries: [
        {
          id: `${categoryKey}-${Date.now()}`,
          amount,
          categoryKey,
          date,
          note: '',
        },
        ...current.entries,
      ],
      updatedAt: new Date().toISOString(),
    }))
  }

  const resetAll = () => {
    setBudgetData(buildInitialBudgetState())
  }

  return (
    <div className="app-shell">
      <div className="app-shell__glow app-shell__glow--one" />
      <div className="app-shell__glow app-shell__glow--two" />
      <MoneyRain />

      <header className="topbar">
        <div className="topbar__main">
          <p className="eyebrow">Cute Budget Tracker ✨</p>
          <h1>Money Talks</h1>
          <p className="topbar__subtitle">
            Build your budget, track real spending patterns, and keep the month
            from turning chaotic.
          </p>

          <div className="topbar__actions topbar__actions--left">
            <nav className="nav-pill" aria-label="Primary">
              <button
                className={activePage === 'home' ? 'is-active' : ''}
                onClick={() => setActivePage('home')}
                type="button"
              >
                Home
              </button>
              <button
                className={activePage === 'statistics' ? 'is-active' : ''}
                onClick={() => setActivePage('statistics')}
                type="button"
              >
                Statistics
              </button>
            </nav>

            <button
              className="ghost-button ghost-button--nav"
              onClick={resetAll}
              type="button"
            >
              Reset data
            </button>
          </div>
        </div>

        <PenguinAssistant insights={insights} />
      </header>

      <main className="page-shell">
        {activePage === 'home' ? (
          <Home
            budgetData={budgetData}
            insights={insights}
            onAddExpenseEntry={addExpenseEntry}
            onBudgetChange={updateBudget}
            onCategoryLimitChange={updateCategoryLimit}
            onSavingsGoalChange={updateSavingsGoal}
          />
        ) : (
          <Statistics insights={insights} />
        )}
      </main>
    </div>
  )
}

export default App
