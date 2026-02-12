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
  useImportProducts,
  useUpdateStockSupplier,
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

interface ImportStockSupplierDialogProps {
  setIsImporting: React.Dispatch<React.SetStateAction<boolean>>;
  isSupplier?: boolean;
}

const ImportStockSupplierDialog = ({
  setIsImporting,
  isSupplier = false,
}: ImportStockSupplierDialogProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [open, setOpen] = useState(false);
  const [supplierId, setSupplierId] = useState<string | null>(null);
  const [openSupplier, setOpenSupplier] = useState(false);

  const { data: listSuppliers, isLoading, isError } = useGetSuppliers();

  const importProductMutation = useImportProducts();
  const updateStockSupplierMutation = useUpdateStockSupplier();

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

    if (supplierId !== null) {
      updateStockSupplierMutation.mutate(
        {
          file: formData,
          supplier_id: supplierId,
        },
        {
          onSuccess: () => {
            toast.success("Update stock successful", {
              id: toastId,
            });
            setIsImporting(true);
            setOpen(false);
          },
          onError: (error) => {
            toast.error("Update stock failed", {
              id: toastId,
              description: error.message,
            });
            setIsImporting(false);
          },
        },
      );
    } else {
      importProductMutation.mutate(formData, {
        onSuccess: () => {
          toast.success("Import products successful", {
            id: toastId,
          });
          setIsImporting(true);
          setOpen(false);
        },
        onError: (error) => {
          toast.error("Import products failed", {
            id: toastId,
            description: error.message,
          });
          setIsImporting(false);
        },
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className=""
          disabled={importProductMutation.isPending || updateStockSupplierMutation.isPending}
        >
          {importProductMutation.isPending || updateStockSupplierMutation.isPending ? (
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
        {isSupplier && listSuppliers && (
          <div>
            <Popover open={openSupplier} onOpenChange={setOpenSupplier}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between"
                >
                  {supplierId
                    ? listSuppliers.find((s) => s.id === supplierId)
                        ?.business_name
                    : "Select supplier"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-full p-0 pointer-events-auto">
                <Command>
                  <CommandInput placeholder="Search supplier..." />

                  <CommandEmpty>No supplier found.</CommandEmpty>

                  <CommandGroup className="max-h-[460px] overflow-y-auto">
                    {/* Suppliers from API */}
                    {listSuppliers
                      ?.slice() // tránh mutate array gốc
                      .sort((a, b) =>
                        a.business_name.localeCompare(b.business_name, "de", {
                          sensitivity: "base",
                        }),
                      )
                      .map((item) => (
                        <CommandItem
                          key={item.id}
                          value={item.business_name}
                          onSelect={() => {
                            setSupplierId(item.id);
                            setOpenSupplier(false); // ✅ đóng popover
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              supplierId === item.id
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                          {item.business_name}
                        </CommandItem>
                      ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        )}

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
            disabled={
              !file ||
              importProductMutation.isPending ||
              updateStockSupplierMutation.isPending
            }
          >
            {importProductMutation.isPending ||
            updateStockSupplierMutation.isPending
              ? "Uploading..."
              : "Submit"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImportStockSupplierDialog;
