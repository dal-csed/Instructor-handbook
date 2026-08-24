import { normalizeText } from "./normalize"
import type { ChecklistItem, CheckResultItem } from "./types"

export function matchSections(
  extractedText: string,
  checklist: ChecklistItem[],
): CheckResultItem[] {
  const normalizedSyllabus = normalizeText(extractedText)

  return checklist.map((item) => {
    const found = normalizedSyllabus.includes(normalizeText(item.phrase))

    if (item.required) {
      return {
        phrase: item.phrase,
        required: true,
        found,
        status: found ? "Found" : "Missing",
      }
    }

    return {
      phrase: item.phrase,
      required: false,
      found,
      status: found ? "Found" : "Not present (optional)",
    }
  })
}
