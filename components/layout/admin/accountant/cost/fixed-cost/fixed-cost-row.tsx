"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { FixedCostItemUI } from "./useFixedCostForm";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface FixedCostRowProps {
  item: FixedCostItemUI;
  index: number;
  isReadonly: boolean;
  onUpdate: (
    index: number,
    field: keyof FixedCostItemUI,
    value: string,
  ) => void;
  onRemove: (index: number) => void;
}

export function FixedCostRow({
  item,
  index,
  isReadonly,
  onUpdate,
  onRemove,
}: FixedCostRowProps) {
  const [openConfirm, setOpenConfirm] = useState(false);

  return (
    <>
      <div
        className={`grid grid-cols-[1fr_1fr_auto_auto] gap-3 items-center ${
          item.isCloned ? "text-destructive" : ""
        }`}
      >
        <Input
          className={item.isCloned ? "border-destructive" : ""}
          placeholder="Cost type"
          value={item.type}
          onChange={(e) => onUpdate(index, "type", e.target.value)}
        />

        <Input
          className={item.isCloned ? "border-destructive" : ""}
          type="number"
          placeholder="Amount (€)"
          value={item.amount}
          onChange={(e) => onUpdate(index, "amount", e.target.value)}
        />

        <span className="text-muted-foreground text-sm">€</span>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setOpenConfirm(true)}
          className="text-muted-foreground hover:text-destructive"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Dialog
        open={openConfirm}
        onOpenChange={setOpenConfirm}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Remove Fixed Cost</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this fixed cost?
              {item.isCloned && (
                <span className="block text-xs text-destructive mt-1">
                  (This cost is cloned from previous month)
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setOpenConfirm(false)}
              className="text-muted-foreground"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setOpenConfirm(false);
                onRemove(index); // trigger actual remove
              }}
            >
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
