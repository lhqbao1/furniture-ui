"use client"

import React, { useEffect, useState } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Link from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"
import { Table } from "@tiptap/extension-table"
import { TableRow } from "@tiptap/extension-table-row"
import { TableCell } from "@tiptap/extension-table-cell"
import { TableHeader } from "@tiptap/extension-table-header"
import { Bold, Italic, LinkIcon, ImageIcon, TableIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LinkButton } from "./link-button"
import { CustomLink } from "./custom-link"

interface RichEditorProps {
    value: string
    onChangeValue: (val: string) => void
}

export default function RichEditor({ value, onChangeValue }: RichEditorProps) {
    const [isBold, setIsBold] = useState(false)

    const editor = useEditor({
        extensions: [
            StarterKit,
            // CustomLink,
            Link.configure({
                openOnClick: false,
                autolink: true,
                defaultProtocol: 'https',
                protocols: ['http', 'https'],
                isAllowedUri: (url, ctx) => {
                    try {
                        // construct URL
                        const parsedUrl = url.includes(':') ? new URL(url) : new URL(`${ctx.defaultProtocol}://${url}`)

                        // use default validation
                        if (!ctx.defaultValidate(parsedUrl.href)) {
                            return false
                        }

                        // disallowed protocols
                        const disallowedProtocols = ['ftp', 'file', 'mailto']
                        const protocol = parsedUrl.protocol.replace(':', '')

                        if (disallowedProtocols.includes(protocol)) {
                            return false
                        }

                        // only allow protocols specified in ctx.protocols
                        const allowedProtocols = ctx.protocols.map(p => (typeof p === 'string' ? p : p.scheme))

                        if (!allowedProtocols.includes(protocol)) {
                            return false
                        }

                        // disallowed domains
                        const disallowedDomains = ['example-phishing.com', 'malicious-site.net']
                        const domain = parsedUrl.hostname

                        if (disallowedDomains.includes(domain)) {
                            return false
                        }

                        // all checks have passed
                        return true
                    } catch {
                        return false
                    }
                },
                shouldAutoLink: url => {
                    try {
                        // construct URL
                        const parsedUrl = url.includes(':') ? new URL(url) : new URL(`https://${url}`)

                        // only auto-link if the domain is not in the disallowed list
                        const disallowedDomains = ['example-no-autolink.com', 'another-no-autolink.com']
                        const domain = parsedUrl.hostname

                        return !disallowedDomains.includes(domain)
                    } catch {
                        return false
                    }
                },
            }),
            Image,
            Table.configure({
                resizable: true,
            }),
            TableRow,
            TableHeader,
            TableCell,
        ],
        content: value || "<p></p>",
        immediatelyRender: false,
    })

    // Sync external value -> editor
    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            editor.commands.setContent(value || "<p></p>", {
                emitUpdate: false,
                parseOptions: { preserveWhitespace: 'full' },
            })
        }
    }, [value, editor])
    // Sync editor -> external onChange
    useEffect(() => {
        if (!editor) return
        editor.on("update", () => {
            onChangeValue(editor.getHTML())
        })
        return () => {
            editor.off("update")
        }
    }, [editor, onChangeValue])


    if (!editor) return null

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-wrap gap-2 border-b pb-2">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                // className={isBold ? "bg-secondary text-white" : ""}
                >
                    <Bold className="w-4 h-4" />
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                // className={editor.isActive("italic") ? "bg-secondary" : ""}
                >
                    <Italic className="w-4 h-4" />
                </Button>

                <LinkButton editor={editor} />

                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                        editor.chain().focus().setImage({ src: "/example.png" }).run()
                    }
                >
                    <ImageIcon className="w-4 h-4" />
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                        editor
                            .chain()
                            .focus()
                            .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                            .run()
                    }
                >
                    <TableIcon className="w-4 h-4" />
                </Button>
            </div>

            {/* Editor */}
            <EditorContent
                editor={editor}
                className="prose prose-sm max-w-none p-4 border rounded-md min-h-[200px]"
            />
        </div>
    )
}
