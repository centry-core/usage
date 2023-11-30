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

from datetime import datetime
from sqlalchemy import Column, Integer, Date, Boolean, String, UniqueConstraint, BigInteger

from tools import db, db_tools, rpc_tools


class UsageStorage(db_tools.AbstractBaseMixin, db.Base, rpc_tools.RpcMixin):
    __tablename__ = "usage_storage"
    __table_args__ = (
        UniqueConstraint("project_id", "date", "integration_uid", "is_project_resourses"),
    )

    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, unique=False, nullable=True)
    date = Column(Date, default=datetime.utcnow)
    integration_name = Column(String(128), unique=False, nullable=True)
    integration_uid = Column(String(128), unique=False, nullable=True)
    used_space = Column(BigInteger, unique=False, default=0)
    current_delta = Column(BigInteger, unique=False, default=0)
    max_delta = Column(BigInteger, unique=False, default=0)
    throughput = Column(BigInteger, unique=False, default=0)
    is_project_resourses = Column(Boolean, unique=False, nullable=False, default=True)

    @property
    def max_used_space(self):
        return self.used_space + self.max_delta
