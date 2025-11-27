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
import { Loader2, Pencil, Trash2 } from "lucide-react";
import React from "react";
import { toast } from "sonner";

interface AddOrEditParentDialogDefaultValues {
  id: string;
  name: string;
}

interface AddOrEditParentDialogProps {
  dialogOpen: boolean;
  setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  groupName: string;
  setGroupName: React.Dispatch<React.SetStateAction<string>>;
  defaultValues?: AddOrEditParentDialogDefaultValues;
}

const AddOrEditParentDialog = ({
  dialogOpen,
  setDialogOpen,
  groupName,
  setGroupName,
  defaultValues,
}: AddOrEditParentDialogProps) => {
  const addProductGroupMutation = useAddProductGroup();
  const editProductGroupMutation = useUpdateProductGroup();

  const handleAddOrEditProductGroup = (name: string) => {
    if (defaultValues) {
      editProductGroupMutation.mutate(
        { name: name, id: defaultValues.id },
        {
          onSuccess: () => {
            toast.success("Product group created");
            setDialogOpen(false);
            setGroupName("");
          },
          onError: () => {
            toast.error("Create product group failed");
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
      onOpenChange={() => setDialogOpen(!dialogOpen)}
    >
      <DialogTrigger asChild>
        {defaultValues ? (
          <div
            className="cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <Pencil className="size-4 text-gray-600" />
          </div>
        ) : (
          <Button
            type="button"
            variant="secondary"
          >
            Add Group
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="w-1/3">
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
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={addProductGroupMutation.isPending}
              onClick={() => {
                if (groupName.trim()) {
                  handleAddOrEditProductGroup(groupName.trim());
                } else {
                  toast.error("Please enter group name");
                }
              }}
            >
              {addProductGroupMutation.isPending ? (
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
