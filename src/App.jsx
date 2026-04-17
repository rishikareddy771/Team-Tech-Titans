import { useEffect, useMemo, useRef, useState } from 'react'
import Home from './pages/Home'
import Statistics from './pages/Statistics'
import Calendar from './pages/Calendar'
import ProfileSelection from './pages/ProfileSelection'
import {
  CATEGORY_CONFIG,
  calculateBudgetInsights,
  getPenguinMood,
  toAmount,
} from './utils/calculations'
import {
  buildInitialBudgetState,
  buildProfile,
  loadProfiles,
  saveProfiles,
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

        <div className="penguin__body">
          <div className="penguin__head">
            <div className="penguin__eye penguin__eye--left" />
            <div className="penguin__eye penguin__eye--right" />
            <div className="penguin__beak" />
          </div>
          <div className="penguin__belly" />
          <div className="penguin__wing penguin__wing--left" />
          <div className="penguin__wing penguin__wing--right" />
          <div className="penguin__foot penguin__foot--left" />
          <div className="penguin__foot penguin__foot--right" />
        </div>

        <div className="penguin__shadow" />
        <span className="penguin__tear penguin__tear--left" />
        <span className="penguin__tear penguin__tear--right" />
      </div>
    </aside>
  )
}

function App() {
  const [activePage, setActivePage] = useState('home')
  const [profiles, setProfiles] = useState(() => loadProfiles())
  const [activeProfileId, setActiveProfileId] = useState(null)
  const [budgetData, setBudgetData] = useState(buildInitialBudgetState())
  const previousTone = useRef('')
  const previousOverLimitCount = useRef(0)

  const activeProfile = useMemo(
    () => profiles.find((profile) => profile.id === activeProfileId) ?? null,
    [profiles, activeProfileId],
  )

  useEffect(() => {
    saveProfiles(profiles)
  }, [profiles])

  useEffect(() => {
    if (!activeProfileId) {
      return
    }

    setProfiles((current) =>
      current.map((profile) =>
        profile.id === activeProfileId ? { ...profile, budgetData } : profile,
      ),
    )
  }, [budgetData, activeProfileId])

  const insights = useMemo(() => {
    if (!activeProfile) {
      return {
        budget: 0,
        savingsGoal: 0,
        entries: [],
        categories: CATEGORY_CONFIG.map((category) => ({
          ...category,
          spent: 0,
          weekSpent: 0,
          monthSpent: 0,
          limit: 0,
          remaining: 0,
          percentOfBudget: 0,
          percentOfLimit: 0,
          isOverLimit: false,
          recentEntries: [],
        })),
        totalSpent: 0,
        weeklyTotal: 0,
        monthlyTotal: 0,
        remainingBudget: 0,
        spentPercentage: 0,
        daysActive: 0,
        dailyBurn: 0,
        daysUntilBroke: null,
        savingsProgress: 0,
        overLimitCategories: [],
        highestSpentCategory: {},
        focusCategory: {},
        chartData: [],
        recentEntries: [],
      }
    }

    return calculateBudgetInsights(budgetData, CATEGORY_CONFIG)
  }, [activeProfile, budgetData])

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

  const addExpenseEntry = ({ amount, categoryKey, date, customCategoryName }) => {
    setBudgetData((current) => ({
      ...current,
      entries: [
        {
          id: `${categoryKey}-${Date.now()}`,
          amount: toAmount(amount),
          categoryKey,
          date,
          note: '',
          customCategoryName,
        },
        ...current.entries,
      ],
      updatedAt: new Date().toISOString(),
    }))
  }

  const resetAll = () => {
    setBudgetData(buildInitialBudgetState())
  }

  const handleCreateProfile = (profileName) => {
    const newProfile = buildProfile(profileName)
    setProfiles((current) => [...current, newProfile])
    setActiveProfileId(newProfile.id)
    setBudgetData(newProfile.budgetData)
  }

  const handleSelectProfile = (profileId) => {
    const selectedProfile = profiles.find((profile) => profile.id === profileId)
    if (!selectedProfile) {
      return
    }

    setActiveProfileId(profileId)
    setBudgetData(selectedProfile.budgetData)
  }

  const handleDeleteProfile = (profileId) => {
    setProfiles((current) => current.filter((profile) => profile.id !== profileId))

    if (activeProfileId === profileId) {
      setActiveProfileId(null)
      setBudgetData(buildInitialBudgetState())
    }
  }

  const handleSwitchProfile = () => {
    setActiveProfileId(null)
    setBudgetData(buildInitialBudgetState())
  }

  if (!activeProfile) {
    return (
      <div className="app-shell">
        <div className="app-shell__glow app-shell__glow--one" />
        <div className="app-shell__glow app-shell__glow--two" />
        <MoneyRain />
        <main className="page-shell">
          <ProfileSelection
            profiles={profiles}
            onCreateProfile={handleCreateProfile}
            onSelectProfile={handleSelectProfile}
            onDeleteProfile={handleDeleteProfile}
          />
        </main>
      </div>
    )
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
            Profile: {activeProfile.name} — build your budget, track real spending
            patterns, and keep the month from turning chaotic.
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
              <button
                className={activePage === 'calendar' ? 'is-active' : ''}
                onClick={() => setActivePage('calendar')}
                type="button"
              >
                Calendar
              </button>
            </nav>

            <button
              className="ghost-button ghost-button--nav"
              onClick={handleSwitchProfile}
              type="button"
            >
              Switch profile
            </button>
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
        ) : activePage === 'statistics' ? (
          <Statistics insights={insights} />
        ) : (
          <Calendar budgetData={budgetData} />
        )}
      </main>
    </div>
  )
}

export default App
