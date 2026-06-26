import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  useAddProductGroup,
  useUpdateProductGroup,
} from "@/features/product-group/hook";
import { Loader2, Pencil } from "lucide-react";
import React from "react";
import { toast } from "sonner";

interface AddOrEditParentDialogDefaultValues {
  id: string;
  name: string;
}

interface AddOrEditParentDialogProps {
  defaultValues?: AddOrEditParentDialogDefaultValues;
}

const AddOrEditParentDialog = ({
  defaultValues,
}: AddOrEditParentDialogProps) => {
  const addProductGroupMutation = useAddProductGroup();
  const editProductGroupMutation = useUpdateProductGroup();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [groupName, setGroupName] = React.useState("");
  const isPending =
    addProductGroupMutation.isPending || editProductGroupMutation.isPending;

  const handleAddOrEditProductGroup = (name: string) => {
    if (defaultValues) {
      editProductGroupMutation.mutate(
        { name: name, id: defaultValues.id },
        {
          onSuccess: () => {
            toast.success("Product group updated");
            setDialogOpen(false);
            setGroupName("");
          },
          onError: () => {
            toast.error("Update product group failed");
          },
        },
      );
    } else {
      addProductGroupMutation.mutate(name, {
        onSuccess: () => {
          toast.success("Product group created");
          setDialogOpen(false);
          setGroupName("");
        },
        onError: () => {
          toast.error("Create product group failed");
        },
      });
    }
  };

  return (
    <Dialog
      open={dialogOpen}
      onOpenChange={(nextOpen) => {
        setDialogOpen(nextOpen);
        setGroupName(nextOpen ? (defaultValues?.name ?? "") : "");
      }}
    >
      <DialogTrigger asChild>
        {defaultValues ? (
          <button
            type="button"
            className="inline-flex size-8 items-center justify-center rounded-md text-amber-500 transition-colors hover:bg-amber-50 hover:text-amber-600"
            aria-label={`Edit ${defaultValues.name}`}
            onPointerDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <Pencil className="size-4" />
          </button>
        ) : (
          <Button
            type="button"
            variant="secondary"
          >
            Add Group
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {defaultValues ? "Edit Group Name" : "Add Product Group"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder={defaultValues ? defaultValues.name : "Group name"}
          />

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={isPending}
              onClick={() => {
                if (groupName.trim()) {
                  handleAddOrEditProductGroup(groupName.trim());
                } else {
                  toast.error("Please enter group name");
                }
              }}
            >
              {isPending ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddOrEditParentDialog;
