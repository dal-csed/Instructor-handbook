import mammoth from "mammoth"
import { PDFParse } from "pdf-parse"
import { FileProcessingError } from "./errors"
import type { DocumentKind } from "./types"

async function extractPdfText(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: new Uint8Array(buffer) })
  try {
    const result = await parser.getText()
    return result.text ?? ""
  } finally {
    await parser.destroy()
  }
}

async function extractDocxText(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer })
  return result.value ?? ""
}

export async function extractPlainText(
  kind: DocumentKind,
  buffer: Buffer,
): Promise<string> {
  try {
    const text = kind === "pdf" ? await extractPdfText(buffer) : await extractDocxText(buffer)

    if (!text.replace(/\s+/g, "").length) {
      throw new FileProcessingError(
        "No extractable text was found in this file. Scanned images or empty documents cannot be checked.",
        "NO_EXTRACTABLE_TEXT",
      )
    }

    return text
  } catch (error) {
    if (error instanceof FileProcessingError) {
      throw error
    }

    throw new FileProcessingError(
      "We could not parse this file. It may be corrupted or in an unexpected format.",
      "PARSE_FAILURE",
    )
  }
}
