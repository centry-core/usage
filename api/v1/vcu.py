import json
from datetime import datetime
from typing import Optional, Tuple, List
from flask import request
from pylon.core.tools import log

from tools import auth, api_tools
from ...utils.utils import vcu_group_by_date, group_by_date


class ProjectAPI(api_tools.APIModeHandler):
    @auth.decorators.check_api({
        "permissions": ["projects.projects.project.view"],
        })
    def get(self, project_id: int | None = None) -> tuple[dict, int] | tuple[list, int]:
        if start_time := request.args.get('start_time'):
            start_time = datetime.fromisoformat(start_time.strip('Z'))
        if end_time := request.args.get('end_time'):
            end_time = datetime.fromisoformat(end_time.strip('Z'))
        resource_usage = self.module.get_resource_usage(project_id, start_time, end_time)
        usage_by_date = group_by_date(vcu_group_by_date(resource_usage))
        return {
            'total': len(resource_usage), 
            'rows': resource_usage,
            'group_by_date': usage_by_date,
            'platform_vcu': round(sum(i['platform_vcu'] for i in resource_usage if i['platform_vcu']), 2),
            'project_vcu': round(sum(i['project_vcu'] for i in resource_usage if i['project_vcu']), 2)
            }, 200

    @auth.decorators.check_api({
        "permissions": ["projects.projects.project.view"],
        })
    def put(self, project_id: int) -> tuple[dict, int] | tuple[list, int]:
        data = request.json
        self.module.update_test_resource_usage(project_id, data)


class AdminAPI(api_tools.APIModeHandler):
    @auth.decorators.check_api({
        "permissions": ["projects.projects.project.view"],
        })
    def get(self, project_id: int | None = None) -> tuple[dict, int] | tuple[list, int]:
        if start_time := request.args.get('start_time'):
            start_time = datetime.fromisoformat(start_time.strip('Z'))
        if end_time := request.args.get('end_time'):
            end_time = datetime.fromisoformat(end_time.strip('Z'))
        resource_usage = self.module.get_resource_usage(project_id, start_time, end_time)
        return {
            'total': len(resource_usage), 
            'rows': resource_usage,
            'platform_vcu': round(sum(i['platform_vcu'] for i in resource_usage if i['platform_vcu']), 2),
            'project_vcu': round(sum(i['project_vcu'] for i in resource_usage if i['project_vcu']), 2)
            }, 200


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
