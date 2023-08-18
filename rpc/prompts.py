from collections import defaultdict
from typing import Union, Optional, List
from datetime import datetime, date
from hurry.filesize import size
from sqlalchemy import func, asc, desc, case
from pydantic import parse_obj_as

from ..models.usage_api import UsageAPI
from ..models.pd.predict import PredictPD

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
        api_usage = parse_obj_as(List[PredictPD], query_results)
        return api_usage
