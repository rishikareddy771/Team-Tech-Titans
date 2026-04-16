export const CATEGORY_CONFIG = [
  { key: 'food', label: 'Food', accent: '#ff8f6b', icon: '🍜' },
  { key: 'hostel', label: 'Hostel', accent: '#ffcf5a', icon: '🛏️' },
  { key: 'transport', label: 'Transport', accent: '#67c7ff', icon: '🛺' },
  { key: 'fashion', label: 'Fashion', accent: '#ff78b9', icon: '🧥' },
  { key: 'academics', label: 'Academics', accent: '#8f7cff', icon: '📚' },
  { key: 'others', label: 'Others', accent: '#69d2a1', icon: '✨' },
]

const CATEGORY_DIALOGUES = {
  food: {
    safe: 'Food is behaving. Snack wisely and keep the ramen era classy.',
    over: 'Food crossed the line. Gourmet drama on a student budget is wild work.',
  },
  hostel: {
    safe: 'Hostel spending is calm. Your room budget is not throwing tantrums today.',
    over: 'Hostel went over limit. Rent is acting like it owns the whole plot.',
  },
  transport: {
    safe: 'Transport is cruising. Cute commute energy, no wallet crash yet.',
    over: 'Transport crossed the limit. Those rides are moving like celebrity convoys.',
  },
  fashion: {
    safe: 'Fashion is under control. Slay, but financially responsible slay.',
    over: 'Fashion went over limit. The fit may be fire, but the budget is crying glitter.',
  },
  academics: {
    safe: 'Academics is steady. Knowledge is expensive, but at least it has purpose.',
    over: 'Academics crossed the limit. These books really said pay tuition twice.',
  },
  others: {
    safe: 'Others is tame. Mystery spending is not being shady for once.',
    over: 'Others crossed the limit. Undefined chaos is now financially loud.',
  },
}

export const PERIOD_OPTIONS = [
  { key: 'all', label: 'All Time', emoji: '💸' },
  { key: 'week', label: 'This Week', emoji: '📅' },
  { key: 'month', label: 'This Month', emoji: '🗓️' },
]

export const toAmount = (value) => {
  const numericValue = Number(value)
  return Number.isFinite(numericValue) && numericValue >= 0 ? numericValue : 0
}

export const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(toAmount(value))

export const getTodayDateValue = () => new Date().toISOString().slice(0, 10)

export const formatDateLabel = (value) => {
  if (!value) {
    return 'No date'
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

const getDaysActive = (createdAt) => {
  if (!createdAt) {
    return 1
  }

  const createdDate = new Date(createdAt)
  const now = new Date()
  const difference = now.getTime() - createdDate.getTime()
  const days = Math.floor(difference / (1000 * 60 * 60 * 24)) + 1

  return Math.max(days, 1)
}

const getSpendingDaysActive = (entries, createdAt) => {
  if (!entries.length) {
    return getDaysActive(createdAt)
  }

  const sortedEntries = [...entries].sort((a, b) => new Date(a.date) - new Date(b.date))
  const firstExpenseDate = new Date(sortedEntries[0].date)
  const now = new Date()
  const difference = now.getTime() - firstExpenseDate.getTime()
  const days = Math.floor(difference / (1000 * 60 * 60 * 24)) + 1

  return Math.max(days, 1)
}

const getRangeForPeriod = (period) => {
  const now = new Date()
  const start = new Date(now)
  const end = new Date(now)

  if (period === 'week') {
    const day = start.getDay()
    const distance = day === 0 ? 6 : day - 1
    start.setDate(start.getDate() - distance)
    start.setHours(0, 0, 0, 0)
    end.setHours(23, 59, 59, 999)
    return { start, end }
  }

  if (period === 'month') {
    start.setDate(1)
    start.setHours(0, 0, 0, 0)
    end.setHours(23, 59, 59, 999)
    return { start, end }
  }

  return null
}

const isEntryInPeriod = (entry, period) => {
  if (period === 'all') {
    return true
  }

  const range = getRangeForPeriod(period)
  if (!range) {
    return true
  }

  const entryDate = new Date(entry.date)
  return entryDate >= range.start && entryDate <= range.end
}

const getEntryAmountForCategory = (entries, key, period = 'all') =>
  entries
    .filter((entry) => entry.categoryKey === key && isEntryInPeriod(entry, period))
    .reduce((sum, entry) => sum + toAmount(entry.amount), 0)

export const calculateBudgetInsights = (budgetData, categoryConfig = CATEGORY_CONFIG) => {
  const budget = toAmount(budgetData.budget)
  const savingsGoal = toAmount(budgetData.savingsGoal)
  const entries = Array.isArray(budgetData.entries)
    ? budgetData.entries
        .map((entry) => ({
          id: entry.id ?? `${entry.categoryKey}-${entry.date}-${entry.amount}`,
          categoryKey: entry.categoryKey,
          amount: toAmount(entry.amount),
          date: entry.date || getTodayDateValue(),
          note: entry.note || '',
          customCategoryName: entry.customCategoryName,
        }))
        .sort((a, b) => new Date(b.date) - new Date(a.date))
    : []

  const daysActive = getSpendingDaysActive(entries, budgetData.createdAt)

  const categories = categoryConfig.map((item) => {
    const matchingCategory = budgetData.categories.find(
      (category) => category.key === item.key,
    )

    const spent = getEntryAmountForCategory(entries, item.key, 'all')
    const weekSpent = getEntryAmountForCategory(entries, item.key, 'week')
    const monthSpent = getEntryAmountForCategory(entries, item.key, 'month')
    const limit = toAmount(matchingCategory?.limit)
    const percentOfBudget = budget > 0 ? (spent / budget) * 100 : 0
    const percentOfLimit = limit > 0 ? (spent / limit) * 100 : 0
    const recentEntries = entries.filter((entry) => entry.categoryKey === item.key).slice(0, 3)

    return {
      ...item,
      spent,
      weekSpent,
      monthSpent,
      limit,
      remaining: Math.max(limit - spent, 0),
      percentOfBudget,
      percentOfLimit,
      isOverLimit: limit > 0 && spent > limit,
      recentEntries,
    }
  })

  const totalSpent = entries.reduce((sum, entry) => sum + entry.amount, 0)
  const weeklyTotal = entries
    .filter((entry) => isEntryInPeriod(entry, 'week'))
    .reduce((sum, entry) => sum + entry.amount, 0)
  const monthlyTotal = entries
    .filter((entry) => isEntryInPeriod(entry, 'month'))
    .reduce((sum, entry) => sum + entry.amount, 0)
  const remainingBudget = Math.max(budget - totalSpent, 0)
  const spentPercentage = budget > 0 ? (totalSpent / budget) * 100 : 0
  const dailyBurn = totalSpent > 0 ? totalSpent / daysActive : 0
  const daysUntilBroke = dailyBurn > 0 ? remainingBudget / dailyBurn : null
  const savingsProgress = savingsGoal > 0 ? Math.min((remainingBudget / savingsGoal) * 100, 100) : 0
  const overLimitCategories = categories.filter((category) => category.isOverLimit)
  const highestSpentCategory =
    [...categories].sort((a, b) => b.spent - a.spent)[0] ?? categories[0]
  const focusCategory = overLimitCategories[0] ?? highestSpentCategory

  const chartData = categories
    .filter((category) => category.spent > 0)
    .map((category) => ({
      name: category.label,
      value: category.spent,
      fill: category.accent,
      percentage: budget > 0 ? (category.spent / budget) * 100 : 0,
      icon: category.icon,
    }))

  if (remainingBudget > 0) {
    chartData.push({
      name: 'Left to spend',
      value: remainingBudget,
      fill: '#1f2a44',
      percentage: budget > 0 ? (remainingBudget / budget) * 100 : 0,
      icon: '🐧',
    })
  }

  return {
    budget,
    savingsGoal,
    entries,
    categories,
    totalSpent,
    weeklyTotal,
    monthlyTotal,
    remainingBudget,
    spentPercentage,
    daysActive,
    dailyBurn,
    daysUntilBroke,
    savingsProgress,
    overLimitCategories,
    highestSpentCategory,
    focusCategory,
    chartData,
    recentEntries: entries.slice(0, 8),
  }
}

export const getPeriodBreakdown = (insights, period) => {
  const total =
    period === 'week'
      ? insights.weeklyTotal
      : period === 'month'
        ? insights.monthlyTotal
        : insights.totalSpent

  // Get entries for the selected period
  const allEntries = insights.categories.flatMap((cat) => cat.recentEntries)
  const periodEntries = allEntries
    .filter((entry) => {
      if (period === 'all') return true
      const range = getRangeForPeriod(period)
      if (!range) return true
      const entryDate = new Date(entry.date)
      return entryDate >= range.start && entryDate <= range.end
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date))

  const categories = insights.categories.map((category) => {
    const value =
      period === 'week'
        ? category.weekSpent
        : period === 'month'
          ? category.monthSpent
          : category.spent

    return {
      ...category,
      value,
      percentage: total > 0 ? (value / total) * 100 : 0,
    }
  })

  return {
    total,
    categories,
    entries: periodEntries,
    chartData: categories
      .filter((category) => category.value > 0)
      .map((category) => ({
        name: category.label,
        value: category.value,
        fill: category.accent,
        percentage: total > 0 ? (category.value / total) * 100 : 0,
        icon: category.icon,
      })),
  }
}

export const getDaysUntilBrokeLabel = (insights) => {
  if (!insights.budget) {
    return 'Set a budget first so the penguin can stop guessing and start calculating.'
  }

  if (!insights.totalSpent) {
    return 'No expenses logged yet. The wallet is peaceful, moisturized, and thriving.'
  }

  if (insights.remainingBudget <= 0) {
    return 'Budget is gone. This month just turned into a character-building exercise.'
  }

  if (insights.daysUntilBroke === null) {
    return 'Need a little more spending history before this estimate gets juicy.'
  }

  if (insights.daysUntilBroke <= 1) {
    return 'At this pace, the money lasts about a day. The wallet is not amused.'
  }

  if (insights.daysUntilBroke < 7) {
    return 'That budget is running on fumes. We need a soft launch into self-control.'
  }

  if (insights.daysUntilBroke < 21) {
    return 'You can make it, but the spending needs less drama and more boundaries.'
  }

  return 'Healthy runway detected. Financially attractive behavior.'
}

export const getPenguinMood = (insights) => {
  const focusKey = insights.focusCategory?.key
  const focusCopy = CATEGORY_DIALOGUES[focusKey] ?? CATEGORY_DIALOGUES.others

  if (!insights.budget) {
    return {
      tone: 'sleepy',
      emotion: 'waiting',
      headline: 'Penguin is waiting for the budget drop',
      message:
        'Give me a budget number and a few expenses. Right now I am just a cute auditor with no tea.',
    }
  }

  if (insights.overLimitCategories.length > 0) {
    return {
      tone: 'danger',
      emotion: 'cry',
      headline: `${insights.overLimitCategories[0].icon} ${insights.overLimitCategories[0].label} crossed the limit`,
      message: `${focusCopy.over} I am officially angry-crying in penguin.`,
    }
  }

  if (insights.spentPercentage >= 75) {
    return {
      tone: 'warning',
      emotion: 'angry',
      headline: 'Budget pressure is rising',
      message:
        'You are still under the category limits, but the overall spending is moving a little too confidently.',
    }
  }

  return {
    tone: 'calm',
    emotion: 'happy',
    headline: `${insights.focusCategory?.icon ?? '🐧'} Spending is under control`,
    message: focusCopy.safe,
  }
}
