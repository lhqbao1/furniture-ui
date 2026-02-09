"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { useUpdateBulkActiveProducts } from "@/features/products/hook";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface UpdateStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productIds: string[];
}

const UpdateStatusDialog = ({
  open,
  onOpenChange,
  productIds,
}: UpdateStatusDialogProps) => {
  const [status, setStatus] = useState<"true" | "false" | null>(null);

  const bulkUpdateMutation = useUpdateBulkActiveProducts();

  const handleUpdate = () => {
    if (status === null) return;

    bulkUpdateMutation.mutate(
      {
        productIds,
        isActive: status === "true",
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          setStatus(null);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Update product status</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <RadioGroup
            value={status ?? undefined}
            onValueChange={(v) => setStatus(v as "true" | "false")}
            className="space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="true" id="status-active" />
              <Label htmlFor="status-active">Active</Label>
            </div>

            <div className="flex items-center space-x-2">
              <RadioGroupItem value="false" id="status-inactive" />
              <Label htmlFor="status-inactive">Inactive</Label>
            </div>
          </RadioGroup>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            type="button"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!status || bulkUpdateMutation.isPending}
            onClick={handleUpdate}
          >
            {bulkUpdateMutation.isPending ? "Updating..." : "Update"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateStatusDialog;
