import logging
import traceback
from io import BytesIO
import json
from typing import Dict
from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.responses import StreamingResponse
from app.models import DetailedHandwritingRequest, SimpleHandwritingRequest, StreamHandwritingRequest
from app.utils import split_text_to_segments, validate_characters
from handwriting.generator import Hand

logger = logging.getLogger(__name__)
router = APIRouter()
hand = Hand()

@router.post("/generate")
async def generate_detailed_handwriting(request: DetailedHandwritingRequest):
    try:
        validate_characters(request.text_input)

        output = await hand.write(
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

        output = await hand.write(
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

        pdf_output = await hand._generate_pdf(svg_content.decode('utf-8'))

        pdf_stream = BytesIO(pdf_output.read())
        pdf_stream.seek(0)
        headers = {"Content-Disposition": "attachment; filename=output.pdf"}
        return StreamingResponse(pdf_stream, media_type="application/pdf", headers=headers)

    except Exception as e:
        logger.error(f"Internal Server Error: {e}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail="Internal server error.")
    
@router.post("/generate-stream")
async def stream_handwriting(request: StreamHandwritingRequest):
    try:
        lines = split_text_to_segments(request.text_input)
        validate_characters(lines)

        async def generate_streamed_response():
            try:
                async for chunk in hand.stream_write(
                    lines=lines,
                    styles=[request.style] * len(lines),
                    biases=[request.bias] * len(lines),
                    stroke_colors=[request.stroke_color] * len(lines),
                    stroke_widths=[request.stroke_width] * len(lines)
                ):
                    if chunk and isinstance(chunk, Dict):
                        try:
                            json_data = json.dumps(chunk)
                            if json_data.strip():
                                yield f"data: {json_data}\n\n"
                        except (TypeError, ValueError) as json_err:
                            logger.error(f"JSON serialization error: {json_err}")
                            continue

            except Exception as e:
                error_msg = f"Error generating handwriting: {str(e)}"
                logger.error(error_msg)
                logger.error(traceback.format_exc())
                error_data = json.dumps({"type": "error", "message": error_msg})
                yield f"data: {error_data}\n\n"
            finally:
                done_data = json.dumps({"type": "done"})
                yield f"data: {done_data}\n\n"

        return StreamingResponse(
            generate_streamed_response(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no"
            }
        )
        
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        logger.error(f"Internal Server Error: {e}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail="Internal server error.")
