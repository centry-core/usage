from typing import Optional, Union
from datetime import datetime

from pydantic.v1 import BaseModel, validator, Field

from pylon.core.tools import log


class VcuPD(BaseModel):
    project_id: int
    name: str
    type: str
    date: str = Field(alias='start_time')
    project_vcu: float
    platform_vcu: float

    class Config:
        orm_mode = True

    @validator('date', pre=True)
    def datetime_to_str(cls, value: datetime, values):
        return value.strftime("%d.%m.%Y %H:%M:%S")

