import { useState } from 'react'
import {
  formatCurrency,
  formatDateLabel,
  getTodayDateValue,
} from '../utils/calculations'

function ExpenseInput({ category, onCategoryLimitChange, onAddExpenseEntry }) {
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(getTodayDateValue())
  const [customCategoryName, setCustomCategoryName] = useState('')

  const handleAddExpense = () => {
    if (!amount || Number(amount) <= 0) {
      return
    }

    onAddExpenseEntry({
      amount,
      categoryKey: category.key,
      date,
      customCategoryName: category.key === 'others' ? customCategoryName : undefined,
    })

    setAmount('')
    setCustomCategoryName('')
  }

  return (
    <article
      className={`category-card ${category.isOverLimit ? 'category-card--alert' : ''}`}
      style={{ '--category-accent': category.accent }}
    >
      <div className="category-card__top">
        <div>
          <p className="category-card__label">
            {category.icon} {category.label}
          </p>
          <h3>{formatCurrency(category.spent)}</h3>
          <small className="category-card__subtext">
            Week {formatCurrency(category.weekSpent)} • Month {formatCurrency(category.monthSpent)}
          </small>
        </div>
        <span className="category-card__chip">
          {category.limit > 0
            ? `${category.percentOfLimit.toFixed(0)}% of limit`
            : 'No limit yet'}
        </span>
      </div>

      <div className={`category-card__inputs ${category.key === 'others' ? 'category-card__inputs--quad' : 'category-card__inputs--triple'}`}>
        <label>
          <span>Log amount</span>
          <input
            min="0"
            onChange={(event) => setAmount(event.target.value)}
            placeholder="250"
            type="number"
            value={amount}
          />
        </label>

        <label>
          <span>Expense date</span>
          <input
            onChange={(event) => setDate(event.target.value)}
            type="date"
            value={date}
          />
        </label>

        {category.key === 'others' ? (
          <label>
            <span>Category name</span>
            <input
              onChange={(event) => setCustomCategoryName(event.target.value)}
              placeholder="e.g., Entertainment"
              type="text"
              value={customCategoryName}
            />
          </label>
        ) : (
          <label>
            <span>Set limit</span>
            <input
              min="0"
              onChange={(event) =>
                onCategoryLimitChange(category.key, event.target.value)
              }
              type="number"
              value={category.limit}
            />
          </label>
        )}
      </div>

      <div className="category-card__footer">
        <small>
          {category.limit > 0
            ? `${formatCurrency(category.remaining)} left in this category`
            : 'Add a limit to unlock angry owl alerts'}
        </small>
        <button className="category-card__button" onClick={handleAddExpense} type="button">
          Add expense
        </button>
      </div>

      {category.recentEntries.length > 0 ? (
        <div className="category-card__history">
          {category.recentEntries.map((entry) => (
            <span className="category-history__pill" key={entry.id}>
              {formatCurrency(entry.amount)} • {formatDateLabel(entry.date)}
              {entry.customCategoryName && (
                <span className="category-history__custom-name">
                  ({entry.customCategoryName})
                </span>
              )}
            </span>
          ))}
        </div>
      ) : null}
    </article>
  )
}

export default ExpenseInput
