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

export const STATUS_OPTIONS = [
  { key: "pending", label: "Waiting for payment", active: true, pos: 2 },
  { key: "paid", label: "Payment received", active: true, pos: 3 },
  { key: "tock_reserved", label: "Stock reserved", active: true, pos: 4 },
  {
    key: "preparation_shipping",
    label: "Preparing",
    active: true,
    pos: 5,
  },
  { key: "ds_informed", label: "DS informed", active: true, pos: 6 },
  { key: "shipped", label: "Dispatched", active: true, pos: 7 },
  { key: "completed", label: "Completed", active: true, pos: 0 },
  { key: "cancel_request", label: "Cancel requested", active: true, pos: 8 },
  { key: "canceled", label: "Canceled", active: true, pos: 9 },
  { key: "return", label: "Return", active: true, pos: 10 },
];

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
