'use client'
import React, { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { useMediaQuery } from 'react-responsive'
import { useTranslations } from 'next-intl'
import PageHeader from './header'

interface BannerProps {
    height?: number
}

const Banner = ({ height }: BannerProps) => {
    const isPhone = useMediaQuery({ maxWidth: 650 })
    const [isSticky, setIsSticky] = useState(false);

    // Xử lý scroll
    useEffect(() => {
        const handleScroll = () => {
            const bannerHeight = 400; // chiều cao banner (px)
            if (window.scrollY >= bannerHeight) {
                setIsSticky(true);
            } else {
                setIsSticky(false);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div
            className={cn(
                "relative w-full flex-shrink-0",
                !height ? `h-[200px] lg:h-[400px]` : `lg:h-[${height}px]`,
                isPhone ? "mb-0 h-0" : ""
            )}
            style={isPhone ? { height: 0 } : { height }}
        >
            {!isPhone ?
                <Image
                    src="/banner1.jpeg"
                    alt="Banner"
                    fill
                    className={`object-cover ${isPhone && 'mt-16'}`}
                    priority
                />
                : ''}
        </div>
    )
}

export default Banner