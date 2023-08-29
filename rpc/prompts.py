from collections import defaultdict
from typing import Union, Optional, List
from datetime import datetime, date
from hurry.filesize import size
from sqlalchemy import func, asc, desc, case
from pydantic import parse_obj_as

from ..models.usage_api import UsageAPI
from ..models.pd.predict import PredictPD
from ..models.pd.summary_presets import SummaryPresetsPD

from ..models.usage_models_summary_presets import UsageModelsSummaryPreset

from tools import rpc_tools, config
from pylon.core.tools import web, log


class RPC:
    @web.rpc('usage_get_prompts_usage', 'get_prompts_usage')
    @rpc_tools.wrap_exceptions(RuntimeError)
    def get_prompts_usage(
            self, project_id: int | None = None,
            start_time: datetime | None = None,
            end_time: datetime | None = None, 
            endpoint: str = 'api.v1.prompts.predict'
            ):
        query = UsageAPI.query.filter(
            UsageAPI.project_id == project_id,
            UsageAPI.mode == config.DEFAULT_MODE,
            UsageAPI.endpoint == endpoint,
            UsageAPI.method == 'POST'
            )
        if start_time:
            query = query.filter(UsageAPI.date >= start_time.isoformat())
        if end_time:
            query = query.filter(UsageAPI.date <= end_time.isoformat())
        query_results = query.order_by(asc(UsageAPI.date)).all()
        return parse_obj_as(List[PredictPD], query_results)

    @web.rpc('usage_get_models_summary_presets', 'get_models_summary_presets')
    @rpc_tools.wrap_exceptions(RuntimeError)
    def get_models_summary_presets(self, project_id: int):
        query = UsageModelsSummaryPreset.query.filter(
            UsageModelsSummaryPreset.project_id == project_id,
            ).all()
        return parse_obj_as(List[SummaryPresetsPD], query)

    @web.rpc('usage_create_models_summary_presets', 'create_models_summary_presets')
    @rpc_tools.wrap_exceptions(RuntimeError)
    def create_models_summary_presets(self, project_id: int, preset: dict):
        preset = SummaryPresetsPD.validate(preset).dict()
        preset_db = UsageModelsSummaryPreset(project_id=project_id, **preset)
        preset_db.insert()
        return preset_db.to_json()

    @web.rpc('usage_update_models_summary_presets', 'update_models_summary_presets')
    @rpc_tools.wrap_exceptions(RuntimeError)
    def update_models_summary_presets(self, project_id: int, preset: dict):
        preset = SummaryPresetsPD.validate(preset).dict()
        preset_db = UsageModelsSummaryPreset.query.filter(
            UsageModelsSummaryPreset.project_id == project_id,
            UsageModelsSummaryPreset.name == preset['name'],
            ).first()    
        preset_db.fields = preset['fields']
        preset_db.commit()
        return preset_db.to_json()

    @web.rpc('usage_delete_models_summary_presets', 'delete_models_summary_presets')
    @rpc_tools.wrap_exceptions(RuntimeError)
    def delete_models_summary_presets(self, project_id: int, preset_name: str):
        if preset_db := UsageModelsSummaryPreset.query.filter(
            UsageModelsSummaryPreset.project_id == project_id,
            UsageModelsSummaryPreset.name == preset_name
            ).one_or_none():
            preset_db.delete()
            preset_db.commit()
