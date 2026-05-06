"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { getOrderTagOption, ORDER_TAG_OPTIONS } from "@/data/data";
import { useUpdateTagForMainCheckout } from "@/features/checkout/hook";
import { CheckOutMain } from "@/types/checkout";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

const EMPTY_SELECT_VALUE = "__tag_select_empty__";
const NONE_TAG_VALUE = "__tag_none__";

const getTagLabel = (tag?: string | null) => {
  if (!tag) return "None";
  return getOrderTagOption(tag)?.label ?? tag;
};

export default function OrderTagSelector({
  order,
}: {
  order: CheckOutMain;
}) {
  const updateTagMutation = useUpdateTagForMainCheckout();
  const [value, setValue] = React.useState(EMPTY_SELECT_VALUE);
  const [pendingTag, setPendingTag] = React.useState<string | undefined>();
  const [openConfirm, setOpenConfirm] = React.useState(false);

  const currentTag = order.tag ?? undefined;
  const currentLabel = getTagLabel(currentTag);
  const pendingLabel = getTagLabel(pendingTag);

  const resetSelectionState = React.useCallback(() => {
    setValue(EMPTY_SELECT_VALUE);
    setPendingTag(undefined);
  }, []);

  const handleClose = React.useCallback(() => {
    setOpenConfirm(false);
    resetSelectionState();
  }, [resetSelectionState]);

  const handleChange = React.useCallback(
    (nextValue: string) => {
      const nextTag = nextValue === NONE_TAG_VALUE ? undefined : nextValue;

      if (nextTag === currentTag) {
        resetSelectionState();
        return;
      }

      setValue(nextValue);
      setPendingTag(nextTag);
      setOpenConfirm(true);
    },
    [currentTag, resetSelectionState],
  );

  const handleConfirm = React.useCallback(() => {
    updateTagMutation.mutate(
      {
        main_checkout_id: order.id,
        tag: pendingTag,
      },
      {
        onSuccess: () => {
          toast.success("Order tag updated successfully");
          handleClose();
        },
        onError: () => {
          toast.error("Failed to update order tag");
          handleClose();
        },
      },
    );
  }, [handleClose, order.id, pendingTag, updateTagMutation]);

  return (
    <>
      <div className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
        <div className="flex flex-1 items-center gap-2">
          <div className="font-medium text-slate-500">Tag:</div>
          <span className="font-semibold text-slate-900">{currentLabel}</span>
        </div>

        <div className="flex items-center gap-2">
          <Select value={value} onValueChange={handleChange}>
            <SelectTrigger
              className="h-7 min-h-7 w-fit rounded-md border border-slate-200 bg-white px-2"
              iconColor="#334155"
            />
            <SelectContent>
              <SelectItem value={EMPTY_SELECT_VALUE} className="hidden" disabled>
                Select
              </SelectItem>
              <SelectItem value={NONE_TAG_VALUE} className="cursor-pointer">
                None
              </SelectItem>
              {ORDER_TAG_OPTIONS.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className="cursor-pointer"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Dialog open={openConfirm} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update order tag</DialogTitle>
            <DialogDescription>
              {pendingTag === undefined
                ? "Are you sure you want to remove the tag from this order?"
                : `Are you sure you want to update this order tag to "${pendingLabel}"?`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-start">
            <DialogClose asChild>
              <Button
                type="button"
                className="bg-gray-400 text-white hover:bg-gray-500"
                disabled={updateTagMutation.isPending}
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="button"
              onClick={handleConfirm}
              hasEffect
              variant="secondary"
              disabled={updateTagMutation.isPending}
            >
              {updateTagMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Confirm"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
