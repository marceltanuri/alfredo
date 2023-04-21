import datetime
from configUtil import getValue

budget_start_day = int(getValue("budget_start_day"))

def getBudgetPeriod(dtFormat, _args):

    today = datetime.datetime.today()
    date_end = today + datetime.timedelta(days=int(1))
    date_start = datetime.datetime(today.year, today.month, budget_start_day, 0)

    if today.day < budget_start_day:
        lastMonth = date_end.month - 1
        _year = date_end.year
        if date_end.month == 1:
                lastMonth = 12
                _year = _year - 1
        date_start = datetime.datetime(_year, lastMonth, budget_start_day, 0)

    if len(_args)>=3:
        date_start = datetime.datetime.strptime(_args[1], dtFormat)
        date_end = datetime.datetime.strptime(_args[2], dtFormat)

    _response = dict()
    _response['start'] = date_start
    _response['end'] = date_end

    return _response