"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronsUpDown } from "lucide-react";

export const CHANEL_OPTIONS = [
  { key: "prestige_home", label: "Prestige Home", icon: "new-logo.svg" },
  { key: "amazon", label: "Amazon", icon: "amazon.png" },
  { key: "bauhaus", label: "Bauhaus", icon: "bauhaus.svg" },
  { key: "bader", label: "Bader", icon: "bader_logo.png" },
  { key: "channel21", label: "Channel21", icon: "channel21.jpg" },
  { key: "check24", label: "Check24", icon: "check-24.png" },
  { key: "econelo", label: "Econelo", icon: "econelo-favicon.png" },
  { key: "ebay", label: "Ebay", icon: "ebay.png" },
  { key: "euro-tops", label: "Euro Tops", icon: "euro-top.png" },
  { key: "forstinger", label: "Forstinger", icon: "forstinger.jpeg" },
  { key: "freakout", label: "Freakout", icon: "freakout.png" },
  { key: "hornbach", label: "Hornbach", icon: "horn.png" },
  { key: "inprodius", label: "Inprodius", icon: "inprodius.png" },
  { key: "kaufland", label: "Kaufland", icon: "kau.png" },
  { key: "neckermann", label: "Neckermann", icon: "necker3.png" },
  { key: "netto", label: "Netto", icon: "netto-logo.svg" },
  { key: "norma", label: "Norma24", icon: "norma.png" },
  { key: "praktiker", label: "Praktiker", icon: "praktiker.jpg" },
  { key: "XXXLUTZ", label: "XXXLUTZ", icon: "xxxlutz.png" },
  { key: "moebelix", label: "Moebelix", icon: "mobelix.png" },
];

export default function OrderChanelFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  // Lấy giá trị hiện tại từ URL
  const param = searchParams.get("channel") || "";
  const initialSelected = param ? param.split(",") : [];

  const [selected, setSelected] = useState<string[]>(initialSelected);

  // Sync params -> UI khi user chuyển trang
  useEffect(() => {
    const current = searchParams.get("channel") || "";
    setSelected(current ? current.split(",") : []);
  }, [searchParams]);

  const selectedLabel = useMemo(() => {
    if (selected.length === 0) return "Choose channel";

    if (selected.length === 1) {
      const channel = CHANEL_OPTIONS.find((item) => item.key === selected[0]);
      return channel?.label ?? "1 selected";
    }

    return `${selected.length} selected`;
  }, [selected]);

  const toggleStatus = (key: string) => {
    let updated: string[];

    if (selected.includes(key)) {
      updated = selected.filter((s) => s !== key);
    } else {
      updated = [...selected, key];
    }

    setSelected(updated);

    const params = new URLSearchParams(searchParams);

    if (updated.length > 0) {
      params.set("channel", updated.join(","));
    } else {
      params.delete("channel");
    }

    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex flex-col gap-2">
      <Label>Channel</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            className="w-full justify-between border bg-white font-normal text-black"
          >
            <span className="truncate">{selectedLabel}</span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          usePortal={false}
          className="z-[120] w-[var(--radix-popover-trigger-width)] p-0 pointer-events-auto"
        >
          <Command>
            <CommandInput placeholder="Search channel..." />
            <CommandList className="max-h-80">
              <CommandEmpty>No channel found.</CommandEmpty>
              <CommandGroup>
                {CHANEL_OPTIONS.map((item) => {
                  const isSelected = selected.includes(item.key);

                  return (
                    <CommandItem
                      key={item.key}
                      value={`${item.label} ${item.key}`}
                      onSelect={() => toggleStatus(item.key)}
                      className="cursor-pointer"
                    >
                      <Checkbox
                        checked={isSelected}
                        className="pointer-events-none"
                      />
                      {item.icon ? (
                        <Image
                          src={`/${item.icon}`}
                          alt={item.label}
                          width={18}
                          height={18}
                          className="shrink-0"
                        />
                      ) : null}
                      <span className="truncate">{item.label}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
