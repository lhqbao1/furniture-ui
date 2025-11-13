"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Customer } from "@/types/user";
import { useDeleteCustomer } from "@/features/users/hook";
import { Button } from "@/components/ui/button";
import { Pencil, Trash } from "lucide-react";
import { toast } from "sonner";
import DeleteDialog from "./delete-dialog";
import { useRouter } from "@/src/i18n/navigation";
import { useLocale } from "next-intl";

function ActionCell({ user }: { user: Customer }) {
  const router = useRouter();
  const deleteCustomerMutation = useDeleteCustomer();
  const locale = useLocale();

  const handleDeleteCustomer = () => {
    deleteCustomerMutation.mutate(user.id, {
      onSuccess(data, variables, context) {
        toast.success("Delete customer successfully");
      },
      onError(error, variables, context) {
        toast.error("Delete customer fail");
      },
    });
  };
  return (
    <div className="flex gap-1.5 justify-center">
      <Button
        variant="ghost"
        size="icon"
        onClick={() =>
          router.push(`/admin/crm/customers/${user.id}`, { locale })
        }
      >
        <Pencil className="size-4 text-primary" />
      </Button>
      <DeleteDialog user={user} />
    </div>
  );
}

export const customerColumns: ColumnDef<Customer>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => {
      return <div>#{row.original.user_code}</div>;
    },
  },
  {
    accessorKey: "name",
    header: "NAME",
    cell: ({ row }) => {
      return (
        <div>
          {row.original.first_name} {row.original.last_name}
        </div>
      );
    },
  },
  {
    accessorKey: "email",
    header: () => <div className="text-start w-full">EMAIL</div>,
    cell: ({ row }) => {
      return <div className="text-start">{row.original.email}</div>;
    },
  },
  {
    accessorKey: "email",
    header: () => <div className="text-center w-full">CHANNEL</div>,
    cell: ({ row }) => {
      return (
        <div className="uppercase text-center">
          {row.original.from_marketplace}
        </div>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: () => <div className="text-center w-full">CREATED</div>,
    cell: ({ row }) => {
      const isoString = row.original.created_at;
      const date = new Date(isoString);

      const time = date.toLocaleString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false, // bỏ AM/PM nếu muốn
      });

      const day = date.toLocaleString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

      return (
        <div className="flex flex-col items-center text-xs text-[#4D4D4D]">
          <span>{time}</span>
          <span>{day}</span>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: ({}) => <div className="text-center">ACTION</div>,
    cell: ({ row }) => {
      return <ActionCell user={row.original} />;
    },
  },
];
