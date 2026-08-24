export type ChecklistItem = {
  phrase: string
  required: boolean
}

export type RequiredStatus = "Found" | "Missing"
export type OptionalStatus = "Found" | "Not present (optional)"
export type CheckStatus = RequiredStatus | OptionalStatus

export type CheckResultItem = {
  phrase: string
  required: boolean
  found: boolean
  status: CheckStatus
}

export type CheckReport = {
  passed: boolean
  overallMessage: string
  required: CheckResultItem[]
  optional: CheckResultItem[]
}

export type DocumentKind = "pdf" | "docx"

export type FileProcessingCode =
  | "UNSUPPORTED_TYPE"
  | "EMPTY_FILE"
  | "FILE_TOO_LARGE"
  | "NO_EXTRACTABLE_TEXT"
  | "CORRUPTED_FILE"
  | "PARSE_FAILURE"
  | "UNEXPECTED_ERROR"
