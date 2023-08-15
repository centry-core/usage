from datetime import datetime, date, timedelta
import calendar
from itertools import groupby

from pylon.core.tools import log


def calculate_vcu(cpu: int, memory: int, duration: int) -> int:
    duration_in_hours = duration / 3600
    return round((cpu + memory) * duration_in_hours, 2)


def calculate_extras(vcu: float) -> int:
    return round(vcu * 0.1, 2)


def vcu_group_by_date(resource_usage):
    if not resource_usage:
        return []
    project_id = resource_usage[0]['project_id']
    first_day = datetime.strptime(resource_usage[0]['date'].split()[0], "%d.%m.%Y")
    last_day = datetime.strptime(resource_usage[-1]['date'].split()[0], "%d.%m.%Y")
    usage_by_date = {}
    while first_day <= last_day:
        usage_by_date[first_day.strftime("%d.%m.%Y")] = {
            'project_vcu': 0,
            'platform_vcu': 0,
            'project_id': project_id
        }
        first_day += timedelta(days=1)
    for row in resource_usage:
        date = row['date'].split()[0]
        usage_by_date[date]['project_vcu'] += row['project_vcu']
        usage_by_date[date]['platform_vcu'] += row['platform_vcu']
    return [{'date': k, 
             'project_id': v['project_id'], 
             'project_vcu': v['project_vcu'], 
             'platform_vcu': v['platform_vcu'],
            } for k, v in usage_by_date.items()]


def group_by_date(data: list, number_group_weeks: int=90, number_group_months: int=365):
    duration = len(data)
    if duration > number_group_months:
        result = []
        func = lambda x: datetime.strptime(x['date'], "%d.%m.%Y").month
        for key, group in groupby(data, func):
            for item in group:
                date_ = item.pop('date')
                project_id = item.pop('project_id')
                cumulative = {}
                for k, v in item.items():
                    cumulative[k] = cumulative.get(k, 0) + v
            result.append({
                'project_id': project_id,
                'year': datetime.strptime(date_, "%d.%m.%Y").year,
                'month': calendar.month_abbr[key],
                'month_number': key,
                **cumulative
            })
        return result
    elif duration > number_group_weeks:
        result = []
        func = lambda x: datetime.strptime(x['date'], "%d.%m.%Y").isocalendar()[1]
        for key, group in groupby(data, func):
            for idx, item in enumerate(group):
                date_ = item.pop('date')
                project_id = item.pop('project_id')
                if idx == 0:
                    first_day = date_
                cumulative = {}
                for k, v in item.items():
                    cumulative[k] = cumulative.get(k, 0) + v
            result.append({
                'project_id': project_id,
                'week_first_day': first_day,
                'week_number': key,
                **cumulative
            })
        return result
    else:
        return data


def calculate_readable_retention_policy(days: int) -> dict:
    if days and days % 365 == 0:
        expiration_measure, expiration_value = 'years', days // 365
    elif days and days % 31 == 0:
        expiration_measure, expiration_value = 'months', days // 31
    elif days and days % 7 == 0:
        expiration_measure, expiration_value = 'weeks', days // 7
    else:
        expiration_measure, expiration_value = 'days', days
    return {
        'expiration_measure': expiration_measure,
        'expiration_value': expiration_value
    }
