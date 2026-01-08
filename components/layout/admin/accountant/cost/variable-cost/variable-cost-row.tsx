"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { VariableCostItemUI } from "@/types/variable-fee";

interface VariableFeeRowProps {
  fee: VariableCostItemUI;
  onChange: (value: number | "") => void;
  onRemove: () => void;
}

export function VariableFeeRow({
  fee,
  onChange,
  onRemove,
}: VariableFeeRowProps) {
  const [openConfirm, setOpenConfirm] = useState(false);

  return (
    <>
      <div className="grid grid-cols-[1fr_1fr_auto] gap-3 items-center">
        <div className="text-sm capitalize">{fee.type}</div>

        <Input
          type="number"
          placeholder="Amount (€)"
          value={fee.amount}
          onChange={(e) =>
            onChange(e.target.value ? Number(e.target.value) : "")
          }
        />

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setOpenConfirm(true)}
          className="text-muted-foreground hover:text-destructive"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Confirm Dialog */}
      <Dialog
        open={openConfirm}
        onOpenChange={setOpenConfirm}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Remove Fee</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove "<b>{fee.type}</b>"?
              {fee.ids && (
                <span className="text-xs text-muted-foreground block mt-1">
                  (This will delete it permanently)
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
                onRemove(); // now actually remove
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
