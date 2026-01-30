"use client";

import { Button } from "@/components/ui/button";
import { FormField, FormMessage } from "@/components/ui/form";
import { useUploadStaticFile } from "@/features/file/hook";
import { cn } from "@/lib/utils";
import { FileIcon, Loader2, UploadIcon } from "lucide-react";
import Image from "next/image";
import React, { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { UseFormReturn, FieldValues, Path, PathValue } from "react-hook-form";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { StaticFileResponse } from "@/types/products";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  restrictToParentElement,
  restrictToVerticalAxis,
  restrictToWindowEdges,
} from "@dnd-kit/modifiers";

// ================== TYPES ==================
export type ImageItem = { id: string; url: string };

// stable id generator
const genId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? (crypto as Crypto).randomUUID()
    : Math.random().toString(36).slice(2, 9);

interface ImagePickerInputProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  fieldName: Path<T>;
  description?: string;
  isSingle?: boolean;
  className?: string;
  isSimple?: boolean;
  isFile?: boolean;
  isAddProduct?: boolean;
}

// ================== SORTABLE ITEM ==================
function SortableImage({
  item,
  onRemove,
}: {
  item: ImageItem;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: item.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="relative h-full aspect-square rounded-lg overflow-hidden group cursor-move z-0"
    >
      <Image
        {...listeners}
        src={item.url}
        alt={`Uploaded-${item.id}`}
        fill
        className="object-contain z-0"
        unoptimized
      />
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
      >
        ✕
      </button>
    </div>
  );
}

// ================== MAIN COMPONENT ==================
function ImagePickerInput<T extends FieldValues>({
  form,
  fieldName,
  description,
  isSingle = false,
  isFile = false,
  isAddProduct = false,
  className,
  isSimple,
}: ImagePickerInputProps<T>) {
  const uploadImage = useUploadStaticFile();
  const watched = form.watch(fieldName as Path<T>);
  const t = useTranslations();
  const [items, setItems] = useState<ImageItem[]>([]);

  // Sync form value -> local state (only when multiple)
  useEffect(() => {
    if (!isSingle) {
      const vals: { url: string }[] = (watched as { url: string }[]) || [];
      const normalized: ImageItem[] = vals.map((v) => ({
        id: genId(),
        url: v.url,
      }));
      setItems(normalized);
    }
  }, [watched, isSingle]);

  // Upload handler
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (!acceptedFiles?.length) return;

      for (const file of acceptedFiles) {
        const fileSizeMB = file.size / 1024 / 1024;

        // ❌ BLOCK WEBP
        if (file.type === "image/webp") {
          toast.error("WEBP images are not allowed. Please upload JPG or PNG.");
          return;
        }

        // ❌ BLOCK FILE > 5MB
        if (fileSizeMB > 5) {
          toast.error(`File "${file.name}" exceeds the 5MB limit.`);
          return;
        }
      }

      // 🔍 Check tổng số ảnh (hiện có + mới)
      const totalImages = items.length + acceptedFiles.length;
      if (totalImages > 20) {
        toast.error(`You can upload a maximum of 20 images per product.`);
        return;
      }

      const formData = new FormData();
      acceptedFiles.forEach((file) => formData.append("files", file));

      uploadImage.mutate(formData, {
        onSuccess(data: StaticFileResponse) {
          const uploadedUrls = data.results.map((r) => r.url);
          // 🔍 Kiểm tra URL có chứa khoảng trắng
          if (uploadedUrls.length > 20) {
            toast.error(`Maximum 20 images per product`);
            return;
          }

          // ✅ Tiếp tục xử lý bình thường
          if (isSingle) {
            form.setValue(fieldName, uploadedUrls[0] as PathValue<T, Path<T>>, {
              shouldValidate: true,
            });
          } else {
            const newItems = uploadedUrls.map((url) => ({ id: genId(), url }));
            const next = [...items, ...newItems];
            setItems(next);
            form.setValue(
              fieldName,
              next.map((i) => ({ url: i.url })) as PathValue<T, Path<T>>,
              { shouldValidate: true },
            );
          }
        },
      });
    },
    [uploadImage, isSingle, items, form, fieldName],
  );

  const removeImage = (index: number) => {
    if (isSingle) {
      form.setValue(fieldName, "" as PathValue<T, Path<T>>, {
        shouldValidate: true,
      });
    } else {
      const next = items.filter((_, idx) => idx !== index);
      setItems(next);
      form.setValue(
        fieldName,
        next.map((i) => ({ url: i.url })) as PathValue<T, Path<T>>,
        { shouldValidate: true },
      );
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: isFile ? undefined : { "image/*": [] },
    multiple: !isSingle,
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  return (
    <div
      className={cn(
        "col-span-12 overflow-x-hidden grid grid-cols-12 gap-4",
        className,
      )}
    >
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`h-full w-full border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center space-y-4 transition-colors cursor-pointer
          ${
            isDragActive
              ? "border-primary bg-primary/5"
              : "border-gray-300 dark:border-gray-700"
          } ${isAddProduct ? "col-span-3" : "col-span-12"}`}
      >
        {uploadImage.isPending ? (
          <Loader2
            className={cn(
              "w-12 h-12 text-gray-400 animate-spin",
              isSimple && "w-6 h-6",
            )}
          />
        ) : (
          <UploadIcon
            className={cn("w-12 h-12 text-gray-400", isSimple && "w-6 h-6")}
          />
        )}
        {!isSimple && (
          <>
            <div className="text-gray-500 dark:text-gray-400 text-center">
              {isDragActive ? (
                <div>{t("dragFile")}</div>
              ) : (
                <div>{t("dragAndDropFile")}</div>
              )}
            </div>
            {description && (
              <p className="text-gray-500 text-sm text-center">{description}</p>
            )}
          </>
        )}

        <Button
          variant="outline"
          type="button"
        >
          {t("browseFile")}
        </Button>
        <input
          {...getInputProps()}
          className="hidden"
          multiple
        />
      </div>

      {/* Preview */}
      {isSingle ? (
        watched ? (
          <div className="col-span-6 relative h-[100px] w-[100px] aspect-square rounded-lg group">
            {isFile ? (
              <>
                <FileIcon className="w-8 h-8 text-gray-500" />
                <span className="text-xs truncate max-w-[90px]">
                  {String(watched).split("/").pop()}
                </span>
              </>
            ) : (
              <Image
                src={watched as string}
                alt="Uploaded"
                fill
                className="object-cover"
                unoptimized
              />
            )}
            <button
              type="button"
              onClick={() => removeImage(0)}
              className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
            >
              ✕
            </button>
          </div>
        ) : null
      ) : items.length > 0 ? (
        <div
          className={`overflow-y-auto overflow-x-hidden ${
            isAddProduct ? "col-span-9" : "col-span-12"
          }`}
        >
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            modifiers={[restrictToParentElement]}
            onDragEnd={({ active, over }) => {
              if (!over || active.id === over.id) return;
              const oldIndex = items.findIndex((it) => it.id === active.id);
              const newIndex = items.findIndex((it) => it.id === over.id);
              if (oldIndex === -1 || newIndex === -1) return;
              const next = arrayMove(items, oldIndex, newIndex);
              setItems(next);
              form.setValue(
                fieldName,
                next.map((i) => ({ url: i.url })) as PathValue<T, Path<T>>,
                { shouldValidate: true },
              );
            }}
          >
            <SortableContext
              items={items.map((i) => i.id)}
              strategy={rectSortingStrategy}
            >
              <div className="w-full h-fit grid grid-cols-4 gap-4">
                {items.map((it, idx) => (
                  <SortableImage
                    key={it.id}
                    item={it}
                    onRemove={() => removeImage(idx)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      ) : null}

      {/* Hidden field for errors */}
      <FormField
        control={form.control}
        name={fieldName}
        render={() => <FormMessage />}
      />
    </div>
  );
}

export default ImagePickerInput;
