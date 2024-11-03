import asyncio
import os
import numpy as np
import logging
from handwriting.lyrics import all_star, downtown, give_up
from handwriting.generator import Hand
from handwriting.config import setup_logging, OUTPUT_DIR, LOG_DIR

setup_logging(log_file=f'{LOG_DIR}/inference_script_usage.log')

async def main():
    hand = Hand()

    os.makedirs(OUTPUT_DIR, exist_ok=True)

    lines = [
        "Now this is a story all about how",
        "My life got flipped turned upside down",
        "And I'd like to take a minute, just sit right there",
        "I'll tell you how I became the prince of a town called Bel-Air",
    ]
    biases = [.75 for _ in lines]
    styles = [9 for _ in lines]
    stroke_colors = ['red', 'green', 'black', 'blue']
    stroke_widths = [1, 2, 1, 2]
    
    svg_output_demo = await hand.write(
        lines=lines,
        biases=biases,
        styles=styles,
        stroke_colors=stroke_colors,
        stroke_widths=stroke_widths
    )

    with open(f'{OUTPUT_DIR}/usage_demo.svg', 'w') as f:
        f.write(svg_output_demo)
    logging.info("SVG for usage demo created and saved to 'output/usage_demo.svg'.")

    pdf_output_demo = await hand.write(
        lines=lines,
        biases=biases,
        styles=styles,
        stroke_colors=stroke_colors,
        stroke_widths=stroke_widths,
        as_pdf=True
    )

    with open(f'{OUTPUT_DIR}/usage_demo.pdf', 'wb') as f:
        f.write(pdf_output_demo.read())
    logging.info("PDF for usage demo created and saved to 'output/usage_demo.pdf'.")

    lines = all_star.split("\n")
    biases = [.75 for _ in lines]
    styles = [12 for _ in lines]

    svg_output_all_star = await hand.write(
        lines=lines,
        biases=biases,
        styles=styles,
    )

    with open(f'{OUTPUT_DIR}/all_star.svg', 'w') as f:
        f.write(svg_output_all_star)
    logging.info("SVG for 'All Star' created and saved to 'output/all_star.svg'.")

    pdf_output_all_star = await hand.write(
        lines=lines,
        biases=biases,
        styles=styles,
        as_pdf=True
    )

    with open(f'{OUTPUT_DIR}/all_star.pdf', 'wb') as f:
        f.write(pdf_output_all_star.read())
    logging.info("PDF for 'All Star' created and saved to 'output/all_star.pdf'.")

    lines = downtown.split("\n")
    biases = [.75 for _ in lines]
    styles = np.cumsum(np.array([len(i) for i in lines]) == 0).astype(int)

    svg_output_downtown = await hand.write(
        lines=lines,
        biases=biases,
        styles=styles,
    )

    with open(f'{OUTPUT_DIR}/downtown.svg', 'w') as f:
        f.write(svg_output_downtown)
    logging.info("SVG for 'Downtown' created and saved to 'output/downtown.svg'.")

    pdf_output_downtown = await hand.write(
        lines=lines,
        biases=biases,
        styles=styles,
        as_pdf=True
    )

    with open(f'{OUTPUT_DIR}/downtown.pdf', 'wb') as f:
        f.write(pdf_output_downtown.read())
    logging.info("PDF for 'Downtown' created and saved to 'output/downtown.pdf'.")

    lines = give_up.split("\n")
    biases = .2 * np.flip(np.cumsum([len(i) == 0 for i in lines]), 0)
    styles = [7 for _ in lines]

    svg_output_give_up = await hand.write(
        lines=lines,
        biases=biases,
        styles=styles,
    )

    with open(f'{OUTPUT_DIR}/give_up.svg', 'w') as f:
        f.write(svg_output_give_up)
    logging.info("SVG for 'Give Up' created and saved to 'output/give_up.svg'.")

    pdf_output_give_up = await hand.write(
        lines=lines,
        biases=biases,
        styles=styles,
        as_pdf=True
    )

    with open(f'{OUTPUT_DIR}/give_up.pdf', 'wb') as f:
        f.write(pdf_output_give_up.read())
    logging.info("PDF for 'Give Up' created and saved to 'output/give_up.pdf'.")

if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    try:
        loop.run_until_complete(main())
    finally:
        loop.close()
