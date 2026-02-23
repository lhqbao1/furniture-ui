"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDropzone } from "react-dropzone";
import {
  useImportProductInventory,
  useImportProducts,
  useImportProductsSupplier,
} from "@/features/file/hook";
import { toast } from "sonner"; // hoặc react-hot-toast nếu bạn dùng lib khác
import { File, Loader2 } from "lucide-react";
import { useGetSuppliers } from "@/features/supplier/hook";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImportInventoryDialogProps {
  setIsImporting: React.Dispatch<React.SetStateAction<boolean>>;
  isSupplier?: boolean;
}

const ImportInventoryDialog = ({
  setIsImporting,
  isSupplier = false,
}: ImportInventoryDialogProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [open, setOpen] = useState(false);

  const importProductInventoryMutation = useImportProductInventory();

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]); // chỉ lấy file đầu tiên
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
  });

  const handleSubmit = () => {
    if (!file) {
      toast.error("You need to choose at least one file");
      return;
    }

    const toastId = toast.loading("Importing products, please wait...");

    const formData = new FormData();
    formData.append("file", file);

    importProductInventoryMutation.mutate(formData, {
      onSuccess: () => {
        toast.success("Import products successful", {
          id: toastId,
        });
        setIsImporting(true);
        setOpen(false);
      },
      onError: () => {
        toast.error("Import products failed", {
          id: toastId,
        });
        setIsImporting(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className=""
          disabled={importProductInventoryMutation.isPending ? true : false}
        >
          {importProductInventoryMutation.isPending ? (
            <Loader2 className="animate-spin" />
          ) : (
            "Import"
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[600px]">
        <DialogHeader>
          <DialogTitle>Upload file</DialogTitle>
        </DialogHeader>
        <div
          {...getRootProps()}
          className={`mt-4 flex h-40 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed transition 
                        ${
                          isDragActive
                            ? "border-primary bg-primary/10"
                            : "border-gray-300"
                        }`}
        >
          <input {...getInputProps()} />
          {file ? (
            <div className="flex gap-2">
              <File />
              <p className="text-sm text-gray-600">{file.name}</p>
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              Drag & drop file here, or click to select
            </p>
          )}
        </div>

        {/* Action buttons */}
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!file || importProductInventoryMutation.isPending}
          >
            {importProductInventoryMutation.isPending
              ? "Uploading..."
              : "Submit"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImportInventoryDialog;
