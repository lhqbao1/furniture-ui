"use client";

import { useState } from "react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
} from "@/components/ui/form";
import { Upload, X } from "lucide-react";
import { useUploadStaticFile } from "@/features/file/hook";
import Image from "next/image";

export default function FormImageUpload({
  form,
  name,
  label,
}: {
  form: any;
  name: string;
  label?: string;
}) {
  const uploadMutation = useUploadStaticFile();

  const fieldValue = form.watch(name); // giá trị trong form: string | null
  const initialPreview = fieldValue && fieldValue !== "" ? fieldValue : null;

  const [preview, setPreview] = useState<string | null>(initialPreview);

  const handleSelectFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // preview local
    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);

    // upload form-data
    const fd = new FormData();
    fd.append("files", file);

    uploadMutation.mutate(fd, {
      onSuccess: (res) => {
        const uploadedUrl = res?.results?.[0]?.url || null;

        if (uploadedUrl) {
          form.setValue(name, uploadedUrl, { shouldValidate: true });
          setPreview(uploadedUrl);
        }
      },
      onError: () => {
        setPreview(null);
      },
    });
  };

  const handleRemove = () => {
    setPreview(null);
    form.setValue(name, "");
  };

  return (
    <FormField
      control={form.control}
      name={name}
      render={() => (
        <FormItem>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <>
              {/* Chỉ hiển thị upload box nếu KHÔNG có preview */}
              {!preview && (
                <label
                  className="flex flex-col items-center justify-center
                             w-full h-40 border border-dashed rounded-lg cursor-pointer
                             hover:bg-accent transition"
                >
                  <Upload className="size-8 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">
                    Upload image
                  </span>

                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleSelectFile}
                  />
                </label>
              )}

              {/* Preview chỉ hiện nếu preview !== null */}
              {preview && (
                <div className="relative mt-3 w-full">
                  <Image
                    src={preview}
                    className="w-full h-40 object-cover rounded-lg border"
                    alt="Preview"
                    height={300}
                    width={300}
                  />

                  <button
                    type="button"
                    onClick={handleRemove}
                    className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-full"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              )}
            </>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
