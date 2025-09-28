"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { LinkIcon, Unlink } from "lucide-react"
import { useState } from "react"
import type { Editor } from "@tiptap/react"

export default function LinkControls({ editor }: { editor: Editor }) {
    const [open, setOpen] = useState(false)
    const [url, setUrl] = useState("")

    const handleOpen = () => {
        const previousUrl = editor.getAttributes("link").href
        setUrl(previousUrl || "")
        setOpen(true)
    }

    const handleSetLink = () => {
        if (url === "") {
            editor.chain().focus().extendMarkRange("link").unsetLink().run()
        } else {
            editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
        }
        setOpen(false)
    }

    const handleUnsetLink = () => {
        editor.chain().focus().extendMarkRange("link").unsetLink().run()
        setUrl("")
        setOpen(false)
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant={editor.isActive("link") ? "secondary" : "outline"}
                    size="icon"
                    onClick={handleOpen}
                    title="Edit Link"
                >
                    <LinkIcon className="w-4 h-4" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 space-y-2">
                <Input
                    placeholder="https://example.com"
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                />
                <div className="flex justify-start gap-2">
                    <Button variant="outline" size="sm" onClick={handleSetLink}>
                        Apply
                    </Button>
                    <Button variant="destructive" size="sm" onClick={handleUnsetLink}>
                        Remove Link
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    )
}
