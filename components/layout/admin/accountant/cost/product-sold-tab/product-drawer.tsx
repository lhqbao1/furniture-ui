"use client";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useGetProductByIdProvider } from "@/features/products/hook";
import Image from "next/image";

interface ProviderDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  providerId: string | null;
}

export function ProviderDrawer({
  open,
  onOpenChange,
  providerId,
}: ProviderDrawerProps) {
  const { data, isLoading, isError } = useGetProductByIdProvider(
    providerId ?? "",
  );

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      direction="right"
    >
      <DrawerContent className="px-6">
        <DrawerHeader className="px-0">
          <DrawerTitle>Provider Detail</DrawerTitle>
        </DrawerHeader>

        {data ? (
          <div className="space-y-4">
            <div>
              <span className="text-muted-foreground">Image:</span>
              <Image
                src={data.static_files[0].url}
                width={200}
                height={200}
                alt=""
              />
            </div>
            <div>
              <span className="text-muted-foreground">Provider ID:</span>
              <p className="font-medium">{providerId}</p>
            </div>
            <div>
              <span className="text-muted-foreground">EAN:</span>
              <p className="font-medium">{data.ean}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Product Name:</span>
              <p className="font-medium">{data.name}</p>
            </div>

            {/* 👉 fetch detail bằng providerId ở đây */}
          </div>
        ) : (
          <div className="text-muted-foreground">No provider selected</div>
        )}
      </DrawerContent>
    </Drawer>
  );
}
