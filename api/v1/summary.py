import json
from datetime import datetime
from typing import Optional, Tuple, List
from flask import request
from pylon.core.tools import log

from tools import auth, api_tools
from ...utils.prompts import (get_successful_predicts, get_users, predicts_by_date,
    get_top_promts_by_name, group_by_date_for_predicts)


class ProjectAPI(api_tools.APIModeHandler):

    @api_tools.endpoint_metrics
    @auth.decorators.check_api({
        "permissions": ["models.prompts"],
        })
    def get(self, project_id: int | None = None) -> tuple[dict, int] | tuple[list, int]:
        if start_time := request.args.get('start_time'):
            start_time = datetime.fromisoformat(start_time.strip('Z'))
        if end_time := request.args.get('end_time'):
            end_time = datetime.fromisoformat(end_time.strip('Z'))
        api_usage = [i.dict(exclude={'extra_data'})
            for i in self.module.get_prompts_summary(project_id, start_time, end_time)]
        return {
            'users': get_users(api_usage),
            'predicts_total': len(api_usage),
            'successful_predicts': get_successful_predicts(api_usage),
            'predicts_by_date': group_by_date_for_predicts(predicts_by_date(api_usage)),
            'top_promts_by_name': get_top_promts_by_name(api_usage),
            }, 200


class AdminAPI(api_tools.APIModeHandler):
    pass


class API(api_tools.APIBase):  # pylint: disable=R0903
    url_params = [
        "",
        "<string:mode>",
        "<string:mode>/<int:project_id>",
    ]

    mode_handlers = {
        'administration': AdminAPI,
        'default': ProjectAPI,
    }
