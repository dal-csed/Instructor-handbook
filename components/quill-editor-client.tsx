"use client"

import { useEffect, useRef } from "react"

interface QuillEditorClientProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function QuillEditorClient({ value, onChange, placeholder }: QuillEditorClientProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const quillRef = useRef<any>(null)
  const isUpdatingRef = useRef(false)
  const onChangeRef = useRef(onChange)

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  useEffect(() => {
    if (!containerRef.current) return

    // Clear the container to prevent double initialization issues (double toolbars)
    containerRef.current.innerHTML = ""

    // Create a dedicated element for the editor
    const editorElement = document.createElement("div")
    containerRef.current.appendChild(editorElement)

    let isCancelled = false

    const initQuill = async () => {
      const Quill = (await import("quill")).default

      if (isCancelled || !editorElement.isConnected) return

      // Add CSS if not present, using ID to prevent duplicates
      if (!document.getElementById("quill-snow-css")) {
        const link = document.createElement("link")
        link.id = "quill-snow-css"
        link.rel = "stylesheet"
        link.href = "https://cdn.jsdelivr.net/npm/quill@2.0.3/dist/quill.snow.css"
        document.head.appendChild(link)
      }

      const quill = new Quill(editorElement, {
        theme: "snow",
        placeholder: placeholder || "Enter text...",
        modules: {
          toolbar: [
            [{ header: [1, 2, 3, false] }],
            ["bold", "italic", "underline"],
            [{ list: "ordered" }, { list: "bullet" }],
            ["link"],
            ["clean"],
          ],
        },
      })

      if (value) {
        quill.root.innerHTML = value
      }

      quill.on("text-change", () => {
        if (!isUpdatingRef.current) {
          onChangeRef.current(quill.root.innerHTML)
        }
      })

      quillRef.current = quill
    }

    initQuill()

    return () => {
      isCancelled = true
      if (quillRef.current) {
        quillRef.current.off("text-change")
        quillRef.current = null
      }
      if (containerRef.current) {
        containerRef.current.innerHTML = ""
      }
    }
  }, [placeholder])

  useEffect(() => {
    if (quillRef.current && value !== quillRef.current.root.innerHTML) {
      isUpdatingRef.current = true
      quillRef.current.root.innerHTML = value || ""
      isUpdatingRef.current = false
    }
  }, [value])

  return <div ref={containerRef} className="min-h-[150px] [&_.ql-editor]:min-h-[300px]" />
}
