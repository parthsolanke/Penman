from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from typing import List, Optional
from io import BytesIO

from handwriting.handwriting_generator import Hand

app = FastAPI()
hand = Hand()

class HandwritingRequest(BaseModel):
    text_input: List[str] = Field(..., description="List of text lines to generate handwriting for.")
    styles: Optional[List[int]] = Field(None, description="List of style IDs for each line.")
    biases: Optional[List[float]] = Field(None, description="List of biases for handwriting variation.")
    stroke_widths: Optional[List[int]] = Field(None, description="List of stroke widths for each line.")
    stroke_colors: Optional[List[str]] = Field(None, description="List of colors for each line.")
    as_pdf: Optional[bool] = Field(False, description="Return output as a PDF.")

@app.post("/handwriting/generate")
async def generate_handwriting(request: HandwritingRequest):
    try:
        output = hand.write(
            lines=request.text_input,
            biases=request.biases,
            styles=request.styles,
            stroke_colors=request.stroke_colors,
            stroke_widths=request.stroke_widths,
            as_pdf=request.as_pdf
        )
        
        if request.as_pdf:
            pdf_stream = BytesIO(output.read())
            pdf_stream.seek(0)
            headers = {"Content-Disposition": "attachment; filename=handwriting.pdf"}
            return StreamingResponse(pdf_stream, media_type="application/pdf", headers=headers)
        else:
            return {"svg": output}

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error.")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
