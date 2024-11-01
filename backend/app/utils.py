import logging
from fastapi import HTTPException
from typing import List

logger = logging.getLogger(__name__)

VALID_CHARACTERS = {
    'T', 'Y', '\x00', '(', '-', 'L', 'e', 'B', 'j', 'x', 'y', '6', 'v', ' ', '"', 'g', 'l', 'p', 'z', 'c', '0',
    '7', 'P', ':', 'o', 'I', '1', 'E', 'G', 'C', 'h', '#', 'F', 'W', 'N', '5', 'a', 'O', '9', 'H', '!', ')', 'J',
    's', '4', ';', 'D', 'U', "'", ',', '.', 'V', 'f', '8', 'q', '?', 'i', 'K', 'b', 'R', 'd', 'k', 'n', 'r', 'A',
    't', 'S', 'w', '2', 'M', '3', 'm', 'u'
}

def split_text_to_segments(text: str, segment_length: int = 75) -> List[str]:
    words = text.split()
    segments = []
    current_line = []
    current_length = 0

    for word in words:
        if current_length + len(word) + (1 if current_line else 0) > segment_length:
            segments.append(" ".join(current_line))
            current_line = []
            current_length = 0
        
        current_line.append(word)
        current_length += len(word) + (1 if current_line else 0)

    if current_line:
        segments.append(" ".join(current_line))
    
    return segments

def validate_characters(lines: List[str]):
    for line_num, line in enumerate(lines, start=1):
        invalid_chars = [char for char in line if char not in VALID_CHARACTERS]
        if invalid_chars:
            logger.warning(f"Invalid character(s) {invalid_chars} detected in line {line_num}.")
            raise HTTPException(
                status_code=400,
                detail=f"Invalid character(s) {invalid_chars} detected in line {line_num}. "
                       f"Valid character set is {VALID_CHARACTERS}"
            )
