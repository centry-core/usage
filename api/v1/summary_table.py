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
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 5))
        order_by = request.args.get('order_by', 'date')
        order_keyword = request.args.get('order_keyword', 'asc')
        try:
            paginator, api_usage = self.module.get_prompts_summary_table(
                project_id, start_time, end_time, page, per_page, order_by, order_keyword
                )
        except KeyError:
            abort(404)
        api_usage = [
            i.dict(exclude={'json_', 'integration_settings', 'extra_data'}) | i.dict()['integration_settings'] 
            for i in api_usage
            ]
        return {
            'rows': api_usage,
            "pagination": {
                "total": paginator.total,
                "page": page,
                "per_page": per_page,
                "pages": paginator.pages,
            }}, 200


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
