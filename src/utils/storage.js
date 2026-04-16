import { CATEGORY_CONFIG, getTodayDateValue, toAmount } from './calculations'

const STORAGE_KEY = 'money-talks-budget'

export const buildInitialBudgetState = () => ({
  budget: 0,
  savingsGoal: 0,
  categories: CATEGORY_CONFIG.map((category) => ({
    key: category.key,
    limit: 0,
  })),
  entries: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
})

const PROFILE_STORAGE_KEY = 'money-talks-profiles'

export const buildProfile = (name) => ({
  id: `profile-${Date.now()}`,
  name: String(name || '').trim(),
  createdAt: new Date().toISOString(),
  budgetData: buildInitialBudgetState(),
})

export const loadProfiles = () => {
  try {
    const rawValue = localStorage.getItem(PROFILE_STORAGE_KEY)
    if (rawValue) {
      const parsed = JSON.parse(rawValue)
      if (Array.isArray(parsed)) {
        return parsed
          .filter((profile) => profile && typeof profile === 'object')
          .map((profile) => ({
            id: String(profile.id || '').trim(),
            name: String(profile.name || '').trim(),
            createdAt: profile.createdAt || new Date().toISOString(),
            budgetData: normaliseState(profile.budgetData || profile),
          }))
          .filter((profile) => profile.id && profile.name)
      }
    }

    const legacyValue = localStorage.getItem(STORAGE_KEY)
    if (legacyValue) {
      return [
        {
          id: 'profile-default',
          name: 'Default',
          createdAt: new Date().toISOString(),
          budgetData: normaliseState(JSON.parse(legacyValue)),
        },
      ]
    }

    return []
  } catch {
    return []
  }
}

export const saveProfiles = (profiles) => {
  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profiles))
}

const normaliseState = (input) => {
  const fallback = buildInitialBudgetState()

  if (!input || typeof input !== 'object') {
    return fallback
  }

  const migratedEntries = Array.isArray(input.entries)
    ? input.entries
    : Array.isArray(input.categories)
      ? input.categories
          .filter((category) => toAmount(category?.spent) > 0)
          .map((category, index) => ({
            id: `${category.key}-legacy-${index}`,
            categoryKey: category.key,
            amount: toAmount(category.spent),
            date: getTodayDateValue(),
            note: 'Imported from previous total',
          }))
      : []

  return {
    budget: toAmount(input.budget),
    savingsGoal: toAmount(input.savingsGoal),
    categories: CATEGORY_CONFIG.map((category) => {
      const matchingCategory = Array.isArray(input.categories)
        ? input.categories.find((item) => item?.key === category.key)
        : null

      return {
        key: category.key,
        limit: toAmount(matchingCategory?.limit),
      }
    }),
    entries: migratedEntries.map((entry, index) => ({
      id: entry.id ?? `${entry.categoryKey}-${entry.date}-${index}`,
      categoryKey: entry.categoryKey,
      amount: toAmount(entry.amount),
      date: entry.date || getTodayDateValue(),
      note: entry.note || '',
    })),
    createdAt: input.createdAt || fallback.createdAt,
    updatedAt: input.updatedAt || fallback.updatedAt,
  }
}

export const loadBudgetState = () => {
  try {
    const rawValue = localStorage.getItem(STORAGE_KEY)
    return rawValue ? normaliseState(JSON.parse(rawValue)) : buildInitialBudgetState()
  } catch {
    return buildInitialBudgetState()
  }
}

export const saveBudgetState = (state) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normaliseState(state)))
}
