"use client";

import React from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { File, Loader2, Upload } from "lucide-react";
import { useUploadStaticFile } from "@/features/file/hook";
import { useUploadCheckoutPdfFile } from "@/features/checkout/hook";

interface UploadInvoicePdfDialogProps {
  mainCheckoutId: string;
  existingUrls?: string[];
}

const getErrorMessage = (error: unknown): string => {
  if (!error) return "Unknown error";
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;

  if (typeof error === "object") {
    const e = error as {
      response?: { data?: { detail?: string; message?: string } };
      message?: string;
    };
    return (
      e.response?.data?.detail ||
      e.response?.data?.message ||
      e.message ||
      "Unknown error"
    );
  }

  return "Unknown error";
};

const UploadInvoicePdfDialog = ({
  mainCheckoutId,
  existingUrls = [],
}: UploadInvoicePdfDialogProps) => {
  const uploadStaticFileMutation = useUploadStaticFile();
  const uploadCheckoutPdfFileMutation = useUploadCheckoutPdfFile();

  const [open, setOpen] = React.useState(false);
  const [file, setFile] = React.useState<File | null>(null);

  const isUploading =
    uploadStaticFileMutation.isPending || uploadCheckoutPdfFileMutation.isPending;
  const currentFileCount = existingUrls.filter((url) => url?.trim()).length;

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "application/pdf": [".pdf"],
    },
    multiple: false,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setFile(acceptedFiles[0]);
      }
    },
    onDropRejected: () => {
      toast.error("Only one PDF file is allowed");
    },
  });

  const resetState = React.useCallback(() => {
    setFile(null);
  }, []);

  const handleUpload = async () => {
    if (!mainCheckoutId) {
      toast.error("Missing checkout id");
      return;
    }

    if (currentFileCount >= 2) {
      toast.error("Maximum 2 package slip files are allowed");
      return;
    }

    if (!file) {
      toast.error("Please choose a PDF file");
      return;
    }

    const toastId = toast.loading("Uploading package slip PDF...");

    try {
      const formData = new FormData();
      formData.append("files", file);

      const uploadResult = await uploadStaticFileMutation.mutateAsync(formData);
      const uploadedUrl = uploadResult?.results?.[0]?.url?.trim();

      if (!uploadedUrl) {
        throw new Error("Upload failed: missing file URL");
      }

      const normalizedExistingUrls = existingUrls
        .map((url) => url?.trim())
        .filter((url): url is string => Boolean(url));

      if (normalizedExistingUrls.length === 0) {
        await uploadCheckoutPdfFileMutation.mutateAsync({
          main_checkout_id: mainCheckoutId,
          url: uploadedUrl,
        });
      } else {
        await uploadCheckoutPdfFileMutation.mutateAsync({
          main_checkout_id: mainCheckoutId,
          url: normalizedExistingUrls[0],
          url_2: uploadedUrl,
        });
      }

      toast.success("Package slip PDF uploaded", { id: toastId });
      setOpen(false);
      resetState();
    } catch (error) {
      toast.error("Failed to upload package slip PDF", {
        id: toastId,
        description: getErrorMessage(error),
      });
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) resetState();
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="outline"
          type="button"
          className="gap-2"
          disabled={currentFileCount >= 2}
        >
          <Upload className="size-4" />
          Upload ({currentFileCount}/2)
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[560px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Package Slip PDF</DialogTitle>
        </DialogHeader>

        <div
          {...getRootProps()}
          className={`mt-2 flex h-44 cursor-pointer items-center justify-center rounded-md border-2 border-dashed px-4 text-center transition ${
            isDragActive ? "border-primary bg-primary/10" : "border-muted-foreground/30"
          }`}
        >
          <input {...getInputProps()} />
          {file ? (
            <div className="flex items-center gap-2">
              <File className="size-5" />
              <span className="text-sm break-all">{file.name}</span>
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">
              Drag & drop a PDF file here, or click to select
            </span>
          )}
        </div>

        <div className="mt-2 flex justify-end">
          <Button type="button" onClick={handleUpload} disabled={isUploading}>
            {isUploading ? <Loader2 className="size-4 animate-spin" /> : "Upload"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UploadInvoicePdfDialog;
