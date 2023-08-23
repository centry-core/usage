
import statistics
from datetime import datetime, timedelta
import calendar
from itertools import groupby

from pylon.core.tools import log

from .utils import get_settings_from_secrets


def get_users(data: list):
    return len(set(i['user'] for i in data))


def get_successful_predicts(data: list):
    return len(list(filter(lambda x: x['status_code'] == 200, data)))


def predicts_by_date(predicts_usage: list):
    if not predicts_usage:
        return []
    first_day = datetime.strptime(predicts_usage[0]['date'].split()[0], "%d.%m.%Y")
    last_day = datetime.strptime(predicts_usage[-1]['date'].split()[0], "%d.%m.%Y")
    usage_by_date = {}
    while first_day <= last_day:
        usage_by_date[first_day.strftime("%d.%m.%Y")] = {'response_time': 0, 'predicts': 0}
        first_day += timedelta(days=1)
    func = lambda x: x['date'].split()[0]
    for key, group in groupby(predicts_usage, func):
        group = list(group)
        usage_by_date[key]['response_time'] = round(statistics.median(i['run_time'] for i in group), 2)
        usage_by_date[key]['predicts'] = len(group)
    return [{'date': k, 
             'response_time': v['response_time'], 
             'predicts': v['predicts'], 
            } for k, v in usage_by_date.items()]


def group_by_date_for_predicts(data: list):
    group_by_weeks, group_by_months = get_settings_from_secrets()
    duration = len(data)
    if duration > group_by_months:
        result = []
        func = lambda x: datetime.strptime(x['date'], "%d.%m.%Y").month
        for key, group in groupby(data, func):
            group = list(group)
            response_time = round(statistics.median(item['response_time'] for item in group), 2)
            predicts = sum(item['predicts'] for item in group)
            date_ = group[0]['date']
            result.append({
                'date': f'{calendar.month_abbr[key]} {datetime.strptime(date_, "%d.%m.%Y").year}',
                'response_time': response_time,
                'predicts': predicts,
            })
        return result
    elif duration > group_by_weeks:
        result = []
        func = lambda x: datetime.strptime(x['date'], "%d.%m.%Y").isocalendar()[1]
        for key, group in groupby(data, func):
            group = list(group)
            response_time = round(statistics.median(item['response_time'] for item in group), 2)
            predicts = sum(item['predicts'] for item in group)
            date_ = group[0]['date']
            result.append({
                'date': date_,
                'response_time': response_time,
                'predicts': predicts,
            })
        return result
    else:
        return data


def get_top_promts_by_name(predicts_usage: list, limit: int = 8):
    promts_by_name = []
    func = lambda x: x['prompt_name']
    for key, group in groupby(sorted(predicts_usage, key=func), func):
        promts_by_name.append({
            'prompt_name': key,
            'call_count': len(list(group))
        })
    return sorted(promts_by_name, key=lambda x: x['call_count'], reverse=True)[:limit]
