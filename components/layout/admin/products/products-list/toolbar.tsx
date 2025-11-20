"use client";

import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { useDebounce } from "use-debounce";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import FilterForm from "./toolbar/filter";
import ImportDialog from "./toolbar/import";
import { usePathname, useRouter } from "@/src/i18n/navigation";
import { useLocale } from "next-intl";
import { ProductItem } from "@/types/products";
import ExportExcelButton from "./toolbar/export-button";
import { toast } from "sonner";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import OrderFilterForm from "../../orders/order-list/filter/filter-form";

export enum ToolbarType {
  product = "product",
  order = "order",
}

interface TableToolbarProps {
  searchQuery?: string;
  pageSize: number;
  setPageSize: React.Dispatch<React.SetStateAction<number>>;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  setSearchQuery?: React.Dispatch<React.SetStateAction<string>>;
  addButtonText?: string;
  isAddButtonModal?: boolean;
  addButtonUrl?: string;
  addButtonModalContent?: React.ReactNode;
  exportData?: ProductItem[];
  type: ToolbarType;
}

type ImageFile = {
  url: string;
};

export default function TableToolbar({
  searchQuery,
  pageSize,
  setPageSize,
  setPage,
  setSearchQuery,
  addButtonText,
  isAddButtonModal,
  addButtonUrl,
  addButtonModalContent,
  exportData,
  type,
}: TableToolbarProps) {
  const router = useRouter();
  const locale = useLocale();
  const [openAddModal, setOpenAddModal] = useState(false);
  const [inputValue, setInputValue] = useState(searchQuery ?? "");
  const [isImporting, setIsImporting] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setInputValue(searchQuery ?? "");
  }, [searchQuery]);

  // debounce inputValue
  const [debouncedValue] = useDebounce(inputValue, 400);

  useEffect(() => {
    if (debouncedValue !== searchQuery && setSearchQuery) {
      setSearchQuery(debouncedValue);
      setPage(1);

      // 🔹 Cập nhật URL
      router.push(
        {
          pathname: pathname,
          query: {
            page: 1,
            // search: debouncedValue || undefined, // thêm search nếu có
          },
        },
        { scroll: false },
      ); // không scroll lên đầu
    }
  }, [debouncedValue, searchQuery, setSearchQuery, router]);

  const handleDownloadZip = async () => {
    if (!exportData?.length) {
      toast.error("Không có sản phẩm nào để tải ảnh");
      return;
    }

    const zip = new JSZip();
    toast.loading("Uploading...");

    let totalCount = 0;

    for (const item of exportData) {
      const folderName = sanitizeFolderName(
        `${item.id_provider}-${item.name}` || "unknown",
      );
      const folder = zip.folder(folderName);

      for (const [index, file] of (item.static_files || []).entries()) {
        try {
          const response = await fetch(file.url);
          const blob = await response.blob();

          const ext =
            file.url
              .match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)?.[1]
              ?.toLowerCase() || "jpg";
          const filename = `image_${index + 1}.${ext}`;

          folder?.file(filename, blob);
          totalCount++;
        } catch (error) {
          console.error("Lỗi tải ảnh:", file.url, error);
        }
      }
    }

    const zipBlob = await zip.generateAsync({ type: "blob" });
    saveAs(zipBlob, "images.zip");

    toast.success(
      `Downloaded ${totalCount} images from ${exportData.length} products`,
    );
  };

  // Helper: loại bỏ ký tự đặc biệt trong tên folder
  function sanitizeFolderName(name: string) {
    return name
      .replace(/[<>:"/\\|?*\x00-\x1F]/g, "") // loại ký tự không hợp lệ trong tên file
      .replace(/\s+/g, "_") // đổi khoảng trắng thành _
      .trim();
  }

  return (
    <div className="flex flex-col lg:flex-row items-center justify-between gap-4 p-2 w-full flex-wrap lg:flex-nowrap">
      {/* Left group */}
      <div className="flex items-center lg:gap-4 gap-2 flex-wrap lg:flex-nowrap ">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="flex items-center gap-1"
            >
              Group action <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Delete Selected</DropdownMenuItem>
            <DropdownMenuItem>Export Selected</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex gap-2 text-sm font-medium">
          {/* <Button variant="ghost" className="">Export</Button> */}
          <ExportExcelButton data={exportData ?? []} />
          <ImportDialog setIsImporting={setIsImporting} />
        </div>
      </div>

      {/* Search (auto, no button) */}
      <div className="flex items-center w-full flex-1 flex-wrap lg:flex-nowrap">
        <Input
          placeholder="Search"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
      </div>

      {/* Right group */}
      <div className="flex items-center gap-4 flex-wrap lg:flex-nowrap justify-center lg:justify-start">
        <div>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => setPageSize(Number(value))}
          >
            <SelectTrigger className="border text-black cursor-pointer">
              <SelectValue placeholder="Select size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 rows</SelectItem>
              <SelectItem value="5">5 rows</SelectItem>
              <SelectItem value="10">10 rows</SelectItem>
              <SelectItem value="20">20 rows</SelectItem>
              <SelectItem value="50">50 rows</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-1"
            >
              Filter <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[800px] px-8 py-4">
            {type === ToolbarType.product && <FilterForm />}
            {type === ToolbarType.order && <OrderFilterForm />}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-1"
            >
              View <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Compact</DropdownMenuItem>
            <DropdownMenuItem>Comfortable</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-1"
            >
              Columns <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Name</DropdownMenuItem>
            <DropdownMenuItem>Stock</DropdownMenuItem>
            <DropdownMenuItem>Price</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {addButtonText && (
          <Button
            className="bg-primary hover:bg-primary font-semibold"
            onClick={() => {
              if (addButtonUrl) {
                router.push(addButtonUrl, { locale });
              } else if (isAddButtonModal) {
                setOpenAddModal(true);
              }
            }}
          >
            {addButtonText}
          </Button>
        )}
      </div>
      <Button
        variant={"secondary"}
        onClick={() => handleDownloadZip()}
      >
        Download images
      </Button>

      {isAddButtonModal && (
        <Dialog
          open={openAddModal}
          onOpenChange={setOpenAddModal}
        >
          <DialogContent className="w-1/3">
            <DialogHeader>
              <DialogTitle>{addButtonText}</DialogTitle>
            </DialogHeader>
            {addButtonModalContent &&
              React.cloneElement(
                addButtonModalContent as React.ReactElement<{
                  onClose?: () => void;
                }>,
                { onClose: () => setOpenAddModal(false) },
              )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
