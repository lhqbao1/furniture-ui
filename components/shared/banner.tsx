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
    const t = useTranslations()

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
        <>
            <PageHeader />
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

                {/* <div className='home-banner__content h-full flex flex-col relative z-10'>
                    {
                        isPhone || height ? '' :
                            <div className="flex-1 flex flex-col justify-center items-center gap-6 xl:mt-12 mt-0 xl:px-0 px-4">
                                <h1 className="home-banner__title font-bold leading-tight flex xl:flex-row flex-col justify-center items-center xl:gap-4 gap-1">
                                    <span className="text-secondary text-4xl lg:text-6xl font-libre font-semibold uppercase">
                                        {t('welcomeTo')}
                                    </span>
                                    <span className="text-primary text-4xl lg:text-6xl font-libre font-semibold uppercase">
                                        PRESTIGE HOME
                                    </span>
                                </h1>
                                <span className='text-white xl:text-3xl text-xl text-center font-medium uppercase'>{t('slogan')}</span>
                            </div>
                    }
                </div> */}
            </div>
        </>
    )
}

export default Banner