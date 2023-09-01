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
        field_id = request.args.get('id')
        field_name = request.args.get('field')
        if field_name not in ('context', 'input', 'examples', 'variables'):
            abort(404)
        field_value = self.module.get_prompts_summary_table_value(field_id, field_name)
        return {
            'id': field_id,
            'field': field_name,
            'value': field_value,
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
