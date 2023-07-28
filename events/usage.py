from typing import Union, Optional
import json
from datetime import datetime

from ..models.resource_usage import ResourceUsage

from pylon.core.tools import web, log


class Event:

    @web.event(f"create_task_resource_usage")
    def create_task_resource_usage(self, context, event, payload):
        is_cloud = False  # TODO: must change it when we will be able to run tasks in clouds
        is_project_resourses = False
        resource_usage_task = ResourceUsage(
            project_id = payload['project_id'],
            name = payload['task_name'],
            type = 'task',
            test_uid_or_task_id = payload['task_id'],
            task_result_id = payload['task_result_id'],
            test_report_id = payload.get('test_report_id'),
            start_time = payload['start_time'],
            cpu = json.loads(payload['env_vars']).get('cpu_cores', 1),
            memory = json.loads(payload['env_vars']).get('memory', 1),
            runners = json.loads(payload['env_vars']).get('runners', 1),
            is_cloud = is_cloud,
            location = payload['region'],
            is_project_resourses = is_project_resourses
        )
        resource_usage_task.insert()

    @web.event(f"update_task_resource_usage")
    def update_task_resource_usage(self, context, event, payload):
        resource_usage_task = ResourceUsage.query.filter(
            ResourceUsage.task_result_id == payload['id']
            ).first()
        resource_usage_task.duration = round(payload['task_duration'])
        resource_usage = {
            'time': str(datetime.now()),          
        }
        if payload['task_stats'] and 'kubernetes_stats' in payload['task_stats']:
            resource_usage.update({
                'cpu_limit': int(payload['task_stats']['kubernetes_stats'][0]['cpu_limit']),
                'memory_limit': payload['task_stats']['kubernetes_stats'][0]['memory_limit']
            })
        elif payload['task_stats']:
            resource_usage.update({
            'cpu': round(float(payload['task_stats']["cpu_stats"]["cpu_usage"]["total_usage"]) / 1000000000, 2),
            'memory_usage': round(float(payload['task_stats']["memory_stats"]["usage"]) / (1024 * 1024), 2),
            'memory_limit': round(float(payload['task_stats']["memory_stats"]["limit"]) / (1024 * 1024), 2),     
            })

        resource_usage_task.resource_usage = resource_usage
        resource_usage_task.commit()

    @web.event('throughput_monitor')
    def throughput_monitor(self, context, event, payload) -> None:
        self.minio_monitor[(payload['project_id'], payload['is_local'])] += payload['file_size']
