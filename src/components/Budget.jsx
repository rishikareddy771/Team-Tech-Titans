import { formatCurrency } from '../utils/calculations'

function Budget({
  budget,
  remainingBudget,
  totalSpent,
  spentPercentage,
  weeklyTotal,
  monthlyTotal,
  onBudgetChange,
}) {
  return (
    <section className="hero-budget">
      <div className="hero-budget__intro">
        <p className="section-kicker">Create Budget 💰</p>
        <h2>Make your money behave</h2>
        <p className="hero-budget__text">
          Save the budget once, then let the big numbers show what is left and what is already gone.
        </p>
      </div>

      <label className="budget-input">
        <span>Total budget</span>
        <div className="budget-input__field">
          <span>INR</span>
          <input
            min="0"
            onChange={(event) => onBudgetChange(event.target.value)}
            placeholder="Enter your budget"
            type="number"
            value={budget}
          />
        </div>
      </label>

      <div className="budget-metrics budget-metrics--main">
        <article className="metric-card metric-card--primary">
          <span>💸 Money Left</span>
          <strong>{formatCurrency(remainingBudget)}</strong>
          <small>{Math.max(100 - spentPercentage, 0).toFixed(1)}% of your budget is still safe</small>
        </article>

        <article className="metric-card">
          <span>🧾 Amount Spent</span>
          <strong>{formatCurrency(totalSpent)}</strong>
          <small>{spentPercentage.toFixed(1)}% of the total budget is used</small>
        </article>
      </div>

      <div className="budget-metrics budget-metrics--mini">
        <article className="metric-card metric-card--mini">
          <span>📅 This Week</span>
          <strong>{formatCurrency(weeklyTotal)}</strong>
        </article>

        <article className="metric-card metric-card--mini">
          <span>🗓️ This Month</span>
          <strong>{formatCurrency(monthlyTotal)}</strong>
        </article>
      </div>
    </section>
  )
}

export default Budget
