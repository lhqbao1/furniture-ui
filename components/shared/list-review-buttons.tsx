'use client'
import { useEffect, useRef } from 'react'
import { Heart, Expand, ShoppingCart } from 'lucide-react'
import gsap from 'gsap'

const IconList = () => {
    const containersRef = useRef<HTMLDivElement[]>([])

    useEffect(() => {
        containersRef.current.forEach(container => {
            if (!container) return

            // 1. Read original width BEFORE setting it with GSAP
            const originalWidth = container.scrollWidth

            // 2. Set initial width with GSAP
            gsap.set(container, { width: 40 })

            // 3. Set icon/text positions
            const icon = container.querySelector<SVGSVGElement>('.button-icon')
            const textElements = container.querySelectorAll<HTMLElement>('.button-name')
            if (!icon || textElements.length === 0) return

            gsap.set(icon, { position: 'absolute', right: '10px' })
            textElements.forEach(t => gsap.set(t, { position: 'absolute', right: '55px' }))

            // 4. Create timeline to expand to original width
            const tl = gsap.timeline({ paused: true })
            tl.to(container, { width: 140, duration: 0.6, paddingRight: 20, ease: 'power2.out' })
                .fromTo(textElements, { x: 100, opacity: 0 }, { x: 0, opacity: 1, duration: 0.6, ease: 'power2.out' }, '<')

            container.addEventListener('mouseenter', () => tl.play())
            container.addEventListener('mouseleave', () => tl.reverse())
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
                    className="relative icon-container box-border flex flex-row gap-2 items-center justify-end cursor-pointer bg-primary/80 px-6 py-4 rounded-tl-full rounded-bl-full overflow-hidden"
                >
                    <p className="text-white text-xs font-medium whitespace-nowrap button-name">{item.label}</p>
                    <item.Icon className="text-white button-icon" size={18} />
                </div>
            ))}
        </div>

    )
}

export default IconList
