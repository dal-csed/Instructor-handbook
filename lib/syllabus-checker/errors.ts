import type { FileProcessingCode } from "./types"

export class FileProcessingError extends Error {
  code: FileProcessingCode
  status: number

  constructor(message: string, code: FileProcessingCode, status = 400) {
    super(message)
    this.name = "FileProcessingError"
    this.code = code
    this.status = status
  }
}
