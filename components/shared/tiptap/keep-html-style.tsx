import { Extension } from "@tiptap/core"
import { Plugin } from "prosemirror-state"
import { DOMParser as ProseMirrorDOMParser } from "prosemirror-model"

export const KeepHtmlPaste = Extension.create({
    name: "keepHtmlPaste",

    addProseMirrorPlugins() {
        return [
            new Plugin({
                props: {
                    handlePaste: (view, event) => {
                        const html = event.clipboardData?.getData("text/html")
                        const text = event.clipboardData?.getData("text/plain")

                        if (html) {
                            const parser = new window.DOMParser()
                            const doc = parser.parseFromString(html, "text/html")

                            // ✅ Dùng ProseMirror DOMParser để parse HTML hợp lệ theo schema
                            const parsed = ProseMirrorDOMParser.fromSchema(view.state.schema).parse(doc.body)

                            const tr = view.state.tr.replaceSelectionWith(parsed)
                            view.dispatch(tr)
                            return true
                        }

                        if (text) {
                            view.dispatch(view.state.tr.insertText(text))
                            return true
                        }

                        return false
                    },
                },
            }),
        ]
    },
})
