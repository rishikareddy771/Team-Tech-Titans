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
