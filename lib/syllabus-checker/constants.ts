export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024
export const MAX_FILE_SIZE_LABEL = "10 MB"

export const ACCEPTED_EXTENSIONS = [".pdf", ".docx"] as const

export const ACCEPTED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const

export const ACCEPT_ATTRIBUTE = ".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
