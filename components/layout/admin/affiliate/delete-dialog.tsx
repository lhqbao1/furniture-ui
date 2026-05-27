"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useDeleteAffiliate } from "@/features/affiliate/hook";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface DeleteAffiliateDialogProps {
  affiliateId: string;
  affiliateName?: string;
}

export default function DeleteAffiliateDialog({
  affiliateId,
  affiliateName,
}: DeleteAffiliateDialogProps) {
  const [open, setOpen] = useState(false);
  const deleteAffiliateMutation = useDeleteAffiliate();

  function handleDelete() {
    deleteAffiliateMutation.mutate(affiliateId, {
      onSuccess: () => {
        toast.success("Affiliate deleted successfully");
        setOpen(false);
      },
      onError: () => {
        toast.error("Failed to delete affiliate");
        setOpen(false);
      },
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          title="Delete affiliate"
        >
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Affiliate</DialogTitle>
          <DialogDescription>
            Delete affiliate {affiliateName ? `"${affiliateName}"` : "this item"}?
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button
              type="button"
              className="bg-gray-400 text-white hover:bg-gray-500"
              disabled={deleteAffiliateMutation.isPending}
            >
              Close
            </Button>
          </DialogClose>

          <Button
            type="button"
            variant="secondary"
            onClick={handleDelete}
            disabled={deleteAffiliateMutation.isPending}
          >
            {deleteAffiliateMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : null}
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
