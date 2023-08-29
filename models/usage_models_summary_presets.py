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

from sqlalchemy import Column, Integer, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import ARRAY

from tools import db, db_tools, rpc_tools


class UsageModelsSummaryPreset(db_tools.AbstractBaseMixin, db.Base, rpc_tools.RpcMixin):
    __tablename__ = "usage_models_summary_presets"
    __table_args__ = (
        UniqueConstraint('project_id', 'name'),
    )

    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, unique=False, nullable=True)
    name = Column(String(128), unique=False, nullable=True)
    fields = Column(ARRAY(String), default=[])
