from typing import Optional, Union
from datetime import datetime

from pydantic import BaseModel, constr, validator

from tools import rpc_tools
from pylon.core.tools import log


class EndpointPD(BaseModel):
    project_id: Optional[int] = None
    mode: Optional[str]
    user: str
    display_name: Optional[str]
    roles: list = []
    endpoint: str
    method: constr(to_upper=True)
    date: datetime
    view_args: dict = {}
    query_params: dict = {}
    json_: dict = {}
    files: dict = {}
    run_time: float
    status_code: int
    query_params: dict = {}
    response: Optional[str]
    extra_data: dict = {}

    class Config:
        orm_mode = True
        fields = {
            'json_': 'json',
        }

    @validator('display_name', always=True)
    def set_display_name(cls, value: Optional[str], values: dict):
        if not value:
            return f'User-{values["user"]}'
        return value

    @validator('roles', always=True)
    def set_roles(cls, value: Optional[list], values: dict):
        if not value:
            roles = rpc_tools.RpcMixin().rpc.call.admin_get_user_roles(values['project_id'], values['user'])
            return [role['name'] for role in roles]
        return value
