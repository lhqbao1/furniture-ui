"use client";

import { useRef, useEffect } from "react";
import { CollapsibleContent } from "@/components/ui/collapsible";
import gsap from "gsap";

export default function AnimatedCollapsibleContent({
  open,
  children,
  ...props
}: any) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    if (open) {
      // Expand
      gsap.fromTo(
        ref.current,
        { height: 0, opacity: 0 },
        {
          height: "auto",
          opacity: 1,
          duration: 0.35,
          ease: "power2.out",
        },
      );
    } else {
      // Collapse
      gsap.to(ref.current, {
        height: 0,
        opacity: 0,
        duration: 0.3,
        ease: "power2.in",
      });
    }
  }, [open]);

  return (
    <CollapsibleContent
      ref={ref}
      {...props}
      style={{ overflow: "hidden", height: 0 }}
    >
      {children}
    </CollapsibleContent>
  );
}
