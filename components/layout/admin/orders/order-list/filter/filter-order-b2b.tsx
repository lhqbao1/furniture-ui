"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Building2, UserRound, UsersRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import type { ComponentType } from "react";

type B2BFilterValue = "all" | "true" | "false";

function parseB2BFilter(param: string | null): B2BFilterValue {
  if (!param) return "all";
  const normalized = param.trim().toLowerCase();
  if (normalized === "true") return "true";
  if (normalized === "false") return "false";
  return "all";
}

export default function OrderB2BFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selected, setSelected] = useState<B2BFilterValue>(
    parseB2BFilter(searchParams.get("is_b2b")),
  );

  useEffect(() => {
    setSelected(parseB2BFilter(searchParams.get("is_b2b")));
  }, [searchParams]);

  const handleSelect = (next: B2BFilterValue) => {
    setSelected(next);
    const params = new URLSearchParams(searchParams);

    if (next === "all") {
      params.delete("is_b2b");
    } else {
      params.set("is_b2b", next);
    }

    router.push(`?${params.toString()}`, { scroll: false });
  };

  const options: Array<{
    key: B2BFilterValue;
    label: string;
    description: string;
    icon: ComponentType<{ className?: string }>;
    activeClassName: string;
    hoverClassName: string;
  }> = [
    {
      key: "all",
      label: "All",
      description: "B2B + B2C",
      icon: UsersRound,
      activeClassName: "border-secondary bg-secondary/10 text-secondary",
      hoverClassName: "hover:border-secondary/40 hover:bg-secondary/5",
    },
    {
      key: "true",
      label: "B2B",
      description: "Business customers",
      icon: Building2,
      activeClassName: "border-blue-500 bg-blue-50 text-blue-700",
      hoverClassName: "hover:border-blue-300 hover:bg-blue-50/70",
    },
    {
      key: "false",
      label: "B2C",
      description: "Consumer customers",
      icon: UserRound,
      activeClassName: "border-orange-500 bg-orange-50 text-orange-700",
      hoverClassName: "hover:border-orange-300 hover:bg-orange-50/70",
    },
  ];

  return (
    <div className="space-y-2">
      <Label>Customer Type</Label>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {options.map((option) => {
          const Icon = option.icon;
          const isActive = selected === option.key;

          return (
            <button
              key={option.key}
              type="button"
              onClick={() => handleSelect(option.key)}
              className={cn(
                "flex items-center gap-2 rounded-lg border px-3 py-2 text-left transition-colors cursor-pointer",
                isActive
                  ? option.activeClassName
                  : `border-border bg-background ${option.hoverClassName}`,
              )}
            >
              <Icon className="size-4 shrink-0" />
              <div className="min-w-0">
                <div className="text-sm font-semibold">{option.label}</div>
                <div className="text-xs text-muted-foreground">
                  {option.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
