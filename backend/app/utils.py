import logging
from fastapi import HTTPException
from typing import List

logger = logging.getLogger(__name__)

VALID_CHARACTERS = {
    '1', 'J', 'u', ':', 'l', 't', 'g', 'R', 'P', 'Y', 'v', 'j', 'A', '!', 'G', 'K', 'y', '3', 'V', 'C', 'W',
    'U', '7', 'c', '-', '"', 'N', '5', 'E', '(', 'I', 'L', 'r', '0', 'n', 'B', 'o', ')', 's', 'p',
    '8', '4', ' ', '2', 'f', ',', '6', 'q', 'w', 'k', 'i', 'T', '.', 'O', 'a', 'F', '#', 'M', 'H', 'd', 'D',
    'e', 'h', 'm', '9', 'S', "'", '?', 'z', 'x', 'b', ';',
    *[chr(i) for i in range(ord('a'), ord('z') + 1)],
    *[chr(i) for i in range(ord('A'), ord('Z') + 1)],
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
