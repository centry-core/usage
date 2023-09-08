from typing import Optional, Union
from datetime import datetime

from pydantic import BaseModel, Field, validator, root_validator

from pylon.core.tools import log
from tools import rpc_tools


TEXT_LIMIT = 50

class PredictShortPD(BaseModel):
    user: str
    date: str
    prompt_name: Optional[str]
    run_time: float
    status_code: int


    class Config:
        orm_mode = True

    @validator('date', pre=True)
    def datetime_to_str(cls, value: datetime, values):
        return value.strftime("%d.%m.%Y %H:%M:%S")

    @validator('run_time')
    def run_time_round(cls, value):
        return round(value, 2)


class PredictPD(BaseModel):
    id: int
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
    examples: bool = False
    variables: bool = False
    version: Optional[str]


    class Config:
        orm_mode = True

    @root_validator(pre=False)
    def unpack_extra_data(cls, values: dict) -> dict:
        # log.info('root_validator %s', values)
        values.update(values.get('extra_data', {}))

        values['examples'] = bool(values.get('examples')) or bool(values['json_'].get('examples'))
        values['variables'] = bool(values.get('variables')) or bool(values['json_'].get('variables'))

        values['context'] = values.get('context', '') + values['json_'].get('context', '')
        values['context'] = values['context'][:TEXT_LIMIT]
        # log.info('root_validator %s', values)
        return values

    @validator('date', pre=True)
    def datetime_to_str(cls, value: datetime, values):
        return value.strftime("%d.%m.%Y %H:%M:%S")

    @validator('prompt_id', always=True, check_fields=False)
    def get_prompt_id(cls, value, values):
        return values['json_'].get('prompt_id')



    # @validator('prompt_name', always=True, check_fields=False)
    # def get_prompt_name(cls, value, values):
    #     return values['extra_data'].get('prompt_name')

    @validator('integration_uid', always=True, check_fields=False)
    def get_integration_uid(cls, value, values):
        return values['json_'].get('integration_uid')

    @validator('integration_settings', always=True, check_fields=False)
    def get_integration_settings(cls, value, values):
        return values['json_'].get('integration_settings', {})

    @validator('input', always=True, check_fields=False)
    def get_input(cls, value, values):
        return values['json_'].get('input', '')[:TEXT_LIMIT]

    @validator('run_time')
    def run_time_round(cls, value):
        return round(value, 2)

    # @validator('context', always=True, check_fields=False)
    # def get_context(cls, value: Optional[str], values):
    #     result = value or ''
    #     return (
    #         result +
    #         values['json_'].get('context', '')
    #         )[:TEXT_LIMIT]
    
    # @validator('examples', always=True)
    # def get_examples(cls, value, values) -> bool:
    #     log.info('val get_examples %s :: %s', value, bool(value) or bool(values['json_'].get('examples')))
    #     # return bool(values['extra_data'].get('examples')) or bool(values['json_'].get('examples'))
    #     return
    #
    # @validator('variables', always=True)
    # def get_variables(cls, value, values) -> bool:
    #     log.info('val get_variables %s :: %s', value, bool(value) or bool(values['json_'].get('examples')))
    #     # return bool(values['extra_data'].get('variables')) or bool(values['json_'].get('variables'))
    #     return bool(value) or bool(values['json_'].get('variables'))

    # @validator('version', always=True, check_fields=False)
    # def get_version(cls, value, values):
    #     return values['extra_data'].get('version')
