import checklist from "./checklist.json"
import { extractPlainText } from "./extract"
import { detectDocumentKind, validateFileSize } from "./file-type"
import { matchSections } from "./match"
import { buildReport } from "./results"
import type { ChecklistItem, CheckReport } from "./types"

const SYLLABUS_CHECKLIST = checklist as ChecklistItem[]

export async function checkSyllabusFile(input: {
  fileName: string
  mimeType: string
  buffer: Buffer
}): Promise<CheckReport> {
  validateFileSize(input.buffer.length)
  const kind = detectDocumentKind(input.fileName, input.mimeType, input.buffer)
  const text = await extractPlainText(kind, input.buffer)
  const matches = matchSections(text, SYLLABUS_CHECKLIST)
  return buildReport(matches)
}
