import Budget from '../components/Budget'
import DaysUntilBroke from '../components/DaysUntilBroke'
import CategoryList from '../components/CategoryList'

function Home({
  budgetData,
  insights,
  onBudgetChange,
  onSavingsGoalChange,
  onCategoryLimitChange,
  onAddExpenseEntry,
}) {
  return (
    <div className="page-grid">
      <Budget
        budget={budgetData.budget}
        monthlyTotal={insights.monthlyTotal}
        remainingBudget={insights.remainingBudget}
        totalSpent={insights.totalSpent}
        spentPercentage={insights.spentPercentage}
        weeklyTotal={insights.weeklyTotal}
        onBudgetChange={onBudgetChange}
      />

      <DaysUntilBroke
        insights={insights}
        savingsGoal={budgetData.savingsGoal}
        onSavingsGoalChange={onSavingsGoalChange}
      />

      <div className="page-grid__full">
        <CategoryList
          categories={insights.categories}
          recentEntries={insights.recentEntries}
          onAddExpenseEntry={onAddExpenseEntry}
          onCategoryLimitChange={onCategoryLimitChange}
        />
      </div>
    </div>
  )
}

export default Home
