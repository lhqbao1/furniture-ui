"use client";

import { type ComponentPropsWithoutRef, type ReactNode, useRef, useEffect } from "react";
import { CollapsibleContent } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

interface AnimatedCollapsibleContentProps {
  open: boolean;
  children: ReactNode;
}

export default function AnimatedCollapsibleContent({
  open,
  children,
  ...props
}: AnimatedCollapsibleContentProps &
  ComponentPropsWithoutRef<typeof CollapsibleContent>) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    node.style.overflow = "hidden";
    node.style.transition = "height 300ms ease, opacity 250ms ease";

    if (open) {
      const targetHeight = node.scrollHeight;
      node.style.height = `${targetHeight}px`;
      node.style.opacity = "1";
      const timeoutId = window.setTimeout(() => {
        if (ref.current && open) ref.current.style.height = "auto";
      }, 320);
      return () => window.clearTimeout(timeoutId);
    }

    const currentHeight = node.scrollHeight;
    node.style.height = `${currentHeight}px`;
    // Force reflow before collapsing.
    void node.offsetHeight;
    node.style.height = "0px";
    node.style.opacity = "0";
  }, [open]);

  return (
    <CollapsibleContent
      ref={ref}
      {...props}
      className={cn(props.className)}
      style={{ overflow: "hidden", height: 0, opacity: 0 }}
    >
      {children}
    </CollapsibleContent>
  );
}
