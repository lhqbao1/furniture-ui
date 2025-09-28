import Link from "@tiptap/extension-link"

export const CustomLink = Link.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            href: {
                default: null,
            },
            target: {
                default: "_blank",
            },
            rel: {
                default: "noopener noreferrer",
            },
            title: {
                default: null,
                parseHTML: element => element.getAttribute("title"),
                renderHTML: attributes => {
                    if (!attributes.title) return {}
                    return { title: attributes.title }
                },
            },
        }
    },
}).configure({
    HTMLAttributes: {
        class: "text-secondary underline cursor-pointer hover:opacity-80",
    },
})
