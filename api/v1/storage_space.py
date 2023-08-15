from flask import request

from hurry.filesize import size
from datetime import datetime

from tools import  api_tools, auth
from pylon.core.tools import log

from ...utils.utils import group_by_date


class ProjectAPI(api_tools.APIModeHandler):
    pass


class AdminAPI(api_tools.APIModeHandler):
    pass


class API(api_tools.APIBase):
    url_params = [
        '<string:project_id>',
        '<string:mode>/<string:project_id>',
    ]

    mode_handlers = {
        'default': ProjectAPI,
        'administration': AdminAPI
    }

    @auth.decorators.check_api({
        "permissions": ["projects.projects.project.view"]
        })
    def get(self, project_id: int, **kwargs):
        if start_time := request.args.get('start_time'):
            start_time = datetime.fromisoformat(start_time.strip('Z'))
        if end_time := request.args.get('end_time'):
            end_time = datetime.fromisoformat(end_time.strip('Z'))
        used_space = self.module.get_storage_used_space(project_id, start_time, end_time)
        used_space = group_by_date(used_space)
        return {
            'total': len(used_space), 
            'rows': used_space,
            }, 200
