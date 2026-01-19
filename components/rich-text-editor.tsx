"use client"
import dynamic from "next/dynamic"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

const QuillEditor = dynamic(() => import("./quill-editor-client"), { ssr: false })

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  return (
    <div className="border rounded-md" suppressHydrationWarning>
      <QuillEditor value={value} onChange={onChange} placeholder={placeholder} />
    </div>
  )
}
