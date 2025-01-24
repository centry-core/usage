from typing import Optional, Union, List
from pydantic.v1 import BaseModel, constr


class SummaryPresetsPD(BaseModel):
    name: constr(to_lower=True)
    fields: List[str]

    class Config:
        orm_mode = True

