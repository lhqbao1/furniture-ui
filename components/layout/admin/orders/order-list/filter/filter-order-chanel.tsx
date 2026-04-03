"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import Image from "next/image";

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
  { key: "neckermann", label: "Neckermann", icon: "neckermann.png" },
  { key: "netto", label: "Netto", icon: "netto-logo.svg" },
  { key: "norma", label: "Norma24", icon: "norma.png" },
  { key: "praktiker", label: "Praktiker", icon: "praktiker.jpg" },
  { key: "XXXLUTZ", label: "XXXLUTZ", icon: "xxxlutz.png" },
];

export default function OrderChanelFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Lấy giá trị hiện tại từ URL
  const param = searchParams.get("channel") || "";
  const initialSelected = param ? param.split(",") : [];

  const [selected, setSelected] = useState<string[]>(initialSelected);

  // Sync params -> UI khi user chuyển trang
  useEffect(() => {
    const current = searchParams.get("channel") || "";
    setSelected(current ? current.split(",") : []);
  }, [searchParams]);

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
      <Select>
        <SelectTrigger
          className="w-full cursor-pointer border text-black justify-between"
          placeholderColor
          iconColor="black"
        >
          <SelectValue placeholder="Choose channel" />
        </SelectTrigger>

        <SelectContent className="max-h-96">
          {CHANEL_OPTIONS.map((item) => (
            <div
              key={item.key}
              className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-accent rounded-md"
              onClick={() => toggleStatus(item.key)}
            >
              <Checkbox checked={selected.includes(item.key)} />
              {item.icon && (
                <Image
                  src={`/${item.icon}`}
                  alt={item.label}
                  width={18}
                  height={18}
                  className="shrink-0"
                />
              )}
              <span>{item.label}</span>
            </div>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
