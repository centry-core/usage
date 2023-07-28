from flask import request

from hurry.filesize import size

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
        throughput = self.module.get_storage_throughput(project_id)
        return {'total': len(throughput), 'rows': throughput}, 200
