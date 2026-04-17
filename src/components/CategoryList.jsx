import { formatCurrency, formatDateLabel } from '../utils/calculations'
import ExpenseInput from './ExpenseInput'

function CategoryList({
  categories,
  recentEntries,
  onCategoryLimitChange,
  onAddExpenseEntry,
}) {
  return (
    <section className="panel">
      <div className="panel__header">
        <div>
          <p className="section-kicker">Spending Sections 🐾</p>
          <h2>Track every category with dates</h2>
        </div>
        <p className="panel__meta">
          Set each limit, log dated expenses, and let the owl judge softly.
        </p>
      </div>

      <div className="category-grid">
        {categories.map((category) => (
          <ExpenseInput
            category={category}
            key={category.key}
            onAddExpenseEntry={onAddExpenseEntry}
            onCategoryLimitChange={onCategoryLimitChange}
          />
        ))}
      </div>

      <div className="entry-feed">
        <div className="entry-feed__header">
          <h3>Recent money moves</h3>
          <span>Logged expenses with dates</span>
        </div>

        <div className="entry-feed__list">
          {recentEntries.length > 0 ? (
            recentEntries.map((entry) => (
              <article className="entry-pill" key={entry.id}>
                <strong>{formatCurrency(entry.amount)}</strong>
                <span>{formatDateLabel(entry.date)}</span>
                <small>{entry.note || 'No note, just vibes.'}</small>
              </article>
            ))
          ) : (
            <div className="entry-feed__empty">
              <p>No expenses logged yet.</p>
              <span>Start with any category card and pick a date to build weekly/monthly stats.</span>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default CategoryList
