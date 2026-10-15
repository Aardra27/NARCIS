from pathlib import Path
import fitz
from docx import Document


# --------------------------------------------------
# Project Paths
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent.parent

DOCUMENTS_DIR = BASE_DIR / "documents"

DOCUMENTS_DIR.mkdir(exist_ok=True)

OUTPUT_FILE = DOCUMENTS_DIR / "extracted_report.txt"


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
# Detect File Type
# --------------------------------------------------

def extract_text(file_path):

    file_path = Path(file_path)

    if not file_path.exists():
        raise FileNotFoundError(
            f"\nFile not found:\n{file_path}"
        )

    suffix = file_path.suffix.lower()

    if suffix == ".pdf":
        return extract_pdf(file_path)

    elif suffix == ".docx":
        return extract_docx(file_path)

    elif suffix == ".txt":
        return extract_txt(file_path)

    else:
        raise ValueError(
            f"Unsupported file type: {suffix}"
        )


# --------------------------------------------------
# Save Extracted Text
# --------------------------------------------------

def save_text(text):

    OUTPUT_FILE.write_text(
        text,
        encoding="utf-8"
    )


# --------------------------------------------------
# Main
# --------------------------------------------------

if __name__ == "__main__":

    print("\n" + "=" * 60)
    print("NARCIS DOCUMENT EXTRACTOR")
    print("=" * 60)

    path = input("\nEnter file path: ").strip().strip('"')

    text, pages = extract_text(path)

    save_text(text)

    print("\n" + "=" * 60)
    print("TEXT EXTRACTION COMPLETED")
    print("=" * 60)

    print(f"Pages Extracted : {pages}")
    print(f"Characters      : {len(text):,}")
    print(f"Saved To        : {OUTPUT_FILE}")

    print("\nExtraction Successful.")
