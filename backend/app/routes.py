import logging
import traceback
from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.responses import StreamingResponse
from io import BytesIO
from handwriting.handwriting_generator import Hand
from app.models import DetailedHandwritingRequest, SimpleHandwritingRequest
from app.utils import split_text_to_segments, validate_characters

logger = logging.getLogger(__name__)
router = APIRouter()
hand = Hand()

@router.post("/generate")
async def generate_detailed_handwriting(request: DetailedHandwritingRequest):
    try:
        validate_characters(request.text_input)

        output = hand.write(
            lines=request.text_input,
            styles=request.styles,
            biases=request.biases,
            stroke_widths=request.stroke_widths,
            stroke_colors=request.stroke_colors,
            as_pdf=request.as_pdf
        )

        if request.as_pdf:
            pdf_stream = BytesIO(output.read())
            pdf_stream.seek(0)
            headers = {"Content-Disposition": "attachment; filename=handwriting.pdf"}
            return StreamingResponse(pdf_stream, media_type="application/pdf", headers=headers)
        else:
            svg_stream = BytesIO(output.encode('utf-8'))
            svg_stream.seek(0)
            return StreamingResponse(svg_stream, media_type="image/svg+xml")
        
    except HTTPException as http_exc:
        raise http_exc

    except Exception as e:
        logger.error(f"Internal Server Error: {e}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail="Internal server error.")

@router.post("/generate-simple")
async def generate_simple_handwriting(request: SimpleHandwritingRequest):
    try:
        lines = split_text_to_segments(request.text_input)
        validate_characters(lines)

        styles = [request.style] * len(lines)
        biases = [request.bias] * len(lines)
        stroke_widths = [request.stroke_width] * len(lines)
        stroke_colors = [request.stroke_color] * len(lines)

        output = hand.write(
            lines=lines,
            styles=styles,
            biases=biases,
            stroke_widths=stroke_widths,
            stroke_colors=stroke_colors,
            as_pdf=request.as_pdf
        )

        if request.as_pdf:
            pdf_stream = BytesIO(output.read())
            pdf_stream.seek(0)
            headers = {"Content-Disposition": "attachment; filename=handwriting.pdf"}
            return StreamingResponse(pdf_stream, media_type="application/pdf", headers=headers)
        else:
            svg_stream = BytesIO(output.encode('utf-8'))
            svg_stream.seek(0)
            return StreamingResponse(svg_stream, media_type="image/svg+xml")
        
    except HTTPException as http_exc:
        raise http_exc

    except Exception as e:
        logger.error(f"Internal Server Error: {e}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail="Internal server error.")
    
@router.post("/svg-to-pdf")
async def convert_svg_to_pdf(file: UploadFile = File(...)):
    try:
        svg_content = await file.read()

        pdf_output = hand._generate_pdf(svg_content.decode('utf-8'))

        pdf_stream = BytesIO(pdf_output.read())
        pdf_stream.seek(0)
        headers = {"Content-Disposition": "attachment; filename=output.pdf"}
        return StreamingResponse(pdf_stream, media_type="application/pdf", headers=headers)

    except Exception as e:
        logger.error(f"Internal Server Error: {e}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail="Internal server error.")
