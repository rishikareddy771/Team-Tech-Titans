import { useState } from 'react'
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import {
  PERIOD_OPTIONS,
  CATEGORY_CONFIG,
  formatCurrency,
  formatDateLabel,
  getPeriodBreakdown,
} from '../utils/calculations'

function Statistics({ insights }) {
  const [period, setPeriod] = useState('month')
  const breakdown = getPeriodBreakdown(insights, period)

  return (
    <div className="stats-layout">
      <section className="panel panel--chart">
        <div className="panel__header">
          <div>
            <p className="section-kicker">Budget Breakdown 📊</p>
            <h2>Where the money is going</h2>
          </div>

          <div className="period-toggle" role="tablist" aria-label="Statistics period">
            {PERIOD_OPTIONS.map((option) => (
              <button
                className={period === option.key ? 'is-active' : ''}
                key={option.key}
                onClick={() => setPeriod(option.key)}
                type="button"
              >
                {option.emoji} {option.label}
              </button>
            ))}
          </div>
        </div>

        <p className="panel__meta">
          {formatCurrency(breakdown.total)} tracked in{' '}
          {PERIOD_OPTIONS.find((option) => option.key === period)?.label.toLowerCase()}.
        </p>

        <div className="chart-area">
          {breakdown.chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={360}>
              <PieChart>
                <Pie
                  data={breakdown.chartData}
                  dataKey="value"
                  innerRadius={86}
                  outerRadius={128}
                  paddingAngle={4}
                >
                  {breakdown.chartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name, item) => [
                    `${formatCurrency(value)} (${item.payload.percentage.toFixed(1)}%)`,
                    name,
                  ]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state">
              <p>No chart yet.</p>
              <span>Log dated expenses to unlock the weekly and monthly story.</span>
            </div>
          )}
        </div>
      </section>

      <section className="panel panel--stats">
        <div className="panel__header">
          <div>
            <p className="section-kicker">Date Features 🧾</p>
            <h2>Weekly and monthly tracking</h2>
          </div>
        </div>

        <div className="stats-summary">
          <article className="stats-summary__card">
            <span>📅 This Week</span>
            <strong>{formatCurrency(insights.weeklyTotal)}</strong>
          </article>
          <article className="stats-summary__card">
            <span>🗓️ This Month</span>
            <strong>{formatCurrency(insights.monthlyTotal)}</strong>
          </article>
        </div>

        <div className="stats-list">
          {breakdown.categories.map((category) => (
            <article className="stats-row" key={category.key}>
              <div className="stats-row__label">
                <span
                  className="stats-row__dot"
                  style={{ backgroundColor: category.accent }}
                />
                <strong>
                  {category.icon} {category.label}
                </strong>
              </div>

              <div className="stats-row__value">
                <span>{formatCurrency(category.value)}</span>
                <small>{category.percentage.toFixed(1)}% of selected period</small>
              </div>
            </article>
          ))}
        </div>

        <div className="stats-entries">
          <p className="section-kicker" style={{ marginTop: '20px' }}>Recent Expenses 💳</p>
          {breakdown.entries && breakdown.entries.length > 0 ? (
            <div className="stats-entries__list">
              {breakdown.entries.slice(0, 5).map((entry) => {
                const category = CATEGORY_CONFIG.find(c => c.key === entry.categoryKey)
                const displayName = entry.customCategoryName || category?.label || 'Unknown'
                return (
                  <div key={entry.id} className="stats-entry__item">
                    <div className="stats-entry__info">
                      <span className="stats-entry__category">
                        {category?.icon} {displayName}
                      </span>
                      <small className="stats-entry__date">{formatDateLabel(entry.date)}</small>
                    </div>
                    <span className="stats-entry__amount">
                      {formatCurrency(entry.amount)}
                    </span>
                  </div>
                )
              })}
            </div>
          ) : (
            <p style={{ color: '#a0a8c0', fontSize: '0.9rem' }}>No expenses yet</p>
          )}
        </div>
      </section>
    </div>
  )
}

export default Statistics
