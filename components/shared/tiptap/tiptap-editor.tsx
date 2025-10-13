"use client"
// import './styles.scss'
import {
    Bold,
    Italic,
    Strikethrough,
    Code,
    List,
    ListOrdered,
    Quote,
    Undo2,
    Redo2,
    Heading1,
    Heading2,
    Heading3,
    Heading4,
    Heading5,
    Heading6,
    Minus,
    CornerDownLeft,
    Trash2,
    Eraser,
} from "lucide-react"
import { TextStyleKit } from '@tiptap/extension-text-style'
import type { Editor } from '@tiptap/react'
import { EditorContent, useEditor, useEditorState } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import React, { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import Link from "@tiptap/extension-link"
import LinkControls from "./link-button"

const extensions = [
    TextStyleKit,
    StarterKit,
    Link.configure({
        openOnClick: false,
        autolink: false,
        defaultProtocol: "https",
    }).extend({
        renderHTML({ HTMLAttributes }) {
            return [
                "a",
                {
                    ...HTMLAttributes,
                    class: "underline text-secondary cursor-pointer",
                    onclick: "event.preventDefault()",
                    "data-link": HTMLAttributes.href,
                },
                0,
            ]
        },
    }),
]

export function MenuBar({ editor, showHtml, setShowHtml }: {
    editor: Editor, showHtml: boolean, setShowHtml: React.Dispatch<React.SetStateAction<boolean>>
}) {
    const editorState = useEditorState({
        editor,
        selector: ctx => ({
            isBold: ctx.editor.isActive("bold"),
            canBold: ctx.editor.can().chain().toggleBold().run(),
            isItalic: ctx.editor.isActive("italic"),
            canItalic: ctx.editor.can().chain().toggleItalic().run(),
            isStrike: ctx.editor.isActive("strike"),
            canStrike: ctx.editor.can().chain().toggleStrike().run(),
            isCode: ctx.editor.isActive("code"),
            canCode: ctx.editor.can().chain().toggleCode().run(),
            canClearMarks: ctx.editor.can().chain().unsetAllMarks().run(),
            isParagraph: ctx.editor.isActive("paragraph"),
            isHeading1: ctx.editor.isActive("heading", { level: 1 }),
            isHeading2: ctx.editor.isActive("heading", { level: 2 }),
            isHeading3: ctx.editor.isActive("heading", { level: 3 }),
            isHeading4: ctx.editor.isActive("heading", { level: 4 }),
            isHeading5: ctx.editor.isActive("heading", { level: 5 }),
            isHeading6: ctx.editor.isActive("heading", { level: 6 }),
            isBulletList: ctx.editor.isActive("bulletList"),
            isOrderedList: ctx.editor.isActive("orderedList"),
            isCodeBlock: ctx.editor.isActive("codeBlock"),
            isBlockquote: ctx.editor.isActive("blockquote"),
            canUndo: ctx.editor.can().chain().undo().run(),
            canRedo: ctx.editor.can().chain().redo().run(),
        }),
    })

    const iconButton = (
        onClick: () => void,
        Icon: React.ElementType,
        isActive?: boolean,
        disabled?: boolean,
        label?: string
    ) => (
        <Button
            type="button"
            variant={isActive ? "secondary" : "outline"}
            size="icon"
            onClick={onClick}
            disabled={disabled}
            title={label}
        >
            <Icon className="w-4 h-4" />
        </Button>
    )

    return (
        <div className="flex flex-wrap gap-2 border-b pb-3">
            {iconButton(() => editor.chain().focus().toggleBold().run(), Bold, editorState.isBold, !editorState.canBold, "Bold")}
            {iconButton(() => editor.chain().focus().toggleItalic().run(), Italic, editorState.isItalic, !editorState.canItalic, "Italic")}
            {iconButton(() => editor.chain().focus().toggleStrike().run(), Strikethrough, editorState.isStrike, !editorState.canStrike, "Strike")}
            {iconButton(() => editor.chain().focus().toggleCode().run(), Code, editorState.isCode, !editorState.canCode, "Inline Code")}
            {iconButton(() => editor.chain().focus().unsetAllMarks().run(), Eraser, false, !editorState.canClearMarks, "Clear Marks")}
            {iconButton(() => editor.chain().focus().clearNodes().run(), Trash2, false, false, "Clear Nodes")}

            {/* {iconButton(() => editor.chain().focus().setParagraph().run(), Paragraph, editorState.isParagraph, false, "Paragraph")} */}
            {iconButton(() => editor.chain().focus().toggleHeading({ level: 1 }).run(), Heading1, editorState.isHeading1, false, "Heading 1")}
            {iconButton(() => editor.chain().focus().toggleHeading({ level: 2 }).run(), Heading2, editorState.isHeading2, false, "Heading 2")}
            {iconButton(() => editor.chain().focus().toggleHeading({ level: 3 }).run(), Heading3, editorState.isHeading3, false, "Heading 3")}
            {iconButton(() => editor.chain().focus().toggleHeading({ level: 4 }).run(), Heading4, editorState.isHeading4, false, "Heading 4")}
            {iconButton(() => editor.chain().focus().toggleHeading({ level: 5 }).run(), Heading5, editorState.isHeading5, false, "Heading 5")}
            {iconButton(() => editor.chain().focus().toggleHeading({ level: 6 }).run(), Heading6, editorState.isHeading6, false, "Heading 6")}

            {iconButton(() => editor.chain().focus().toggleBulletList().run(), List, editorState.isBulletList, false, "Bullet List")}
            {iconButton(() => editor.chain().focus().toggleOrderedList().run(), ListOrdered, editorState.isOrderedList, false, "Ordered List")}
            {iconButton(() => editor.chain().focus().toggleCodeBlock().run(), Code, editorState.isCodeBlock, false, "Code Block")}
            {iconButton(() => editor.chain().focus().toggleBlockquote().run(), Quote, editorState.isBlockquote, false, "Blockquote")}

            {iconButton(() => editor.chain().focus().setHorizontalRule().run(), Minus, false, false, "Horizontal Rule")}
            {iconButton(() => editor.chain().focus().setHardBreak().run(), CornerDownLeft, false, false, "Hard Break")}

            {iconButton(() => editor.chain().focus().undo().run(), Undo2, false, !editorState.canUndo, "Undo")}
            {iconButton(() => editor.chain().focus().redo().run(), Redo2, false, !editorState.canRedo, "Redo")}
            <LinkControls editor={editor} />
            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowHtml(!showHtml)}
            >
                {showHtml ? 'Back to Editor' : 'View HTML'}
            </Button>
        </div>
    )
}

export default function RichEditor({ value, onChangeValue }: { value: string; onChangeValue: (val: string) => void }) {
    const [showHtml, setShowHtml] = useState(false)

    const editor = useEditor({
        extensions,
        content: value || "<p></p>",
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            const html = editor.getHTML()
            onChangeValue(html)
        },
    })

    // Đồng bộ từ props -> editor (chỉ khi value thay đổi từ bên ngoài)
    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            editor.commands.setContent(value, {
                emitUpdate: false,
            })
        }
    }, [value, editor])

    return (
        <div>
            <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500">
                    {showHtml ? 'HTML View' : 'Rich Text View'}
                </p>
            </div>
            {editor && <MenuBar editor={editor} showHtml={showHtml} setShowHtml={setShowHtml} />}
            {showHtml && editor ? (
                <textarea
                    className="w-full h-64 border rounded-md p-2 font-mono text-sm bg-gray-50"
                    value={editor.getHTML()}
                    onChange={(e) => {
                        const newValue = e.target.value
                        // ✅ Check editor trước khi gọi command
                        if (editor) {
                            editor.commands.setContent(newValue, { emitUpdate: false })
                            onChangeValue(newValue)
                        }
                    }}
                />
            ) : (
                <EditorContent
                    editor={editor}
                    className="prose prose-sm max-w-none p-4 border rounded-md min-h-[200px]
                [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-secondary [&_h2]:mt-6 [&_h2]:mb-3 [&_li]:list-disc [&_li]:pl-4
                [&_li]:ml-12 [&_a]:text-secondary [&_a]:underline
                "
                />
            )}

        </div>
    )
}