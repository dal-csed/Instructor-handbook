import { type NextRequest, NextResponse } from "next/server"
import { checkSyllabusFile } from "@/lib/syllabus-checker/check"
import { FileProcessingError } from "@/lib/syllabus-checker/errors"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file")

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          error: "Please choose a PDF or DOCX syllabus to check.",
          code: "UNSUPPORTED_TYPE",
        },
        { status: 400 },
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const report = await checkSyllabusFile({
      fileName: file.name,
      mimeType: file.type,
      buffer,
    })

    return NextResponse.json(report)
  } catch (error) {
    if (error instanceof FileProcessingError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status },
      )
    }

    console.error("Syllabus checker error:", error)
    return NextResponse.json(
      {
        error:
          "An unexpected error occurred while checking the syllabus. Please try again.",
        code: "UNEXPECTED_ERROR",
      },
      { status: 500 },
    )
  }
}
