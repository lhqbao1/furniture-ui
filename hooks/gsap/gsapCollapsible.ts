import { useEffect } from "react";
import gsap from "gsap";

export function useGsapCollapsible(
  el: HTMLDivElement | null,
  isOpen: boolean,
  duration = 0.4,
) {
  useEffect(() => {
    if (!el) return;

    if (isOpen) {
      gsap.fromTo(
        el,
        { height: 0 },
        {
          height: 200,
          duration,
          ease: "power2.out",
        },
      );
    } else {
      gsap.to(el, {
        height: 0,
        duration,
        ease: "power2.inOut",
      });
    }
  }, [el, isOpen, duration]);
}
