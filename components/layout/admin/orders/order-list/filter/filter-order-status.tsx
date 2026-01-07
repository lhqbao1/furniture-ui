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
import { STATUS_OPTIONS } from "@/data/data";

export default function OrderStatusFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Lấy giá trị hiện tại từ URL
  const param = searchParams.get("status") || "";
  const initialSelected = param ? param.split(",") : [];

  const [selected, setSelected] = useState<string[]>(initialSelected);

  // Sync params -> UI khi user chuyển trang
  useEffect(() => {
    const current = searchParams.get("status") || "";
    setSelected(current ? current.split(",") : []);
  }, [searchParams]);

  const toggleStatus = (item: (typeof STATUS_OPTIONS)[number]) => {
    // danh sách backend statuses mà item đại diện
    const backendStatuses = item.statuses ?? [item.key];

    const isSelected = backendStatuses.every((s) => selected.includes(s));

    let updated: string[];

    if (isSelected) {
      // remove toàn bộ statuses
      updated = selected.filter((s) => !backendStatuses.includes(s));
    } else {
      // add toàn bộ statuses (tránh duplicate)
      updated = Array.from(new Set([...selected, ...backendStatuses]));
    }

    setSelected(updated);

    const params = new URLSearchParams(searchParams);

    if (updated.length > 0) {
      params.set("status", updated.join(","));
    } else {
      params.delete("status");
    }

    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex flex-col gap-2">
      <Label>Status:</Label>

      <Select>
        <SelectTrigger
          className="w-[200px] cursor-pointer border text-black justify-center"
          placeholderColor
          iconColor="black"
        >
          <SelectValue placeholder="Choose status" />
        </SelectTrigger>

        <SelectContent className="max-h-96">
          {STATUS_OPTIONS.map((item) => (
            <div
              key={item.key}
              className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-accent rounded-md"
              onClick={() => toggleStatus(item)}
            >
              <Checkbox
                checked={
                  item.statuses
                    ? item.statuses.every((s) => selected.includes(s))
                    : selected.includes(item.key)
                }
              />
              <span>{item.label}</span>
            </div>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
