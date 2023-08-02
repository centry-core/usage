from collections import defaultdict
from typing import Union, Optional
from datetime import datetime, date
from hurry.filesize import size
from sqlalchemy import func, asc, desc


from ..models.resource_usage import ResourceUsage
from ..models.storage_throughput import StorageThroughput

from tools import rpc_tools, db_tools, MinioClient, MinioClientAdmin
from pylon.core.tools import web, log


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

class RPC:
    @web.rpc('usage_get_resource_usage', 'get_resource_usage')
    @rpc_tools.wrap_exceptions(RuntimeError)
    def get_resource_usage(
            self, project_id: int | None = None,
            start_time: datetime | None = None,
            end_time: datetime | None = None
            ):
        resource_usage = []
        if project_id:
            query = ResourceUsage.query.filter(
                ResourceUsage.project_id == project_id
                )
        else:
            query = ResourceUsage.query
        if start_time:
            query = query.filter(ResourceUsage.start_time >= start_time.isoformat())
        if end_time:
            query = query.filter(ResourceUsage.start_time <= end_time.isoformat())
        query_results = query.all()
        for result in query_results:
            # Exclude tasks which run as a part of a test:
            if result.type == 'task' and result.test_report_id:
                continue
            resource_usage.append(
                {
                    'id': result.id,
                    'project_id': result.project_id,
                    'name': result.name,
                    'type': result.type,
                    'date': result.start_time.strftime("%m.%d.%Y %H:%M:%S"),
                    'project_vcu': result.project_vcu,
                    'platform_vcu': result.platform_vcu,
                }
            )
        return resource_usage

    @web.rpc('usage_update_test_resource_usage', 'update_test_resource_usage')
    @rpc_tools.wrap_exceptions(RuntimeError)
    def update_test_resource_usage(self, report_data: dict):
        report_id = report_data.pop('report_id')
        resources = ResourceUsage.query.filter(
            ResourceUsage.type == 'test',
            ResourceUsage.test_report_id == report_id
            ).first()
        resource_usage = list(resources.resource_usage)
        resource_usage.append(report_data)
        resources.resource_usage = resource_usage
        resources.duration += report_data['time_to_sleep']
        resources.commit()

    @web.rpc('usage_get_platform_storage_usage', 'get_platform_storage_usage')
    @rpc_tools.wrap_exceptions(RuntimeError)
    def get_platform_storage_usage(self, project_id: int | None = None):
        integrations = self.context.rpc_manager.call.integrations_get_administration_integrations_by_name(
            integration_name='s3_integration', only_shared=True
        )
        bucket_usage = []
        for integration in integrations:
            if project_id:
                mc = MinioClient.from_project_id(project_id, integration.id, False)
            else:
                mc = MinioClientAdmin(integration_id=integration.id)
            buckets = mc.list_bucket()
            for bucket in buckets:
                bucket_size = mc.get_bucket_size(bucket)
                try:
                    lifecycle = mc.get_bucket_lifecycle(bucket)
                    retention_policy = calculate_readable_retention_policy(
                        days=lifecycle["Rules"][0]['Expiration']['Days']
                        )
                except Exception:
                    retention_policy = None
                bucket_usage.append(
                    {
                        'storage': integration.config['name'],
                        'bucket': bucket,
                        'raw_size': bucket_size,
                        'readable_size': size(bucket_size),
                        'retention': retention_policy
                    }
                )
        return bucket_usage

    @web.rpc('usage_get_project_storage_usage', 'get_project_storage_usage')
    @rpc_tools.wrap_exceptions(RuntimeError)
    def get_project_storage_usage(self, project_id: int):
        integrations = self.context.rpc_manager.call.integrations_get_project_integrations_by_name(
            project_id=project_id, integration_name='s3_integration'
        )
        bucket_usage = []
        for integration in integrations:
            mc = MinioClient.from_project_id(project_id, integration.id, True)
            buckets = mc.list_bucket()
            for bucket in buckets:
                bucket_size = mc.get_bucket_size(bucket)
                try:
                    lifecycle = mc.get_bucket_lifecycle(bucket)
                    retention_policy = calculate_readable_retention_policy(
                        days=lifecycle["Rules"][0]['Expiration']['Days']
                        )
                except Exception:
                    retention_policy = None
                bucket_usage.append(
                    {
                        'storage': integration.config['name'],
                        'bucket': bucket,
                        'raw_size': bucket_size,
                        'readable_size': size(bucket_size),
                        'retention': retention_policy
                    }
                )
        return bucket_usage

    @web.rpc('usage_get_storage_throughput', 'get_storage_throughput')
    @rpc_tools.wrap_exceptions(RuntimeError)
    def get_storage_throughput(self, project_id: int | None = None):
        throughput = []
        query = StorageThroughput.query.with_entities(
                    StorageThroughput.project_id,
                    StorageThroughput.date,
                    func.sum(StorageThroughput.throughput).label('total_throughput')
                ).group_by(
                    StorageThroughput.project_id,
                    StorageThroughput.date,
                ).order_by(
                    asc(StorageThroughput.date),                
                )
        if project_id:
            query = query.filter(StorageThroughput.project_id == project_id)
        query_results = query.all()
        for result in query_results:
            throughput.append(
                {
                    'project_id': result.project_id,
                    'date': result.date.strftime("%d.%m.%Y"),
                    'throughput': size(result.total_throughput),
                    'raw_size': result.total_throughput,
                }
            )
        return throughput

    @web.rpc('usage_write_minio_monitor_data_to_postgres', 'write_minio_monitor_data_to_postgres')
    @rpc_tools.wrap_exceptions(RuntimeError)
    def write_minio_monitor_data_to_postgres(self):
        monitor_data = []
        for (project_id, is_local), bytes in self.minio_monitor.items():
            if record := StorageThroughput.query.filter(
                StorageThroughput.project_id == project_id,
                StorageThroughput.date == date.today(),
                StorageThroughput.is_project_resourses == is_local,
                ).one_or_none():
                    record.throughput += bytes
            else:
                record = StorageThroughput(
                    project_id=project_id,
                    date=date.today(),
                    throughput=bytes,
                    is_project_resourses=is_local
                )
            monitor_data.append(record)
        db_tools.bulk_save(monitor_data)
        self.minio_monitor = defaultdict(int)
