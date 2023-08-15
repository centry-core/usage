from datetime import datetime, timedelta
import calendar
from itertools import groupby

from pylon.core.tools import log
from tools import VaultClient


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


def group_by_date(data: list):
    vault_client = VaultClient()
    secrets = vault_client.get_all_secrets()
    usage_days_to_group_by_weeks = secrets.get('usage_days_to_group_by_weeks', 90)
    usage_default_days_to_group_by_months = secrets.get('usage_default_days_to_group_by_months', 365)
    duration = len(data)
    if duration > usage_default_days_to_group_by_months:
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
                'date': f'{calendar.month_abbr[key]} {datetime.strptime(date_, "%d.%m.%Y").year}',
                **cumulative
            })
        return result
    elif duration > usage_days_to_group_by_weeks:
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
                'date': first_day,
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
