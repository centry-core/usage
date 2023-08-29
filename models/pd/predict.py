from typing import Optional, Union
from datetime import datetime

from pydantic import BaseModel, Field, validator

from pylon.core.tools import log
from tools import rpc_tools


class PredictPD(BaseModel):
    json_: Optional[dict] = Field(alias='json')
    extra_data: Optional[dict]
    project_id: int
    user: str
    date: str
    prompt_id: Optional[int]
    prompt_name: Optional[str]
    integration_uid: Optional[str]
    integration_settings: Optional[dict]
    input: Optional[str]
    run_time: float
    status_code: int
    context: Optional[str]
    examples: Optional[dict]
    variables: Optional[dict]


    class Config:
        orm_mode = True

    @validator('date', pre=True)
    def datetime_to_str(cls, value: datetime, values):
        return value.strftime("%d.%m.%Y %H:%M:%S")

    @validator('prompt_id', always=True, check_fields=False)
    def get_prompt_id(cls, value, values):
        return values['json_'].get('prompt_id')

    @validator('prompt_name', always=True, check_fields=False)
    def get_prompt_name(cls, value, values):
        return values['extra_data'].get('prompt_name')

    @validator('integration_uid', always=True, check_fields=False)
    def get_integration_uid(cls, value, values):
        return values['json_'].get('integration_uid')

    @validator('integration_settings', always=True, check_fields=False)
    def get_integration_settings(cls, value, values):
        return values['json_'].get('integration_settings', {})

    @validator('input', always=True, check_fields=False)
    def get_input(cls, value, values):
        return values['json_'].get('input')

    @validator('run_time')
    def run_time_round(cls, value):
        return round(value, 2)

    @validator('context', always=True, check_fields=False)
    def get_context(cls, value, values):
        return values['extra_data'].get('context', {})
    
    @validator('examples', always=True, check_fields=False)
    def get_examples(cls, value, values):
        return values['extra_data'].get('examples', {})

    @validator('variables', always=True, check_fields=False)
    def get_variables(cls, value, values):
        return values['extra_data'].get('variables', {})
