import { useMemo, useState } from 'react'
import { formatCurrency, formatDateLabel, CATEGORY_CONFIG, toAmount, toLocalDateValue } from '../utils/calculations'

function Calendar({ budgetData }) {
  const currentDate = new Date()
  const [displayYear, setDisplayYear] = useState(currentDate.getFullYear())
  const [displayMonth, setDisplayMonth] = useState(currentDate.getMonth())
  const [selectedDate, setSelectedDate] = useState(null)

  // Aggregate expenses by date and category
  const expensesByDate = useMemo(() => {
    const aggregated = {}
    const entriesByDate = {}

    if (budgetData.entries) {
      budgetData.entries.forEach(entry => {
        const date = entry.date
        if (!aggregated[date]) {
          aggregated[date] = 0
          entriesByDate[date] = []
        }
        aggregated[date] += toAmount(entry.amount)
        entriesByDate[date].push(entry)
      })
    }

    return { total: aggregated, entries: entriesByDate }
  }, [budgetData.entries])

  // Group expenses by category for each date
  const getExpensesByCategory = (entries) => {
    const grouped = {}
    entries.forEach(entry => {
      const key = entry.categoryKey
      if (!grouped[key]) {
        grouped[key] = { amount: 0, entries: [] }
      }
      grouped[key].amount += toAmount(entry.amount)
      grouped[key].entries.push(entry)
    })
    return grouped
  }

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const firstDay = new Date(displayYear, displayMonth, 1)
    const lastDay = new Date(displayYear, displayMonth + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay()) // Start from Sunday

    const days = []

    for (let i = 0; i < 42; i++) { // 6 weeks * 7 days
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)

      const dateString = toLocalDateValue(date)
      const isCurrentMonth = date.getMonth() === displayMonth && date.getFullYear() === displayYear
      const isToday = date.toDateString() === currentDate.toDateString()
      const spent = expensesByDate.total[dateString] || 0
      const dayEntries = expensesByDate.entries[dateString] || []
      const byCategory = getExpensesByCategory(dayEntries)

      days.push({
        date,
        dateString,
        day: date.getDate(),
        isCurrentMonth,
        isToday,
        spent,
        entries: dayEntries,
        byCategory
      })
    }

    return days
  }, [displayYear, displayMonth, expensesByDate, currentDate])

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const goToPreviousMonth = () => {
    if (displayMonth === 0) {
      setDisplayMonth(11)
      setDisplayYear(displayYear - 1)
    } else {
      setDisplayMonth(displayMonth - 1)
    }
  }

  const goToNextMonth = () => {
    if (displayMonth === 11) {
      setDisplayMonth(0)
      setDisplayYear(displayYear + 1)
    } else {
      setDisplayMonth(displayMonth + 1)
    }
  }

  const goToCurrentMonth = () => {
    setDisplayYear(currentDate.getFullYear())
    setDisplayMonth(currentDate.getMonth())
  }

  return (
    <div className="calendar">
      <div className="calendar__header">
        <div className="calendar__nav">
          <button
            className="calendar__nav-button"
            onClick={goToPreviousMonth}
            type="button"
            aria-label="Previous month"
          >
            ‹
          </button>
          <h2 className="calendar__title">
            {monthNames[displayMonth]} {displayYear}
          </h2>
          <button
            className="calendar__nav-button"
            onClick={goToNextMonth}
            type="button"
            aria-label="Next month"
          >
            ›
          </button>
        </div>
        <button
          className="calendar__today-button"
          onClick={goToCurrentMonth}
          type="button"
        >
          Today
        </button>
      </div>

      <div className="calendar__grid">
        {/* Day headers */}
        {dayNames.map(day => (
          <div key={day} className="calendar__day-header">
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {calendarDays.map((day, index) => {
          const categoryEntries = Object.entries(day.byCategory).map(([categoryKey, data]) => {
            const category = CATEGORY_CONFIG.find(c => c.key === categoryKey)
            const categoryName = data.entries[0]?.customCategoryName || category?.label || 'Unknown'
            return { categoryKey, categoryName, ...data, icon: category?.icon }
          })
          
          return (
            <div
              key={index}
              className={`calendar__day ${
                day.isCurrentMonth ? 'calendar__day--current-month' : 'calendar__day--other-month'
              } ${
                day.isToday ? 'calendar__day--today' : ''
              } ${day.spent > 0 ? 'calendar__day--clickable' : ''}`}
              onClick={() => day.spent > 0 && setSelectedDate(day)}
            >
              <span className="calendar__day-number">{day.day}</span>
              {day.spent > 0 && (
                <div className="calendar__day-categories">
                  {categoryEntries.map((catData, idx) => (
                    <div key={idx} className="calendar__category-item">
                      <span className="calendar__category-name">
                        {catData.icon} {catData.categoryName}
                      </span>
                      <span className="calendar__category-amount">
                        {formatCurrency(catData.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Date Details Modal */}
      {selectedDate && (
        <div className="calendar__modal-overlay" onClick={() => setSelectedDate(null)}>
          <div className="calendar__modal" onClick={(e) => e.stopPropagation()}>
            <div className="calendar__modal-header">
              <h3>Expenses for {formatDateLabel(selectedDate.dateString)}</h3>
              <button
                className="calendar__modal-close"
                onClick={() => setSelectedDate(null)}
                type="button"
              >
                ✕
              </button>
            </div>

            <div className="calendar__modal-content">
              {selectedDate.entries.map((entry, idx) => {
                const category = CATEGORY_CONFIG.find(c => c.key === entry.categoryKey)
                const categoryName = entry.customCategoryName || category?.label || 'Unknown'
                return (
                  <div key={idx} className="calendar__expense-row">
                    <div className="calendar__expense-info">
                      <span className="calendar__expense-category">
                        {category?.icon} {categoryName}
                      </span>
                      <small className="calendar__expense-note">
                        {entry.note || 'No note'}
                      </small>
                    </div>
                    <span className="calendar__expense-amount">
                      {formatCurrency(entry.amount)}
                    </span>
                  </div>
                )
              })}
              
              <div className="calendar__modal-total">
                <strong>Total:</strong>
                <strong>{formatCurrency(selectedDate.spent)}</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Calendar