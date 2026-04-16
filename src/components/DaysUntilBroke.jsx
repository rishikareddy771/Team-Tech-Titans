import { formatCurrency, getDaysUntilBrokeLabel } from '../utils/calculations'

function DaysUntilBroke({ insights, savingsGoal, onSavingsGoalChange }) {
  const daysLabel =
    insights.daysUntilBroke === null
      ? 0
      : Math.max(Math.ceil(insights.daysUntilBroke), 0)

  return (
    <div className="days-column">
      <section className="days-card">
        <div>
          <p className="section-kicker">Days Until Broke</p>
          <h2>{daysLabel}</h2>
        </div>

        <div className="days-card__content">
          <p>{getDaysUntilBrokeLabel(insights)}</p>
          <div className="days-card__stats">
            <span>Daily burn: {formatCurrency(insights.dailyBurn)}</span>
            <span>Tracked spending days: {insights.daysActive}</span>
          </div>
        </div>
      </section>

      <section className="savings-card">
        <div className="savings-card__header">
          <div>
            <p className="section-kicker">Savings Goal</p>
            <h3>Keep some money safe</h3>
          </div>
          <strong>{formatCurrency(insights.remainingBudget)}</strong>
        </div>

        <label className="savings-card__input">
          <span>Goal amount</span>
          <input
            min="0"
            onChange={(event) => onSavingsGoalChange(event.target.value)}
            placeholder="Set savings goal"
            type="number"
            value={savingsGoal}
          />
        </label>

        <div className="savings-card__bar">
          <span
            className="savings-card__fill"
            style={{ width: `${insights.savingsProgress}%` }}
          />
        </div>

        <p className="savings-card__note">
          {savingsGoal > 0
            ? `${insights.savingsProgress.toFixed(0)}% of your savings goal is covered by the money left.`
            : 'Set a goal and this card will show how close you are.'}
        </p>
      </section>
    </div>
  )
}

export default DaysUntilBroke
