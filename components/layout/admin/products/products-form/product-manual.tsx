"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import { FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Upload, Loader2 } from "lucide-react";
import { useUploadStaticFile } from "@/features/file/hook";

type ProductManualFile = {
  title: string;
  url: string;
};

const MANUAL_SECTIONS = [
  { key: "Benutzerhandbuch", label: "User Manual" },
  { key: "Sicherheit_information", label: "Safety Information" },
  { key: "Aufbauanleitung", label: "Assembly Instructions" },
  { key: "Datenblatt", label: "Data Sheet", multiple: true },
];

const ProductManual = () => {
  const form = useFormContext();
  const uploadFileMutation = useUploadStaticFile();

  const pdfFiles = (form.watch("pdf_files") || []) as ProductManualFile[];
  const sanitizePdfFile = (file: File) => {
    const sanitizedName = file.name.replace(/\s+/g, "-");
    return new File([file], sanitizedName, {
      type: file.type,
    });
  };

  const handleUpload = async (
    files: File[],
    title: string,
    shouldAppend = false,
  ) => {
    const prevFiles = [...pdfFiles];

    const sanitizedFiles = files.map((file) => sanitizePdfFile(file));

    const formData = new FormData();
    sanitizedFiles.forEach((file) => {
      formData.append("files", file);
    });

    const res = await uploadFileMutation.mutateAsync(formData);

    const newItems = res.results.map((item) => ({
      title,
      url: item.url,
    }));

    const updated = shouldAppend
      ? [...prevFiles, ...newItems]
      : [...prevFiles.filter((f) => f.title !== title), ...newItems];

    form.setValue("pdf_files", updated, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  // ============================
  // REMOVE FILE
  // ============================
  const removeFile = (title: string, url?: string) => {
    const prevFiles = [...pdfFiles];

    const updated = url
      ? prevFiles.filter((f) => !(f.title === title && f.url === url))
      : prevFiles.filter((f) => f.title !== title);

    form.setValue("pdf_files", updated, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  return (
    <div className="space-y-6">
      <FormItem>
        <FormLabel className="text-black font-semibold text-lg">
          Product Manuals (PDF)
        </FormLabel>

        <div className="grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-6">
          {MANUAL_SECTIONS.map((section) => {
            const filesOfSection = pdfFiles.filter(
              (item) => item.title === section.key,
            );

            const currentFile = filesOfSection[0];

            return (
              <div key={section.key} className="space-y-3">
                <div className="font-semibold">{section.label}</div>

                {/* Hidden input */}
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  id={`pdf-upload-${section.key}`}
                  multiple={section.multiple}
                  onChange={async (e) => {
                    const files = Array.from(e.target.files ?? []);
                    if (files.length > 0) {
                      await handleUpload(
                        files,
                        section.key,
                        Boolean(section.multiple),
                      );
                      e.currentTarget.value = "";
                    }
                  }}
                />

                {filesOfSection.length > 0 && (
                  <div className="space-y-2">
                    {filesOfSection.map((file) => (
                      <div
                        key={`${section.key}-${file.url}`}
                        className="flex items-center justify-between gap-2 px-4 py-2 border rounded-md bg-secondary/10 text-sm"
                      >
                        <a
                          href={file.url}
                          download={file.url.split("/").pop() || "manual.pdf"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="truncate text-secondary hover:underline"
                          title="Download file"
                        >
                          {file.url.split("/").pop()}
                        </a>

                        <Button
                          type="button"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700 hover:bg-transparent p-0"
                          onClick={() => removeFile(section.key, file.url)}
                        >
                          ✕
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {section.multiple || !currentFile ? (
                  <label
                    htmlFor={`pdf-upload-${section.key}`}
                    className="cursor-pointer flex items-center gap-2 text-sm w-full px-4 py-2 border rounded-md bg-white hover:bg-secondary/10 transition truncate"
                  >
                    {uploadFileMutation.isPending ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <>
                        <Upload className="w-5 h-5 shrink-0" />
                        <span className="truncate">
                          {filesOfSection.length > 0
                            ? "Add more files"
                            : "Upload file"}
                        </span>
                      </>
                    )}
                  </label>
                ) : null}
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
