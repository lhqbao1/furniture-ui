"use client"

import { Editor } from "@tinymce/tinymce-react"
import { useState } from "react"

export default function RichTextEditor({ value, onChange }: { value: string, onChange: (val: string) => void }) {
    const [content, setContent] = useState(value)

    return (
        <Editor
            apiKey={process.env.NEXT_PUBLIC_TINY_API_KEY}
            init={{
                height: 400,
                menubar: true,
                plugins: [
                    "advlist autolink lists link image charmap preview anchor",
                    "searchreplace visualblocks code fullscreen",
                    "insertdatetime media table code help wordcount"
                ],
                toolbar:
                    "undo redo | formatselect | bold italic underline forecolor backcolor | " +
                    "alignleft aligncenter alignright alignjustify | " +
                    "bullist numlist outdent indent | removeformat | help | fullscreen | code",
                // skin: "light",        // đổi sang theme dark
                // content_css: "light",       // theme cho nội dung bên trong
            }}
            onEditorChange={(newValue) => {
                setContent(newValue)
                onChange(newValue)
            }}
        />

    )
}
