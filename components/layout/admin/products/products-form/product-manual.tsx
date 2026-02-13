"use client";

import React, { useState } from "react";
import { useFormContext } from "react-hook-form";
import { FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Upload, Loader2 } from "lucide-react";
import { useUploadStaticFile } from "@/features/file/hook";

const MANUAL_SECTIONS = [
  { key: "benutzerhandbuch", label: "User Manual" },
  { key: "sicherheit_information", label: "Safety Information" },
  { key: "aufbauanleitung", label: "Assembly Instructions" },
];

const ProductManual = () => {
  const form = useFormContext();
  const uploadFileMutation = useUploadStaticFile();

  const pdfFiles = form.watch("pdf_files") || [];
  const [removedFiles, setRemovedFiles] = useState<any[]>([]);
  // ============================
  // UPLOAD NEW FILE (Replace old one)
  // ============================
  const handleUpload = async (files: File[], title: string) => {
    const prevFiles = [...pdfFiles];
    const existing = prevFiles.find((file) => file.title === title);

    // Remove old file (store it to delete later if needed)
    if (existing) {
      setRemovedFiles((prev) => [...prev, existing]);
    }

    const file = files[0];
    const sanitizedName = file.name.replace(/\s+/g, "-");
    const sanitizedFile = new File([file], sanitizedName, {
      type: file.type,
    });

    const formData = new FormData();
    formData.append("files", sanitizedFile);

    const res = await uploadFileMutation.mutateAsync(formData);

    const newItem = {
      title,
      url: res.results[0].url,
    };

    // Replace file for this section
    const updated = [...prevFiles.filter((f) => f.title !== title), newItem];

    form.setValue("pdf_files", updated, { shouldValidate: true });
  };

  // ============================
  // REMOVE FILE
  // ============================
  const removeFile = (title: string) => {
    const prevFiles = [...pdfFiles];
    const existing = prevFiles.find((f) => f.title === title);

    if (existing) {
      setRemovedFiles((prev) => [...prev, existing]);
    }

    const updated = prevFiles.filter((f) => f.title !== title);
    form.reset(
      {
        ...form.getValues(),
        pdf_files: updated,
      },
      { keepDirty: true, keepTouched: true },
    );
  };

  return (
    <div className="space-y-6">
      <FormItem>
        <FormLabel className="text-black font-semibold text-lg">
          Product Manuals (PDF)
        </FormLabel>

        <div className="grid lg:grid-cols-3 grid-cols-1 gap-6">
          {MANUAL_SECTIONS.map((section) => {
            const filesOfSection = pdfFiles.filter(
              (item: any) => item.title === section.label,
            );

            const currentFile = filesOfSection[0];

            return (
              <div
                key={section.key}
                className="space-y-3"
              >
                <div className="font-semibold">{section.label}</div>

                {/* Hidden input */}
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  id={`pdf-upload-${section.key}`}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      await handleUpload([file], section.label);
                    }
                  }}
                />

                {/* If file exists → show label with delete button */}
                {currentFile ? (
                  <div className="flex items-center justify-between px-4 py-2 border rounded-md bg-secondary/10 text-sm">
                    <span className="truncate">
                      {currentFile.url.split("/").pop()}
                    </span>

                    <Button
                      type="button"
                      variant="ghost"
                      className="text-red-600 hover:text-red-700 hover:bg-transparent p-0"
                      onClick={() => removeFile(section.label)}
                    >
                      ✕
                    </Button>
                  </div>
                ) : (
                  /* Upload button */
                  <label
                    htmlFor={`pdf-upload-${section.key}`}
                    className="cursor-pointer flex items-center gap-2 text-sm w-full px-4 py-2 border rounded-md bg-white hover:bg-secondary/10 transition truncate"
                  >
                    {uploadFileMutation.isPending ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <>
                        <Upload className="w-5 h-5 shrink-0" />
                        <span className="truncate">Upload file</span>
                      </>
                    )}
                  </label>
                )}
              </div>
            );
          })}
        </div>

        <FormMessage />
      </FormItem>
    </div>
  );
};

export default ProductManual;
