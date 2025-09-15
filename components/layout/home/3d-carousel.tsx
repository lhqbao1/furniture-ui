'use client'
import { Button } from "@/components/ui/button";
import { homeBannerItems } from "@/data/data";
import { useGetCategories } from "@/features/category/hook";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { useMediaQuery } from "react-responsive";
import AnimatedCarouselSkeleton from "./3d-carousel-skeleton";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

const TAU = Math.PI * 2;

function normalizeAngle(a: number) {
    a = ((a + Math.PI) % TAU + TAU) % TAU - Math.PI;
    return a;
}

const AnimatedCarousel = () => {
    const [rotation, setRotation] = useState(Math.PI / 2);
    const [targetRotation, setTargetRotation] = useState(rotation);
    const rotationRef = useRef(rotation);
    const titleRef = useRef<HTMLSpanElement | null>(null);
    const { data: categories, isLoading, isError } = useGetCategories()
    const router = useRouter()
    // Responsive breakpoints
    const isMobile = useMediaQuery({ maxWidth: 650 }); // iPhone 12 Pro và nhỏ hơn
    const isTablet = useMediaQuery({ minWidth: 651, maxWidth: 950 });
    const t = useTranslations()


    // Các thông số carousel thay đổi theo kích thước màn hình
    const radius = isMobile ? 350 : isTablet ? 500 : 600;
    const verticalRadius = isMobile ? 130 : isTablet ? 180 : 220;
    const zOffset = isMobile ? -1500 : isTablet ? -600 : -700;
    const cardSize = isMobile
        ? { w: 180, h: 200 }
        : isTablet
            ? { w: 260, h: 340 }
            : { w: 295, h: 380 };

    const angleStep = TAU / homeBannerItems.length;

    useEffect(() => {
        rotationRef.current = rotation;
    }, [rotation]);

    const animateTo = (to: number, duration = 700) => {
        const from = rotationRef.current;
        const delta = normalizeAngle(to - from);
        const start = performance.now();

        const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

        const step = (now: number) => {
            const t = Math.min(1, (now - start) / duration);
            const eased = easeOutCubic(t);
            setRotation(from + delta * eased);
            if (t < 1) requestAnimationFrame(step);
            else setRotation(from + delta);
        };

        requestAnimationFrame(step);
    };

    const handleClick = (index: number, name: string) => {

        const front = Math.PI / 2;
        const desired = front - index * angleStep;
        const current = rotationRef.current;
        const delta = normalizeAngle(desired - current);
        const finalTarget = current + delta;
        setTargetRotation(finalTarget);
    };

    useEffect(() => {
        if (targetRotation !== rotationRef.current) animateTo(targetRotation, 700);
    }, [targetRotation]);


    return (
        <div className="flex flex-col section-padding">
            <h2 className="section-header mb-6">
                {t('categories')}
            </h2>
            {!categories || isLoading || isError ?
                <AnimatedCarouselSkeleton />
                :
                <div className="relative w-full xl:h-[600px] h-[300px] xl:min-h-[500px]" style={{
                    perspective: 2000,
                    transformStyle: 'preserve-3d',
                }}>
                    {categories.slice(0, 8).map((item, index) => {
                        const angle = index * angleStep + rotation;

                        const x = Math.cos(angle) * radius;
                        const y = Math.sin(angle) * verticalRadius;
                        const z = Math.sin(angle) * radius;

                        const scale = 1.0 + Math.sin(angle) * 0.1;
                        const opacity = 0.9 + Math.sin(angle) * 0.1;
                        const zIndex = Math.round(z);

                        const isCenter = Math.abs(normalizeAngle(angle - Math.PI / 2)) < 0.02;

                        return (
                            <div
                                key={item.id}
                                onClick={() => handleClick(index, item.name)}
                                className="absolute left-1/2 top-10 md:top-20 -translate-x-1/2 cursor-pointer"
                                style={{
                                    width: `${cardSize.w}px`,
                                    height: `${cardSize.h}px`,
                                    transform: `translate3d(${x}px, ${y}px, ${z + zOffset}px) scale3d(${scale},${scale},1)`,
                                    transformStyle: "preserve-3d",
                                    opacity,
                                    zIndex,
                                }}
                            >
                                <div className="flex flex-col items-center">
                                    <Image
                                        src={item.img_url ? item.img_url : `/${index + 1}.png`}
                                        alt={item.name}
                                        width={cardSize.w}
                                        height={cardSize.h - 40}
                                        style={{ width: "100%", height: "auto" }}
                                    />
                                </div>
                                <div className="mt-4">
                                    {isCenter && (
                                        <div className="flex flex-col items-center gap-4 md:gap-6">
                                            <span
                                                ref={titleRef}
                                                className="carousel-item__title text-3xl md:text-4xl mt-2 text-primary text-center xl:font-light font-semibold"
                                            >
                                                {item.name}
                                            </span>
                                            <Button
                                                variant="default"
                                                className="cursor-pointer opacity-100 w-fit text-lg"
                                                hasEffect
                                                onClick={() => router.push(`/`)}
                                            >
                                                {t('exploreNow')}
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            }

        </div>
    );
};

export default AnimatedCarousel;
