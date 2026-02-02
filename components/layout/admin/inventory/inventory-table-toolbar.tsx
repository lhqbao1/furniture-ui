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
import { usePathname, useRouter } from "@/src/i18n/navigation";
import { useLocale } from "next-intl";
import { ProductItem } from "@/types/products";
import { toast } from "sonner";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { useSearchParams } from "next/navigation";
import InventoryFilterForm from "./filter-form";
import ImportInventoryDialog from "./dialog/import-dialog";
import FilterExportForm from "../products/products-list/toolbar/filter-export-dialog";
import ExportInventoryDialog from "./dialog/export-dialog";

export enum ToolbarType {
  product = "product",
  order = "order",
}

interface InventoryTableToolbarProps {
  pageSize: number;
  setPageSize: React.Dispatch<React.SetStateAction<number>>;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  addButtonText?: string;
  isAddButtonModal?: boolean;
  addButtonUrl?: string;
  addButtonModalContent?: React.ReactNode;
  exportData?: ProductItem[];
  isInventory?: boolean;
}

type ImageFile = {
  url: string;
};

export default function InventoryTableToolbar({
  pageSize,
  setPageSize,
  setPage,
  addButtonText,
  isAddButtonModal,
  addButtonUrl,
  addButtonModalContent,
  exportData,
  isInventory,
}: InventoryTableToolbarProps) {
  const router = useRouter();
  const locale = useLocale();
  const searchParams = useSearchParams();

  const [openAddModal, setOpenAddModal] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const pathname = usePathname();
  const defaultSearch = searchParams.get("search") ?? "";

  const [searchValue, setSearchValue] = useState(defaultSearch);

  // debounce inputValue
  const [debouncedSearch] = useDebounce(searchValue, 600);

  // push URL khi debounce hoàn thành
  useEffect(() => {
    router.push(
      {
        pathname,
        query: {
          page: 1,
          search: debouncedSearch || "",
        },
      },
      { scroll: false },
    );

    setPage(1);
  }, [debouncedSearch]);

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
    <div className="flex flex-col lg:flex-row items-center justify-center gap-2 p-2 w-full flex-wrap lg:flex-nowrap">
      {/* Left group */}
      <div className="flex items-center lg:gap-2 gap-2 flex-wrap lg:flex-nowrap ">
        <div className="flex gap-2 text-sm font-medium">
          {/* <Button variant="ghost" className="">Export</Button> */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Export <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-[600px] p-4 space-y-4">
              {/* Filter here */}
              <ExportInventoryDialog />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {!isInventory && (
          <div className="flex gap-2 text-sm font-medium">
            {/* <Button variant="ghost" className="">Export</Button> */}
            <ImportInventoryDialog setIsImporting={setIsImporting} />
          </div>
        )}
      </div>

      {/* Search (auto, no button) */}
      <div className="flex items-center w-1/2 flex-wrap lg:flex-nowrap space-x-2">
        <Input
          placeholder="Search"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
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
      </div>

      {/* Right group */}
      <div className="flex items-center gap-2 flex-wrap lg:flex-nowrap justify-center lg:justify-start">
        {/* <div>
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
        </div> */}

        {/* <DropdownMenu>
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
        </DropdownMenu> */}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="flex items-center gap-1"
            >
              Filter <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[800px] px-8 py-4">
            <InventoryFilterForm />
          </DropdownMenuContent>
        </DropdownMenu>

        {!isInventory && (
          <Button
            variant={"secondary"}
            onClick={() =>
              router.push("/admin/logistic/inventory/incoming/add")
            }
          >
            Add PO
          </Button>
        )}

        {/* <DropdownMenu>
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
        </DropdownMenu> */}
      </div>
    </div>
  );
}
