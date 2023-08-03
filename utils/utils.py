def calculate_vcu(cpu: int, memory: int, duration: int) -> int:
    duration_in_hours = duration / 3600
    return round((cpu + memory) * duration_in_hours, 2)


def calculate_extras(vcu: float) -> int:
    return round(vcu * 0.1, 2)


def vcu_group_by_date(resource_usage):
    usage_by_date = {}
    for row in resource_usage:
        date = row['date'].split()[0]
        usage_by_date.setdefault(date, {})['project_vcu'] = usage_by_date.get(
            date, {}).get('project_vcu', 0) + row['project_vcu']
        usage_by_date.setdefault(date, {})['platform_vcu'] = usage_by_date.get(
            date, {}).get('platform_vcu', 0) + row['platform_vcu']
    return [{'date': k, 'project_vcu': v['project_vcu'], 'platform_vcu': v['platform_vcu']}
            for k, v in usage_by_date.items()]


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
