import { Extension } from '@tiptap/core'

export const FixedFont = Extension.create({
    name: 'fixedFont',

    addGlobalAttributes() {
        return [
            {
                types: ['textStyle', 'paragraph', 'heading'],
                attributes: {
                    style: {
                        default: null,
                        parseHTML: element => element.getAttribute('style'),
                        renderHTML: attributes => {
                            // Giữ nguyên các style khác, chỉ đảm bảo font-family đúng
                            const style = attributes.style ? `${attributes.style}; font-family: 'Libre', serif;` : "font-family: 'Libre', serif;"
                            return { style }
                        },
                    },
                },
            },
        ]
    },
})
