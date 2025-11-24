"use client";
import { useRef, useEffect } from "react";
import gsap from "gsap";

import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";

import { SidebarMenuButton } from "@/components/ui/sidebar";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/src/i18n/navigation";

interface MenuItem {
  id: string;
  title: string;
  url: string;
  children?: MenuItem[];
}

interface SidebarCollapsibleItemProps {
  item: MenuItem;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  locale: string;
  isPhone: boolean;
  setOpenMobile: (val: boolean) => void;
  setCurrentCategoryId: (id: string | null) => void;
  setCurrentCategoryName: (name: string) => void;
  pathname: string;
}

export function SidebarCollapsibleItem({
  item,
  isOpen,
  onOpenChange,
  locale,
  isPhone,
  setOpenMobile,
  setCurrentCategoryId,
  setCurrentCategoryName,
  pathname,
}: SidebarCollapsibleItemProps) {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    if (isOpen) {
      // ----- OPEN -----
      gsap.fromTo(
        el,
        { height: 0 },
        {
          height: el.scrollHeight,
          duration: 0.4,
          ease: "power2.out",
          onComplete: () => {
            // giữ lại auto height để responsive tốt
            el.style.height = "auto";
          },
        },
      );
    } else {
      // ----- CLOSE -----
      // trước tiên set height chính xác để tween mượt
      el.style.height = `${el.scrollHeight}px`;

      gsap.to(el, {
        height: 0,
        duration: 0.35,
        ease: "power2.inOut",
      });
    }
  }, [isOpen]);

  // active check
  const isActive = pathname?.startsWith(item.url);

  return (
    <Collapsible
      className="w-full"
      open={isOpen}
      onOpenChange={(open) => {
        onOpenChange(open);
      }}
    >
      {/* Trigger */}
      <CollapsibleTrigger asChild>
        <SidebarMenuButton asChild>
          <Button
            className={`flex w-full flex-row items-center justify-between gap-3 rounded-none px-4 py-6 transition-colors
              data-[state=open]:hover:bg-secondary-30 data-[state=open]:hover:text-black
              hover:[&>svg]:stroke-black
              ${
                isActive
                  ? "bg-secondary/20 text-[#4D4D4D] hover:text-black"
                  : "hover:bg-secondary/20 text-[#4D4D4D] hover:text-black"
              }
              focus:bg-secondary/20 active:bg-secondary/20 focus:text-black active:text-black
            `}
            variant={"ghost"}
            onClick={() => {
              setCurrentCategoryId(item.id);
            }}
          >
            <span className="lg:text-lg text-lg">{item.title}</span>

            <ChevronDown
              className={`size-4 opacity-70 transition-transform text-[#51BE8C] ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </Button>
        </SidebarMenuButton>
      </CollapsibleTrigger>

      {/* Content */}
      <CollapsibleContent asChild>
        <div
          ref={contentRef}
          style={{ overflow: "hidden", height: 0 }} // GSAP will animate
          className="flex flex-col gap-1.5 mt-1"
        >
          {item.children?.map((child) => {
            const isChildActive =
              pathname === child.url || pathname === `/${locale}${child.url}`;

            return (
              <Button
                key={child.id}
                onClick={() => {
                  router.push(child.url, { locale });
                  if (isPhone) setOpenMobile(false);
                  if (item.url.includes("category")) {
                    setCurrentCategoryId(child.id);
                    setCurrentCategoryName(child.title);
                  }
                }}
                variant={"ghost"}
                className={`relative flex flex-row items-start justify-start lg:pl-8 pl-12 text-wrap
                  gap-3 h-fit rounded-none py-1 flex-wrap max-w-full text-base transition-colors
                  ${
                    isChildActive
                      ? "bg-secondary/20 text-[#4D4D4D] !hover:bg-secondary/20"
                      : "hover:bg-secondary/20 hover:text-foreground text-[#4D4D4D]"
                  }
                `}
              >
                <div className="flex gap-2 items-center">
                  <div className="h-1.5 w-1.5 rounded-full bg-secondary"></div>
                  <span className="text-wrap lg:text-[17px] text-start">
                    {child.title}
                  </span>
                </div>

                {isOpen && isChildActive && (
                  <span className="absolute w-1 h-full bg-secondary right-0 top-0" />
                )}
              </Button>
            );
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
