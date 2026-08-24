import type { CheckReport, CheckResultItem } from "./types"

export function buildReport(items: CheckResultItem[]): CheckReport {
  const required = items.filter((item) => item.required)
  const optional = items.filter((item) => !item.required)
  const passed = required.every((item) => item.found)

  return {
    passed,
    overallMessage: passed
      ? "Syllabus passes all required checks"
      : "Syllabus is missing required sections",
    required,
    optional,
  }
}
