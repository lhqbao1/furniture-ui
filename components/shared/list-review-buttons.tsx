'use client'
import { useEffect, useRef } from 'react'
import { Heart, Expand, ShoppingCart } from 'lucide-react'
import gsap from 'gsap'

const IconList = () => {
    const containersRef = useRef<HTMLDivElement[]>([])

    useEffect(() => {
        containersRef.current.forEach(container => {
            const text = container.querySelector<HTMLParagraphElement>('p')
            if (!text) return

            // set initial state
            gsap.set(text, { display: 'none', x: -30, opacity: 0 })

            container.addEventListener('mouseenter', () => {
                gsap.to(text, { display: 'block', x: 0, opacity: 1, duration: 0.3, ease: '' })
                // gsap.to(container, { width: 'auto', duration: 0.5, ease: 'power2.out' })

            })

            container.addEventListener('mouseleave', () => {
                gsap.to(text, { display: 'none', x: -30, opacity: 0, duration: 0.3, ease: '', onComplete: () => { gsap.set(text, { display: 'none' }); } })
            })
        })
    }, [])

    const items = [
        { label: 'Wish List', Icon: Heart },
        { label: 'Review', Icon: Expand },
        { label: 'Add to cart', Icon: ShoppingCart },
    ]

    return (
        <div className='flex flex-col gap-2 items-end'>
            {items.map((item, idx) => (
                <div
                    key={idx}
                    ref={el => { if (el) containersRef.current[idx] = el }}
                    className="icon-container flex flex-row gap-2 items-center cursor-pointer bg-orange-400/85 px-4 py-2 rounded-tl-full rounded-bl-full"
                >
                    <p className="text-white text-xs font-medium">{item.label}</p>
                    <item.Icon className="text-white" size={16} />
                </div>
            ))}
        </div>
    )
}

export default IconList
