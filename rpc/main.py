from collections import defaultdict
from datetime import datetime, date, timedelta
from typing import List

from hurry.filesize import size
from sqlalchemy import func, asc, desc, case

from ..models.usage_vcu import UsageVCU
from ..models.usage_storage import UsageStorage
from ..models.usage_api import UsageAPI
from ..models.pd.vcu import VcuPD
from ..models.pd.endpoint import EndpointPD
from ..utils.utils import calculate_readable_retention_policy

from tools import rpc_tools, db_tools, MinioClient, MinioClientAdmin, db
from pylon.core.tools import web, log


def _get_storage_size(client):
    buckets = client.list_bucket()
    storage_size = 0
    for bucket in buckets:
        storage_size += client.get_bucket_size(bucket)
    return storage_size


class RPC:
    @web.rpc('usage_get_resource_usage', 'get_resource_usage')
    @rpc_tools.wrap_exceptions(RuntimeError)
    def get_resource_usage(
            self, project_id: int | None = None,
            start_time: datetime | None = None,
            end_time: datetime | None = None
    ) -> List[dict]:
        with db.get_session() as session:
            q = session.query(UsageVCU)
            if project_id:
                q = q.where(UsageVCU.project_id == project_id)
            if start_time:
                q = q.where(UsageVCU.start_time >= start_time.isoformat())
            if end_time:
                end_time += timedelta(days=1)
                q = q.where(UsageVCU.start_time <= end_time.isoformat())
            query_results = q.order_by(asc(UsageVCU.start_time)).all()
            resource_usage = []
            for result in query_results:
                # Exclude tasks which run as a part of a test:
                if result.type == 'task' and result.test_report_id:
                    continue
                resource_usage.append(VcuPD.from_orm(result).dict())
            return resource_usage

    @web.rpc('usage_update_test_resource_usage', 'update_test_resource_usage')
    @rpc_tools.wrap_exceptions(RuntimeError)
    def update_test_resource_usage(self, project_id: int, report_data: dict) -> None:
        report_id = report_data.pop('report_id')
        with db.get_session() as session:
            resources = session.query(UsageVCU).where(
                UsageVCU.project_id == project_id,
                UsageVCU.type == 'test',
                UsageVCU.test_report_id == report_id
            ).first()
            if resources:
                resource_usage = list(resources.resource_usage)
                resource_usage.append(report_data)
                resources.resource_usage = resource_usage
                resources.duration += report_data['time_to_sleep']
                session.commit()

    @web.rpc('usage_get_platform_storage_usage', 'get_platform_storage_usage')
    @rpc_tools.wrap_exceptions(RuntimeError)
    def get_platform_storage_usage(self, project_id: int | None = None) -> List[dict]:
        integrations = self.context.rpc_manager.call.integrations_get_administration_integrations_by_name(
            integration_name='s3_integration', only_shared=True
        )
        bucket_usage = []
        for integration in integrations:
            if project_id:
                mc = MinioClient.from_project_id(project_id, integration.id, False)
            else:
                mc = MinioClientAdmin(integration_id=integration.id)
            try:
                buckets = mc.list_bucket()
            except Exception:
                continue
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
    def get_project_storage_usage(self, project_id: int) -> List[dict]:
        integrations = self.context.rpc_manager.call.integrations_get_project_integrations_by_name(
            project_id=project_id, integration_name='s3_integration'
        )
        bucket_usage = []
        for integration in integrations:
            mc = MinioClient.from_project_id(project_id, integration.id, True)
            try:
                buckets = mc.list_bucket()
            except Exception:
                continue
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

    @web.rpc('usage_get_storage_used_space', 'get_storage_used_space')
    @rpc_tools.wrap_exceptions(RuntimeError)
    def get_storage_used_space(
            self, project_id: int | None = None,
            start_time: datetime | None = None,
            end_time: datetime | None = None
    ) -> List[dict]:
        with db.get_session() as session:
            subquery = session.query(
                UsageStorage.project_id,
                UsageStorage.date,
                func.sum(UsageStorage.throughput).label('throughput'),
                case((UsageStorage.is_project_resourses == True,
                      func.sum(UsageStorage.used_space + UsageStorage.max_delta)),
                     else_=0).label('project_storage'),
                case((UsageStorage.is_project_resourses == False,
                      func.sum(UsageStorage.used_space + UsageStorage.max_delta)),
                     else_=0).label('platform_storage'),
            ).group_by(
                UsageStorage.project_id,
                UsageStorage.date,
                UsageStorage.is_project_resourses
            )
            if project_id:
                subquery = subquery.where(UsageStorage.project_id == project_id)
            if start_time:
                subquery = subquery.where(UsageStorage.date >= start_time.isoformat())
            if end_time:
                end_time += timedelta(days=1)
                subquery = subquery.where(UsageStorage.date <= end_time.isoformat())

            subquery = subquery.subquery()

            query = session.query(
                subquery.c.project_id,
                subquery.c.date,
                func.sum(subquery.c.project_storage).label('project_storage'),
                func.sum(subquery.c.platform_storage).label('platform_storage'),
                func.sum(subquery.c.throughput).label('throughput'),
            ).group_by(
                subquery.c.project_id,
                subquery.c.date,
            ).order_by(
                asc(subquery.c.date)
            )

            query_results = query.all()

            used_space = []
            for result in query_results:
                used_space.append(
                    {
                        'project_id': result.project_id,
                        'date': result.date.strftime("%d.%m.%Y"),
                        'platform_storage': int(result.platform_storage),
                        'project_storage': int(result.project_storage),
                        'throughput': int(result.throughput)
                    }
                )
            return used_space

    @web.rpc('usage_write_throughput_data_to_postgres', 'write_throughput_data_to_postgres')
    @rpc_tools.wrap_exceptions(RuntimeError)
    def _write_throughput_data_to_postgres(self) -> None:
        monitor_data = []
        with db.get_session() as session:
            for (project_id, integration_id, is_local), _bytes in self.throughput_monitor_data.items():
                if record := session.query(UsageStorage).where(
                        UsageStorage.project_id == project_id,
                        UsageStorage.integration_uid == str(integration_id),
                        UsageStorage.date == date.today(),
                        UsageStorage.is_project_resourses == is_local,
                ).first():
                    record.throughput += _bytes
                else:
                    if project_id:
                        mc = MinioClient.from_project_id(project_id, integration_id, is_local)
                    else:
                        mc = MinioClientAdmin(integration_id=integration_id)
                    storage_size = _get_storage_size(mc)
                    record = UsageStorage(
                        project_id=project_id,
                        integration_uid=str(integration_id),
                        date=date.today(),
                        used_space=storage_size,
                        throughput=_bytes,
                        is_project_resourses=is_local,
                    )
                monitor_data.append(record)

            try:
                session.bulk_save_objects(monitor_data)
                session.commit()
            except Exception as e:
                log.exception('usage_write_throughput_data_to_postgres')
                session.rollback()
            self.throughput_monitor_data = defaultdict(int)

    @web.rpc('usage_write_used_space_data_to_postgres', 'write_used_space_data_to_postgres')
    @rpc_tools.wrap_exceptions(RuntimeError)
    def _write_used_space_data_to_postgres(self) -> None:
        monitor_data = []
        with db.get_session() as session:
            for (project_id, integration_id, is_local), space in self.space_monitor_data.items():
                if record := session.query(UsageStorage).where(
                        UsageStorage.project_id == project_id,
                        UsageStorage.integration_uid == str(integration_id),
                        UsageStorage.date == date.today(),
                        UsageStorage.is_project_resourses == is_local,
                ).first():
                    max_delta = max(space['max_delta'] + record.current_delta, record.max_delta)
                    record.current_delta += space['current_delta']
                    record.max_delta = max_delta
                else:
                    if project_id:
                        mc = MinioClient.from_project_id(project_id, integration_id, is_local)
                    else:
                        mc = MinioClientAdmin(integration_id=integration_id)
                    storage_size = _get_storage_size(mc)
                    record = UsageStorage(
                        project_id=project_id,
                        integration_uid=str(integration_id),
                        date=date.today(),
                        used_space=storage_size,
                        is_project_resourses=is_local,
                    )
                monitor_data.append(record)
            try:
                session.bulk_save_objects(monitor_data)
                session.commit()
            except Exception as e:
                log.exception('usage_write_throughput_data_to_postgres')
                session.rollback()
            self.space_monitor_data = defaultdict(lambda: defaultdict(int))

    @web.rpc('usage_write_api_data_to_postgres', 'write_api_data_to_postgres')
    @rpc_tools.wrap_exceptions(RuntimeError)
    def _write_api_data_to_postgres(self):
        monitor_data = []
        for api_call in self.api_monitor_data:
            api_attrs = EndpointPD.validate(api_call).dict(by_alias=True)
            record = UsageAPI(**api_attrs)
            monitor_data.append(record)
        db_tools.bulk_save(monitor_data)
        self.api_monitor_data = []

    @web.rpc('usage_write_monitor_data_to_database', 'write_monitor_data_to_database')
    @rpc_tools.wrap_exceptions(RuntimeError)
    def write_monitor_data_to_database(self):
        self.write_used_space_data_to_postgres()
        self.write_throughput_data_to_postgres()
        self.write_api_data_to_postgres()

    @web.rpc('usage_storage_used_space_check', 'storage_used_space_check')
    @rpc_tools.wrap_exceptions(RuntimeError)
    def storage_used_space_check(self):
        projects = self.context.rpc_manager.call.project_list()
        monitor_data = []
        for project in projects:
            integrations = self.context.rpc_manager.call.integrations_get_all_integrations_by_name(
                project_id=project['id'], integration_name='s3_integration'
            )
            for integration in integrations:
                is_local = bool(integration.project_id)
                try:
                    mc = MinioClient.from_project_id(project['id'], integration.id, is_local)
                    storage_size = _get_storage_size(mc)
                except Exception:
                    continue
                record = UsageStorage(
                    project_id=project['id'],
                    integration_name=integration.config['name'],
                    integration_uid=str(integration.id),
                    date=date.today(),
                    used_space=storage_size,
                    is_project_resourses=is_local
                )
                monitor_data.append(record)
        admin_integrations = self.context.rpc_manager.call.integrations_get_administration_integrations_by_name(
            integration_name='s3_integration', only_shared=False
        )
        for integration in admin_integrations:
            try:
                mc = MinioClientAdmin(integration_id=integration.id)
                storage_size = _get_storage_size(mc)
            except Exception:
                continue
            record = UsageStorage(
                project_id=None,
                integration_name=integration.config['name'],
                integration_uid=str(integration.id),
                date=date.today(),
                used_space=storage_size,
                is_project_resourses=False
            )
            monitor_data.append(record)
        db_tools.bulk_save(monitor_data)
