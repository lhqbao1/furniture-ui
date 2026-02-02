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

export const CHANEL_OPTIONS = [
  { key: "prestige_home", label: "Prestige Home" },
  { key: "amazon", label: "Amazon" },
  { key: "kaufland", label: "Kaufland" },
  { key: "ebay", label: "Ebay" },
  { key: "freakout", label: "Freakout" },
  { key: "praktiker", label: "Praktiker" },
  { key: "netto", label: "Netto" },
  { key: "norma", label: "Norma24" },
  { key: "check24", label: "Check24" },
  { key: "inprodius", label: "Inprodius" },
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
      <Label>Chanel:</Label>
      <Select>
        <SelectTrigger
          className="w-[200px] cursor-pointer border text-black justify-center"
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
              <span>{item.label}</span>
            </div>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
