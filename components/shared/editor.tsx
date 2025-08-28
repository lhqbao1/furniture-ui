"use client"

import { Editor } from "@tinymce/tinymce-react"

export default function RichTextEditor({ value, onChange, content, setContent }: { value: string, onChange: (val: string) => void, content: string, setContent: (val: string) => void }) {
    return (
        <Editor
            apiKey={process.env.NEXT_PUBLIC_TINY_API_KEY}
            init={{
                height: 400,
                menubar: true,
                plugins: [
                    "advlist", "anchor", "autolink", "charmap", "code", "fullscreen",
                    "help", "image", "insertdatetime", "link", "lists", "media",
                    "preview", "searchreplace", "table", "visualblocks",
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
            value={value}
        />

    )
}
