'use client'
import { Button } from "@/components/ui/button";
import { homeBannerItems } from "@/data/data";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";

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

    const radius = 600;
    const verticalRadius = 220;
    const zOffset = -700;
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

    const handleClick = (index: number) => {
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
        <div className="flex flex-col container-padding">
            <h2 className="text-secondary text-4xl font-bold text-center uppercase">Categories</h2>
            <div className="relative w-full h-[700px] min-h-[650px] [perspective:2000px] [transform-style:preserve-3d] ">
                {homeBannerItems.map((item, index) => {
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
                            onClick={() => handleClick(index)}
                            className="absolute left-1/2 top-20 -translate-x-1/2 w-[295px] h-[380px] cursor-pointer [transform-style:preserve-3d]"
                            style={{
                                transform: `translate3d(${x}px, ${y}px, ${z + zOffset}px) scale3d(${scale},${scale},1)`,
                                opacity,
                                zIndex,
                            }}
                        >
                            <div className="flex flex-col items-center">
                                <Image src={item.image} alt={item.name} width={295} height={340} style={{ width: "100%", height: "auto" }} // keeps aspect ratio
                                />
                            </div>
                            <div className="mt-4">
                                {isCenter && (
                                    <div className="flex flex-col gap-6">
                                        <span
                                            ref={titleRef}
                                            className="carousel-item__title text-4xl mt-2 text-primary text-center text-black-600 font-light"
                                        >
                                            {item.name}
                                        </span>
                                        <Button>Explore now</Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>

    );
};

export default AnimatedCarousel;
