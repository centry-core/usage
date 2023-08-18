from typing import Optional, Union
from datetime import datetime

from pydantic import BaseModel, Field


class EndpointPD(BaseModel):
    id: int
    project_id: Optional[int]
    mode: Optional[str]
    user: str
    endpoint: str
    method: str
    date: datetime
    view_args: Optional[dict]
    query_params: Optional[dict]
    json_: Optional[dict] = Field(alias='json')
    files: Optional[dict]
    run_time: float
    status_code: int

    class Config:
        orm_mode = True
