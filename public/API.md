# Penman API Documentation

## Overview
The Penman API provides endpoints for handwriting generation, SVG-to-PDF conversion, and handwriting streaming effects. This document details each endpoint, its functionality, input requirements, and response formats.

---

## Endpoints

### 1. `POST /handwriting/generate`
Generates handwriting in SVG or PDF format based on detailed input parameters for each line of text.

#### Request Body
```json
{
    "text_input": [
        "string", // Array of text lines to be rendered
    ],
    "styles": [
        1, // Array of style identifiers for corresponding text lines
    ],
    "biases": [
        0.89, // Array of legibility values (0 to 1) for corresponding text lines
    ],
    "stroke_widths": [
        1, // Array of stroke width values for corresponding text lines
    ],
    "stroke_colors": [
        "gray", // Array of colors for corresponding text lines
    ],
    "as_pdf": false // Boolean to specify output format (true for PDF, false for SVG)
}
```

#### Example Request
```json
{
    "text_input": [
        "The quick brown fox jumps over the lazy dog.",
        "Once upon a time in a land far, far away.",
        "She was looking kind of dumb with her finger and her thumb."
    ],
    "styles": [1, 5, 7],
    "biases": [0.89, 0.75, 0.9],
    "stroke_widths": [1, 2, 2],
    "stroke_colors": ["gray", "green", "orange"],
    "as_pdf": false
}
```

#### Response
Returns an SVG or PDF file as specified in the request.

---

### 2. `POST /handwriting/generate-simple`
Generates handwriting in SVG or PDF format for a single paragraph, using uniform styling and formatting.

#### Request Body
```json
{
    "text_input": "string", // Paragraph of text to render
    "style": 0, // Style identifier for the entire text
    "bias": 2, // Legibility value (0 to 1) for the entire text
    "stroke_width": 2, // Stroke width for the entire text
    "stroke_color": "#808080", // Color for the entire text
    "as_pdf": false // Boolean to specify output format (true for PDF, false for SVG)
}
```

#### Example Request
```json
{
    "text_input": "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    "style": 0,
    "bias": 2,
    "stroke_width": 2,
    "stroke_color": "#808080",
    "as_pdf": false
}
```

#### Response
Returns an SVG or PDF file as specified in the request.

---

### 3. `POST /handwriting/generate-stream`
Generates handwriting as SVG path data incrementally for a streaming handwriting effect using Server-Sent Events (SSE).

#### Request Body
```json
{
    "text_input": "string", // Text to render
    "style": 0, // Style identifier for the text
    "bias": 0.85, // Legibility value (0 to 1)
    "stroke_width": 1.5, // Stroke width for the text
    "stroke_color": "green" // Color for the text
}
```

#### Example Request
```json
{
    "text_input": "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    "style": 0,
    "bias": 0.85,
    "stroke_width": 1.5,
    "stroke_color": "green"
}
```

#### Response
Streams incremental SVG path data for creating a handwriting generation effect.

---

### 4. `POST /handwriting/svg-to-pdf`
Converts an input SVG file to a PDF format.

#### Request Body
- Form Data:
  - `file`: Upload the SVG file to be converted.

#### Response
Returns the converted PDF file.

---

## Notes
- Ensure all required fields are provided in the request body for successful API calls.
- The `/handwriting/generate-stream` endpoint uses Server-Sent Events; a client capable of handling SSE is necessary to receive incremental updates.
- All styling parameters must align with the specified text input, especially for `/handwriting/generate`.

