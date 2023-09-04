from collections import defaultdict
from typing import Union, Optional, List
from datetime import datetime, timedelta
from hurry.filesize import size
from sqlalchemy import func, asc, desc, case, cast, Integer
from pydantic import parse_obj_as

from ..models.usage_api import UsageAPI
from ..models.pd.predict import PredictPD, PredictShortPD
from ..models.pd.summary_presets import SummaryPresetsPD

from ..models.usage_models_summary_presets import UsageModelsSummaryPreset

from tools import rpc_tools, config
from pylon.core.tools import web, log


ODRER_MAPPING = {
    'project_id': UsageAPI.project_id,
    'user': UsageAPI.user,
    'date': UsageAPI.date,
    'run_time': UsageAPI.run_time,
    'status_code': UsageAPI.status_code,
    'prompt_id': cast(UsageAPI.json['prompt_id'].astext, Integer),
    'prompt_name': UsageAPI.extra_data['prompt_name'].astext,
    'integration_uid': UsageAPI.json['integration_uid'].astext,
    'input': UsageAPI.json['input'].astext,
    'context': UsageAPI.extra_data['prompt_name'].astext,
    'model_name': UsageAPI.json['integration_settings']['model_name'].astext,
    'temperature': UsageAPI.json['integration_settings']['temperature'].astext,
    'max_tokens': UsageAPI.json['integration_settings']['max_tokens'].astext,
    'top_k': UsageAPI.json['integration_settings']['top_k'].astext,
    'top_p': UsageAPI.json['integration_settings']['top_p'].astext,
    'examples': UsageAPI.extra_data['examples'].astext,
    'variables': UsageAPI.extra_data['variables'].astext,
}

class RPC:
    @web.rpc('usage_get_prompts_summary', 'get_prompts_summary')
    @rpc_tools.wrap_exceptions(RuntimeError)
    def get_prompts_summary(
            self, project_id: int,
            start_time: datetime | None = None,
            end_time: datetime | None = None, 
            endpoint: str | None = None,
            ):
        if not endpoint:
            endpoint = self.descriptor.config['predict_endpoint']
        query = UsageAPI.query.with_entities(
            UsageAPI.user, 
            UsageAPI.date,
            UsageAPI.run_time,
            UsageAPI.status_code,
            UsageAPI.extra_data['prompt_name'].astext.label('prompt_name')           
            ).filter(
            UsageAPI.project_id == project_id,
            UsageAPI.mode == config.DEFAULT_MODE,
            UsageAPI.endpoint == endpoint,
            UsageAPI.method == 'POST'
            )
        if start_time:
            query = query.filter(UsageAPI.date >= start_time.isoformat())
        if end_time:
            end_time += timedelta(days=1)
            query = query.filter(UsageAPI.date <= end_time.isoformat())
        query_results = query.order_by(asc(UsageAPI.date)).all()
        return parse_obj_as(List[PredictShortPD], query_results)
    
    @web.rpc('usage_get_prompts_summary_table', 'get_prompts_summary_table')
    @rpc_tools.wrap_exceptions(RuntimeError)
    def get_prompts_summary_table(
            self, project_id: int,
            start_time: datetime | None = None,
            end_time: datetime | None = None,
            page: int = 1, 
            limit: int = 5, 
            sort: str = 'date', 
            order: str = 'asc', 
            endpoint: str | None = None,
            ):
        if not endpoint:
            endpoint = self.descriptor.config['predict_endpoint']
        query = UsageAPI.query.filter(
            UsageAPI.project_id == project_id,
            UsageAPI.mode == config.DEFAULT_MODE,
            UsageAPI.endpoint == endpoint,
            UsageAPI.method == 'POST'
            )
        if start_time:
            query = query.filter(UsageAPI.date >= start_time.isoformat())
        if end_time:
            end_time += timedelta(days=1)
            query = query.filter(UsageAPI.date <= end_time.isoformat())
        order_func = asc if order == 'asc' else desc
        order_conditon = ODRER_MAPPING[sort]
        query = query.order_by(order_func(order_conditon))
        paginator = query.paginate(page=page, per_page=limit)
        return paginator, parse_obj_as(List[PredictPD], paginator.items)

    @web.rpc('usage_get_prompts_summary_table_value', 'get_prompts_summary_table_value')
    @rpc_tools.wrap_exceptions(RuntimeError)
    def get_prompts_summary_table_value(self, field_id: int, field_name: str):
        record = UsageAPI.query.get_or_404(field_id)
        if record:
            if field_name in ('examples', 'variables'):
                 return record.extra_data.get(field_name, []) + record.json.get(field_name, [])
            if field_name in ('context', 'input'):
                return record.extra_data.get(field_name, '') + record.json.get(field_name, '')

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
