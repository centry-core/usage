from typing import Optional, Union
from datetime import datetime

from pydantic import BaseModel, Field, constr


class EndpointPD(BaseModel):
    project_id: Optional[int]
    mode: Optional[str]
    user: str
    endpoint: str
    method: constr(to_upper=True)
    date: datetime
    view_args: Optional[dict]
    query_params: Optional[dict]
    json_: Optional[dict] = Field(alias='json')
    files: Optional[dict]
    run_time: float
    status_code: int
    query_params: Optional[dict]
    extra_data: Optional[dict]

    class Config:
        orm_mode = True
