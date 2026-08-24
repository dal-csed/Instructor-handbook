import { ACCEPTED_EXTENSIONS, ACCEPTED_MIME_TYPES } from "./constants"

function getExtension(fileName: string): string {
  const lastDot = fileName.lastIndexOf(".")
  if (lastDot < 0) {
    return ""
  }
  return fileName.slice(lastDot).toLowerCase()
}

export function isAcceptedClientFile(file: Pick<File, "name" | "type">): boolean {
  const extension = getExtension(file.name)
  return (
    ACCEPTED_EXTENSIONS.includes(extension as (typeof ACCEPTED_EXTENSIONS)[number]) ||
    ACCEPTED_MIME_TYPES.includes(file.type as (typeof ACCEPTED_MIME_TYPES)[number])
  )
}

export { getExtension }
