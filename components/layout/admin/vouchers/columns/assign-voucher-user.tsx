"use client";

import React, { useMemo, useState } from "react";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { FastForward, Loader2, UserPlus } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { useGetProductsSelect } from "@/features/product-group/hook";
import {
  useAssignVoucherToProduct,
  useAssignVoucherToUser,
} from "@/features/vouchers/hook";
import Image from "next/image";
import { toast } from "sonner";
import { useGetAllCustomers } from "@/features/users/hook";

interface AssignProps {
  voucher_id: string;
  voucher_code: string;
}

const AssignVoucherToUsers = ({ voucher_id, voucher_code }: AssignProps) => {
  const { data: listUsers = [], isLoading } = useGetAllCustomers();

  const assignMutation = useAssignVoucherToUser();

  const [search, setSearch] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const filtered = useMemo(() => {
    const keyword = search.toLowerCase();

    return listUsers.filter((u) => {
      const first = u.first_name?.toLowerCase() ?? "";
      const last = u.last_name?.toLowerCase() ?? "";
      return first.includes(keyword) || last.includes(keyword);
    });
  }, [search, listUsers]);

  /** 🔄 When product is selected → move to top */
  const sortedUsers = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const aSelected = selectedUsers.includes(a.id);
      const bSelected = selectedUsers.includes(b.id);
      return aSelected === bSelected ? 0 : aSelected ? -1 : 1;
    });
  }, [filtered, selectedUsers]);

  /** ✔ Toggle select */
  const toggleUser = (id: string) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  /** ✔ Confirm assign */
  const handleConfirm = () => {
    assignMutation.mutate(
      {
        voucher_id,
        user_ids: selectedUsers,
      },
      {
        onSuccess() {
          toast.success("Assigned successfully!");
        },
        onError() {
          toast.error("Failed to assign!");
        },
      },
    );
  };

  return (
    <Drawer direction="right">
      {/* Trigger */}
      <DrawerTrigger asChild>
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <DrawerTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:border-secondary hover:bg-green-50 hover:border"
                >
                  <UserPlus className="text-green-600" />
                </Button>
              </DrawerTrigger>
            </TooltipTrigger>

            <TooltipContent
              side="top"
              className="bg-white text-black"
              arrowColor="white"
            >
              Assign to Users
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </DrawerTrigger>

      {/* Drawer */}
      <DrawerContent className="p-6 w-[800px] max-w-none data-[vaul-drawer-direction=right]:sm:max-w-[800px] mx-auto">
        <DrawerHeader className="p-0">
          <DrawerTitle>Assign Voucher to Users</DrawerTitle>
        </DrawerHeader>

        {/* Voucher ID */}
        <p className="text-sm text-muted-foreground mb-4">
          Voucher:{" "}
          <span className="font-bold text-secondary">{voucher_code}</span>
        </p>

        {/* Search */}
        <Input
          placeholder="Search products..."
          className="mb-4"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Product List */}
        <div className="max-h-[700px] overflow-auto space-y-3 px-2 py-2 border rounded-md">
          {isLoading && <div>Loading...</div>}

          {sortedUsers.map((user) => {
            const checked = selectedUsers.includes(user.id);

            return (
              <div
                key={user.id}
                className="flex items-center justify-between border rounded-lg px-3 py-2 hover:bg-gray-50 cursor-pointer"
                onClick={() => toggleUser(user.id)} // 🔥 Click cả div sẽ toggle
              >
                <div className="flex justify-center items-center gap-2">
                  <div>
                    <p className="font-medium">
                      {user.first_name} {user.last_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>

                <Checkbox
                  checked={checked}
                  onCheckedChange={() => toggleUser(user.id)}
                  onClick={(e) => e.stopPropagation()} // ❗ Ngăn div click event
                />
              </div>
            );
          })}
        </div>

        <DrawerFooter>
          <Button
            onClick={handleConfirm}
            disabled={assignMutation.isPending}
          >
            {assignMutation.isPending ? (
              <Loader2 className="animate-spin" />
            ) : (
              "Confirm Assign"
            )}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default AssignVoucherToUsers;
