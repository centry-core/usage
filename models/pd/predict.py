from typing import Optional, Union
from datetime import datetime

from pydantic import BaseModel, Field, validator, root_validator

from pylon.core.tools import log


# TEXT_LIMIT = 50

class PredictShortPD(BaseModel):
    user: str
    date: str
    prompt_name: Optional[str]
    run_time: float
    status_code: int


    class Config:
        orm_mode = True
        fields = {
            'user': 'display_name',
        }

    @validator('date', pre=True)
    def datetime_to_str(cls, value: datetime, values):
        return value.strftime("%d.%m.%Y %H:%M:%S")

    @validator('run_time')
    def run_time_round(cls, value):
        return round(value, 2)

    @validator('prompt_name')
    def prompt_name_validator(cls, value):
        if value is None:
            return 'No prompt'
        return value


class PredictPD(BaseModel):
    text_limit: Optional[int] = None
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
    context: str = ''
    examples: list = []
    variables: list = []
    version: Optional[str]
    response: Optional[str]


    class Config:
        orm_mode = True
        fields = {
            'user': 'display_name',
        }

    @root_validator(pre=True)
    def apply_text_limit(cls, values):
        text_limit = values.get("text_limit")
        if text_limit:
            cls.text_limit = text_limit
        return values

    @root_validator(pre=False)
    def unpack_extra_data(cls, values: dict) -> dict:
        log.info(f'values: {values}')
        text_limit = values.get('text_limit')
        values.update(values.get('extra_data', {}))

        values['examples'] = values.get('examples', []) + values['json_'].get('examples', [])
        values['variables'] = values.get('variables', []) + values['json_'].get('variables', [])

        values['context'] = values.get('context', '') + values['json_'].get('context', '')
        values['context'] = values['context'][:text_limit]
        if values['response']:
            values['response'] = values['response'][:text_limit]

        return values

    @validator('date', pre=True)
    def datetime_to_str(cls, value: datetime, values):
        return value.strftime("%d.%m.%Y %H:%M:%S")

    @validator('prompt_id', always=True, check_fields=False)
    def get_prompt_id(cls, value, values):
        return values['json_'].get('prompt_id')

    @validator('integration_uid', always=True, check_fields=False)
    def get_integration_uid(cls, value, values):
        return values['json_'].get('integration_uid')

    @validator('integration_settings', always=True, check_fields=False)
    def get_integration_settings(cls, value, values):
        return values['json_'].get('integration_settings', {})

    @validator('input', always=True, check_fields=False)
    def get_input(cls, value, values):
        text_limit = values.get('text_limit')
        return values['json_'].get('input', '')[:text_limit]

    @validator('run_time')
    def run_time_round(cls, value):
        return round(value, 2)

    def dict(self, *args, **kwargs):
        dict_result = super().dict(*args, **kwargs)
        if "text_limit" in dict_result:
            del dict_result["text_limit"]
        del dict_result["json_"]
        del dict_result["extra_data"]
        dict_result.update(dict_result.pop("integration_settings", {}))
        return dict_result


class PredictPDWithTextLimit(PredictPD):
    text_limit: Optional[int] = 50
    examples: bool = False
    variables: bool = False

    @root_validator(pre=False)
    def unpack_extra_data(cls, values: dict) -> dict:
        log.info(f'values: {values}')
        text_limit = values.get('text_limit')
        values.update(values.get('extra_data', {}))

        values['examples'] = bool(values.get('examples')) or bool(values['json_'].get('examples'))
        values['variables'] = bool(values.get('variables')) or bool(values['json_'].get('variables'))

        values['context'] = values.get('context', '') + values['json_'].get('context', '')
        values['context'] = values['context'][:text_limit]
        if values['response']:
            values['response'] = values['response'][:text_limit]

        return values
