"use client";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useGetProductByIdProvider } from "@/features/products/hook";
import Image from "next/image";
import ProviderDrawerSkeleton from "./product-drawer-skeleton";

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

        {/* 🔹 Loading */}
        {isLoading && <ProviderDrawerSkeleton />}

        {/* 🔹 Error */}
        {isError && (
          <div className="text-destructive">Failed to load provider data</div>
        )}

        {/* 🔹 Data */}
        {!isLoading && data && (
          <div className="space-y-4">
            <div>
              <span className="text-muted-foreground">Image:</span>
              <Image
                src={data.static_files?.[0]?.url ?? "/placeholder.png"}
                width={200}
                height={200}
                alt={data.name}
                className="rounded-md"
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
              <span className="text-muted-foreground">Name:</span>
              <p className="font-medium">{data.name}</p>
            </div>
          </div>
        )}

        {/* 🔹 Empty */}
        {!isLoading && !data && (
          <div className="text-muted-foreground">No provider selected</div>
        )}
      </DrawerContent>
    </Drawer>
  );
}
