#!/usr/bin/python3
# coding=utf-8

#   Copyright 2021 getcarrier.io
#
#   Licensed under the Apache License, Version 2.0 (the "License");
#   you may not use this file except in compliance with the License.
#   You may obtain a copy of the License at
#
#       http://www.apache.org/licenses/LICENSE-2.0
#
#   Unless required by applicable law or agreed to in writing, software
#   distributed under the License is distributed on an "AS IS" BASIS,
#   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#   See the License for the specific language governing permissions and
#   limitations under the License.

""" Module """
from collections import defaultdict
from datetime import date

from pylon.core.tools import log  # pylint: disable=E0611,E0401
from pylon.core.tools import module

from .models.storage_used_space import StorageUsedSpace

from .init_db import init_db

from tools import theme, VaultClient


class Module(module.ModuleModel):
    """ Pylon module """

    def __init__(self, context, descriptor):
        self.context = context
        self.descriptor = descriptor

        self.integrations = dict()
        self.sections = dict()
        
        self.throughput_monitor_data = defaultdict(int)
        self.space_monitor_data = defaultdict(lambda: defaultdict(int))

    def init(self):
        """ Init module """
        log.info('Initializing module')
        init_db()

        self.descriptor.init_rpcs()
        self.descriptor.init_blueprint()
        self.descriptor.init_api()
        self.descriptor.init_slots()
        self.descriptor.init_events()

        theme.register_subsection(
            'configuration', 'usage',
            'Usage',
            title="Usage",
            kind="slot",
            permissions={
                "permissions": ["projects.projects.project.view"]
                },
            prefix="usage_",
            weight=5,
        )
        
        # theme.register_mode_subsection(
        #     "administration", "configuration",
        #     "usage", "Usage",
        #     title="Usage",
        #     kind="slot",
        #     permissions={
        #         "permissions": ["projects.projects.project.view"],
        #         "recommended_roles": {
        #             "administration": {"admin": True, "viewer": True, "editor": True},
        #             "default": {"admin": True, "viewer": True, "editor": True},
        #             "developer": {"admin": True, "viewer": True, "editor": True},
        #         }},
        #     prefix="administration_usage_",
        #     # icon_class="fas fa-server fa-fw",
        #     # weight=2,
        # )

        self.create_storage_throughput_monitor()
        self.create_storage_used_space_check()

        vault_client = VaultClient()
        secrets = vault_client.get_all_secrets()
        if 'usage_days_to_group_by_weeks' not in secrets:
            secrets['usage_days_to_group_by_weeks'] = 90
        if 'usage_days_to_group_by_months' not in secrets:
            secrets['usage_days_to_group_by_months'] = 365
        vault_client.set_secrets(secrets)


    def create_storage_throughput_monitor(self):
        schedule_data = {
            'name': 'storage_throughput_monitor',
            'cron': '*/3 * * * *',
            'rpc_func': 'usage_write_minio_monitor_data_to_postgres'
        }
        self.context.rpc_manager.call.scheduling_create_if_not_exists(schedule_data)

    def create_storage_used_space_check(self):
        schedule_data = {
            'name': 'storage_used_space_check',
            'cron': '0 0 * * *',
            'rpc_func': 'usage_storage_used_space_check'
        }
        self.context.rpc_manager.call.scheduling_create_if_not_exists(schedule_data)

    def deinit(self):  # pylint: disable=R0201
        """ De-init module """
        log.info('De-initializing module usage')
        self.integrations = dict()
        self.sections = dict()
