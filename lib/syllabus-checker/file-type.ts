import { MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_LABEL } from "./constants"
import { getExtension } from "./client-file"
import { FileProcessingError } from "./errors"
import type { DocumentKind } from "./types"

function hasPdfMagic(buffer: Buffer): boolean {
  return buffer.length >= 4 && buffer.subarray(0, 4).toString("latin1") === "%PDF"
}

function hasZipMagic(buffer: Buffer): boolean {
  return buffer.length >= 2 && buffer.subarray(0, 2).toString("latin1") === "PK"
}

export function detectDocumentKind(
  fileName: string,
  mimeType: string,
  buffer: Buffer,
): DocumentKind {
  const extension = getExtension(fileName)
  const claimedPdf =
    extension === ".pdf" || mimeType === "application/pdf"
  const claimedDocx =
    extension === ".docx" ||
    mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"

  if (claimedPdf) {
    if (buffer.length > 0 && !hasPdfMagic(buffer)) {
      throw new FileProcessingError(
        "This PDF could not be read. The file may be corrupted.",
        "CORRUPTED_FILE",
      )
    }
    return "pdf"
  }

  if (claimedDocx) {
    if (buffer.length > 0 && !hasZipMagic(buffer)) {
      throw new FileProcessingError(
        "This DOCX could not be read. The file may be corrupted.",
        "CORRUPTED_FILE",
      )
    }
    return "docx"
  }

  throw new FileProcessingError(
    "Unsupported file type. Please upload a PDF or DOCX file.",
    "UNSUPPORTED_TYPE",
  )
}

export function validateFileSize(byteLength: number): void {
  if (byteLength === 0) {
    throw new FileProcessingError(
      "The uploaded file is empty. Please choose a syllabus PDF or DOCX with content.",
      "EMPTY_FILE",
    )
  }

  if (byteLength > MAX_FILE_SIZE_BYTES) {
    throw new FileProcessingError(
      `The file is too large. Please upload a file smaller than ${MAX_FILE_SIZE_LABEL}.`,
      "FILE_TOO_LARGE",
    )
  }
}
