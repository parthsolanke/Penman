from pydantic import BaseModel, Field, conint, confloat
from typing import List, Optional

class DetailedHandwritingRequest(BaseModel):
    text_input: List[str]
    styles: List[conint(ge=0, le=12)]
    biases: List[confloat(ge=0.15, le=2.5)]
    stroke_widths: List[conint(ge=1, le=5)]
    stroke_colors: List[str]
    as_pdf: Optional[bool] = Field(False)

class SimpleHandwritingRequest(BaseModel):
    text_input: str
    style: conint(ge=0, le=12)
    bias: confloat(ge=0.15, le=2.5)
    stroke_width: conint(ge=1, le=5)
    stroke_color: str
    as_pdf: Optional[bool] = Field(False)
