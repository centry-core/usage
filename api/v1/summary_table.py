import json
from datetime import datetime
from typing import Optional, Tuple, List
from flask import abort, request
from pylon.core.tools import log

from tools import auth, api_tools


class ProjectAPI(api_tools.APIModeHandler):
    @auth.decorators.check_api({
        "permissions": ["models.prompts"],
        })
    def get(self, project_id: int | None = None) -> tuple[dict, int] | tuple[list, int]:
        if start_time := request.args.get('start_time'):
            start_time = datetime.fromisoformat(start_time.strip('Z'))
        if end_time := request.args.get('end_time'):
            end_time = datetime.fromisoformat(end_time.strip('Z'))
        offset = int(request.args.get('offset', 0))
        limit = int(request.args.get('limit', 5))
        sort = request.args.get('sort', 'date')
        order = request.args.get('order', 'asc')
        try:
            paginator, api_usage = self.module.get_prompts_summary_table(
                project_id, start_time, end_time, offset, limit, sort, order
                )
        except KeyError:
            abort(404)
        api_usage = [
            i.dict(exclude={'json_', 'integration_settings', 'extra_data'}) | i.dict()['integration_settings'] 
            for i in api_usage
            ]
        return {
            'rows': api_usage,
            "total": paginator.total
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
