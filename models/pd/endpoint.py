from typing import Optional, Union
from datetime import datetime

from pydantic import BaseModel, constr, validator


class EndpointPD(BaseModel):
    project_id: Optional[int]
    mode: Optional[str]
    user: str
    display_name: Optional[str]
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
            return values['user']
        return value
