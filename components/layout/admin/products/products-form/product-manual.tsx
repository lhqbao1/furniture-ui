"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import { FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Upload, Loader2 } from "lucide-react";
import { useUploadStaticFile } from "@/features/file/hook";

const MANUAL_SECTIONS = [
  { key: "benutzerhandbuch", label: "Benutzerhandbuch" },
  { key: "sicherheit_information", label: "Sicherheitsinformationen" },
  { key: "aufbauanleitung", label: "Aufbauanleitung" },
];

const ProductManual = () => {
  const form = useFormContext();
  const uploadFileMutation = useUploadStaticFile();

  const pdfFiles = form.watch("pdf_files") || [];

  const handleUpload = async (files: File[], title: string) => {
    const newItems: any[] = [];

    for (const file of files) {
      // sanitize filename: replace spaces with -
      const sanitizedName = file.name.replace(/\s+/g, "-");

      // tạo file mới với name đã clean
      const sanitizedFile = new File([file], sanitizedName, {
        type: file.type,
      });

      const formData = new FormData();
      formData.append("files", sanitizedFile);

      const res = await uploadFileMutation.mutateAsync(formData);

      newItems.push({
        title,
        url: res.results[0].url,
      });
    }

    form.setValue("pdf_files", [...pdfFiles, ...newItems], {
      shouldValidate: true,
    });
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

            // Label text logic
            let buttonText = "Upload file(s)";
            if (filesOfSection.length === 1) {
              const fileName = filesOfSection[0].url.split("/").pop();
              buttonText = fileName;
            } else if (filesOfSection.length > 1) {
              buttonText = `${filesOfSection.length} files uploaded`;
            }

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
                  multiple
                  className="hidden"
                  id={`pdf-upload-${section.key}`}
                  onChange={async (e) => {
                    const files = Array.from(e.target.files || []);
                    if (files.length > 0) {
                      await handleUpload(files, section.label);
                    }
                  }}
                />

                {/* Upload button */}
                <label
                  htmlFor={`pdf-upload-${section.key}`}
                  className="cursor-pointer flex items-center gap-2 text-sm w-full px-4 py-1.5 border rounded-md bg-white hover:bg-secondary/10 transition truncate"
                >
                  {uploadFileMutation.isPending ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-5 h-5 shrink-0" />
                      <span className="truncate">{buttonText}</span>
                    </>
                  )}
                </label>
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
