from pydantic import BaseModel, Field, conint, confloat, validator
from typing import List, Optional

class DetailedHandwritingRequest(BaseModel):
    text_input: List[str]
    styles: List[conint(ge=0, le=12)]
    biases: List[confloat(ge=0.15, le=2.5)]
    stroke_widths: List[conint(ge=1, le=5)]
    stroke_colors: List[str]
    as_pdf: Optional[bool] = Field(False)

    @validator('text_input')
    def check_non_empty_text_input(cls, v):
        if not v or any(text.strip() == "" for text in v):
            raise ValueError('text_input must not be empty or contain empty strings')
        return v

class SimpleHandwritingRequest(BaseModel):
    text_input: str
    style: conint(ge=0, le=12)
    bias: confloat(ge=0.15, le=2.5)
    stroke_width: conint(ge=1, le=5)
    stroke_color: str
    as_pdf: Optional[bool] = Field(False)

    @validator('text_input')
    def check_non_empty_text_input(cls, v):
        if not v.strip():
            raise ValueError('text_input must not be empty or contain only whitespace')
        return v
