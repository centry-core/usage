from flask import request

from hurry.filesize import size

from tools import  api_tools, auth
from pylon.core.tools import log


class ProjectAPI(api_tools.APIModeHandler):
    @auth.decorators.check_api({
        "permissions": ["projects.projects.project.view"]
        })
    def get(self, project_id: int):
        platform_bucket_usage = self.module.get_platform_storage_usage(project_id)
        project_bucket_usage = self.module.get_project_storage_usage(project_id)
        total_platform_storage = sum(i['raw_size'] for i in platform_bucket_usage)
        total_project_storage = sum(i['raw_size'] for i in project_bucket_usage)
        return {
            'total': len(platform_bucket_usage), 
            'rows': platform_bucket_usage,
            'platform_storage': {
                'in_bytes': total_platform_storage,
                'readable': size(total_platform_storage)
            },
            'project_storage': {
                'in_bytes': total_project_storage,
                'readable': size(total_project_storage)
            }}, 200


class AdminAPI(api_tools.APIModeHandler):
    @auth.decorators.check_api({
        "permissions": ["projects.projects.project.view"],
        })
    def get(self, **kwargs):
        platform_bucket_usage = self.module.get_platform_storage_usage()
        total_platform_storage = sum(i['raw_size'] for i in platform_bucket_usage)
        total_project_storage = 0
        return {
            'total': len(platform_bucket_usage), 
            'rows': platform_bucket_usage,
            'platform_storage': {
                'in_bytes': total_platform_storage,
                'readable': size(total_platform_storage)
            },
            'project_storage': {
                'in_bytes': total_project_storage,
                'readable': size(total_project_storage)
            }}, 200


class API(api_tools.APIBase):
    url_params = [
        '<string:project_id>',
        '<string:mode>/<string:project_id>',
    ]

    mode_handlers = {
        'default': ProjectAPI,
        'administration': AdminAPI
    }
