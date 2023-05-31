const getReportStartDateInMillis = () => {

    const dayOfMonthBudgetStarts = process.env.alfredo_budget_start_day

    const today = new Date();

    if (today.getDate() < dayOfMonthBudgetStarts) {
        if (today.getMonth() == 0) {
            const budgetStartingPreviousYear = new Date(today.getFullYear() - 1, 11, dayOfMonthBudgetStarts)
            return budgetStartingPreviousYear.getTime()
        }

        const budgetStartingPreviousMonth = new Date(today.getFullYear(), today.getMonth() - 1, dayOfMonthBudgetStarts)
        return budgetStartingPreviousMonth.getTime()
    }
    else {
        const budgetStartingCurrentMonth = new Date(today.getFullYear(), today.getMonth(), dayOfMonthBudgetStarts)
        return budgetStartingCurrentMonth.getTime()
    }



}


module.exports.getReportStartDateInMillis = getReportStartDateInMillis;