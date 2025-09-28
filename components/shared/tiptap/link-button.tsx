"use client"

import { useCallback, useState } from "react"
import { Editor } from "@tiptap/react"
import { LinkIcon } from "lucide-react"
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface LinkButtonProps {
    editor: Editor
}

export function LinkButton({ editor }: LinkButtonProps) {
    const [open, setOpen] = useState(false)
    const [url, setUrl] = useState("")

    const applyLink = useCallback(() => {
        const previousUrl = editor.getAttributes('link').href
        const url = window.prompt('URL', previousUrl)

        // cancelled
        if (url === null) {
            return
        }

        // empty
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run()

            return
        }

        // update link
        try {
            editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
        } catch (e) {
            alert("Invalid URL")
        }
    }, [editor])


    const removeLink = () => {
        editor.chain().focus().unsetLink().run()
        setOpen(false)
        setUrl("")
    }

    if (!editor) return null

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    // className={editor.isActive("link") ? "bg-secondary text-white" : ""}
                    onClick={() => {
                        editor.chain().focus().setLink({ href: url }).run()
                    }}
                >
                    <LinkIcon className="w-4 h-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="w-[300px]">
                <DialogHeader>
                    <DialogTitle>Insert Link</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <Input
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://example.com"
                        type="url"
                    />
                    <DialogFooter className="flex gap-2">
                        <Button onClick={applyLink}>Apply</Button>
                        <Button variant="outline" onClick={removeLink}>
                            Remove
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    )
}
