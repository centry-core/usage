from flask import request

from hurry.filesize import size
from datetime import datetime

from tools import  api_tools, auth
from pylon.core.tools import log


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
        throughput = self.module.get_storage_throughput(project_id, start_time, end_time)
        return {
            'total': len(throughput), 
            'rows': throughput,
            'total_throughput': size(sum(i['raw_size'] for i in throughput)),
            }, 200
