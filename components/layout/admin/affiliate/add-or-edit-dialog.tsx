"use client";

import { Pencil } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AffiliateResponse } from "@/types/affiliate";
import AddOrEditAffiliateForm from "./add-or-edit-form";

interface AddOrEditAffiliateDialogProps {
  isEdit?: boolean;
  affiliateValues?: AffiliateResponse;
}

export default function AddOrEditAffiliateDialog({
  isEdit = false,
  affiliateValues,
}: AddOrEditAffiliateDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogTrigger asChild>
        {isEdit ? (
          <Button
            variant="ghost"
            size="icon"
            title="Edit affiliate"
          >
            <Pencil className="h-4 w-4 text-primary" />
          </Button>
        ) : (
          <Button variant="secondary">Add Affiliate</Button>
        )}
      </DialogTrigger>

      <DialogContent className="w-[calc(100vw-2rem)] max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Affiliate" : "Create Affiliate"}
          </DialogTitle>
        </DialogHeader>

        <AddOrEditAffiliateForm
          affiliateValues={affiliateValues}
          onClose={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
