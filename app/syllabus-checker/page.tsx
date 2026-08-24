"use client"

import { useRef, useState } from "react"
import { CheckCircle2, CircleAlert, FileUp, Loader2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ACCEPT_ATTRIBUTE,
  MAX_FILE_SIZE_BYTES,
  MAX_FILE_SIZE_LABEL,
} from "@/lib/syllabus-checker/constants"
import { isAcceptedClientFile } from "@/lib/syllabus-checker/client-file"
import type { CheckReport } from "@/lib/syllabus-checker/types"
import { cn } from "@/lib/utils"

function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function SyllabusCheckerPage() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [report, setReport] = useState<CheckReport | null>(null)

  const resetResults = () => {
    setError(null)
    setReport(null)
  }

  const assignFile = (file: File | undefined) => {
    resetResults()

    if (!file) {
      setSelectedFile(null)
      return
    }

    if (!isAcceptedClientFile(file)) {
      setSelectedFile(null)
      setError("Unsupported file type. Please upload a PDF or DOCX file.")
      return
    }

    if (file.size === 0) {
      setSelectedFile(null)
      setError("The uploaded file is empty. Please choose a syllabus PDF or DOCX with content.")
      return
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setSelectedFile(null)
      setError(`The file is too large. Please upload a file smaller than ${MAX_FILE_SIZE_LABEL}.`)
      return
    }

    setSelectedFile(file)
  }

  const handleCheck = async () => {
    if (!selectedFile) {
      setError("Please choose a PDF or DOCX syllabus to check.")
      return
    }

    setIsProcessing(true)
    resetResults()

    try {
      const formData = new FormData()
      formData.append("file", selectedFile)

      const response = await fetch("/api/syllabus-check", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "An unexpected error occurred while checking the syllabus.")
        return
      }

      setReport(data as CheckReport)
    } catch {
      setError("An unexpected error occurred while checking the syllabus. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <main className="max-w-7xl px-3 py-6 m-auto bg-gradient-to-br from-background to-secondary/10">
      <div className="max-w-4xl pb-14">
        <div className="space-y-2 mb-4">
          <h1 className="text-2xl font-bold text-[#474646]">Syllabus Checker</h1>
          <p className="text-muted-foreground text-pretty">
            Upload a syllabus PDF or DOCX to check whether required sections are present.
            Optional sections are reported but do not cause a fail.
          </p>
        </div>

        <div className="space-y-6">
          <Card className="border-border shadow-sm">
            <CardContent className="py-4">
              <p className="text-sm text-muted-foreground">
                To view the sample syllabus template, visit{" "}
                <a
                  href="https://dal.brightspace.com/d2l/le/content/104289/viewContent/5535154/View"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-[#474646] underline underline-offset-4 hover:text-foreground"
                >
                  Sample Syllabus Template
                </a>
                .
              </p>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-foreground">Upload syllabus</CardTitle>
              <CardDescription>
                Accepted file types: PDF, DOCX. Maximum size: {MAX_FILE_SIZE_LABEL}.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <input
                ref={inputRef}
                type="file"
                accept={ACCEPT_ATTRIBUTE}
                className="sr-only"
                onChange={(event) => assignFile(event.target.files?.[0])}
              />

              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                onDragOver={(event) => {
                  event.preventDefault()
                  setIsDragging(true)
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(event) => {
                  event.preventDefault()
                  setIsDragging(false)
                  assignFile(event.dataTransfer.files[0])
                }}
                className={cn(
                  "w-full rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors",
                  isDragging
                    ? "border-[#242424] bg-muted/70"
                    : "border-border hover:bg-muted/40",
                )}
              >
                <FileUp className="mx-auto mb-3 h-8 w-8 text-[#474646]" />
                <p className="font-medium text-[#474646]">
                  Drag and drop your syllabus here, or click to browse
                </p>
                <p className="mt-1 text-sm text-muted-foreground">PDF or DOCX only</p>
              </button>

              {selectedFile && (
                <p className="text-sm text-[#474646]">
                  Selected file: <span className="font-medium">{selectedFile.name}</span>{" "}
                  <span className="text-muted-foreground">
                    ({formatFileSize(selectedFile.size)})
                  </span>
                </p>
              )}

              <Button
                onClick={handleCheck}
                disabled={isProcessing || !selectedFile}
                size="lg"
                className="w-full"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Checking syllabus...
                  </>
                ) : (
                  "Check syllabus"
                )}
              </Button>

              {error && (
                <div
                  role="alert"
                  className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
                >
                  {error}
                </div>
              )}
            </CardContent>
          </Card>

          {report && (
            <Card className="border-border shadow-sm">
              <CardHeader>
                <CardTitle className="text-foreground">Results</CardTitle>
                <CardDescription>
                  Required sections determine the overall result. Optional sections are informational only.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div
                  className={cn(
                    "rounded-md border px-4 py-3 font-semibold",
                    report.passed
                      ? "border-green-200 bg-green-50 text-green-800"
                      : "border-destructive/30 bg-destructive/10 text-destructive",
                  )}
                >
                  {report.overallMessage}
                </div>

                <div className="space-y-3">
                  <h2 className="text-lg font-semibold text-[#474646]">Required</h2>
                  <ul className="space-y-2">
                    {report.required.map((item) => (
                      <li
                        key={item.phrase}
                        className={cn(
                          "flex items-center justify-between rounded-md border px-3 py-2 text-sm",
                          item.found
                            ? "border-green-200 bg-green-50"
                            : "border-destructive/30 bg-destructive/10",
                        )}
                      >
                        <span className="font-medium text-[#474646]">{item.phrase}</span>
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 font-semibold",
                            item.found ? "text-green-800" : "text-destructive",
                          )}
                        >
                          {item.found ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            <XCircle className="h-4 w-4" />
                          )}
                          {item.status}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-3">
                  <h2 className="text-lg font-semibold text-[#474646]">Optional / Conditional</h2>
                  <ul className="space-y-2">
                    {report.optional.map((item) => (
                      <li
                        key={item.phrase}
                        className={cn(
                          "flex items-center justify-between rounded-md border px-3 py-2 text-sm",
                          item.found
                            ? "border-green-200 bg-green-50"
                            : "border-border bg-muted/40",
                        )}
                      >
                        <span className="font-medium text-[#474646]">{item.phrase}</span>
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 font-semibold",
                            item.found ? "text-green-800" : "text-muted-foreground",
                          )}
                        >
                          {item.found ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            <CircleAlert className="h-4 w-4" />
                          )}
                          {item.status}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </main>
  )
}
