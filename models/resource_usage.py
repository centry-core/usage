#     Copyright 2020 getcarrier.io
#
#     Licensed under the Apache License, Version 2.0 (the "License");
#     you may not use this file except in compliance with the License.
#     You may obtain a copy of the License at
#
#         http://www.apache.org/licenses/LICENSE-2.0
#
#     Unless required by applicable law or agreed to in writing, software
#     distributed under the License is distributed on an "AS IS" BASIS,
#     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#     See the License for the specific language governing permissions and
#     limitations under the License.

from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.dialects.postgresql import JSON

from tools import db, db_tools, rpc_tools
from ..utils.calculate_vcu import calculate_vcu


class ResourceUsage(db_tools.AbstractBaseMixin, db.Base, rpc_tools.RpcMixin):
    __tablename__ = "resource_usage"

    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, unique=False, nullable=True)
    name = Column(String(128), unique=False, nullable=False)
    type = Column(String(128), unique=False, nullable=False)
    test_uid_or_task_id = Column(String(128), unique=False, nullable=False)
    test_report_id = Column(Integer, unique=False, nullable=True)
    task_result_id = Column(Integer, unique=False, nullable=True)
    start_time = Column(DateTime, unique=False, nullable=True)
    duration = Column(Integer, unique=False, nullable=True, default=0)
    cpu = Column(Integer, unique=False, nullable=False)
    memory = Column(Integer, unique=False, nullable=False)
    runners = Column(Integer, unique=False, nullable=False, default=1)
    is_cloud = Column(Boolean, unique=False, nullable=False, default=True)
    location = Column(String(128), unique=False, nullable=False)
    is_project_resourses = Column(Boolean, unique=False, nullable=False, default=True)
    resource_usage=Column(JSON, unique=False, default=[])

    @property
    def project_vcu(self):
        if self.is_project_resourses:
            return calculate_vcu(self.cpu, self.memory, self.duration)

    @property
    def platform_vcu(self):
        if not self.is_project_resourses:
            return calculate_vcu(self.cpu, self.memory, self.duration)
