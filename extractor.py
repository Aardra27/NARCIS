from pathlib import Path
import fitz
from docx import Document


# ==================================================
# NARCIS DOCUMENT EXTRACTOR
# ==================================================
#
# Purpose:
# Extract raw text from a single investigation document.
#
# Supported Formats:
# - PDF
# - DOCX
# - TXT
#
# Returns:
# text, page_count
#
# This module DOES NOT:
# - save files
# - ask for user input
# - generate JSON
# - perform AI extraction
#
# ==================================================


# --------------------------------------------------
# PDF Extraction
# --------------------------------------------------

def extract_pdf(pdf_path):

    document = fitz.open(pdf_path)

    text = ""

    for page in document:

        text += page.get_text()

    pages = len(document)

    document.close()

    return text, pages


# --------------------------------------------------
# DOCX Extraction
# --------------------------------------------------

def extract_docx(docx_path):

    document = Document(docx_path)

    text = "\n".join(

        paragraph.text

        for paragraph in document.paragraphs

    )

    return text, len(document.paragraphs)


# --------------------------------------------------
# TXT Extraction
# --------------------------------------------------

def extract_txt(txt_path):

    with open(
        txt_path,
        "r",
        encoding="utf-8"
    ) as file:

        text = file.read()

    return text, 1


# --------------------------------------------------
# Universal Extractor
# --------------------------------------------------

def extract_text(file_path):

    file_path = Path(file_path)

    if not file_path.exists():

        raise FileNotFoundError(

            f"File not found:\n{file_path}"

        )

    extension = file_path.suffix.lower()

    if extension == ".pdf":

        return extract_pdf(file_path)

    elif extension == ".docx":

        return extract_docx(file_path)

    elif extension == ".txt":

        return extract_txt(file_path)

    else:

        raise ValueError(

            f"Unsupported file type: {extension}"

        )


# --------------------------------------------------
# Test Only
# --------------------------------------------------

if __name__ == "__main__":

    SAMPLE_FILE = Path(__file__).resolve().parent.parent / "documents" / "ncb_annual_report_2023.pdf"

    if SAMPLE_FILE.exists():

        text, pages = extract_text(SAMPLE_FILE)

        print("\n" + "=" * 60)
        print("EXTRACTOR TEST")
        print("=" * 60)

        print(f"Pages      : {pages}")
        print(f"Characters : {len(text):,}")

        print("\nFirst 500 Characters:\n")

        print(text[:500])

    else:

        print("Sample file not found.")
