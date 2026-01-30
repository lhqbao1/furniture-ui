import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useGetContainersByPurchaseOrder } from "@/features/incoming-inventory/container/hook";
import React from "react";
import AddContainerDialog from "../dialog/add-container-dialog";
import { formatDateDDMMYYYY, formatDateString } from "@/lib/date-formated";
import { Trash, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import DeleteDialogConfirm from "../dialog/delete-dialog-confirm";
import InventorySelect from "./inventory-select";
import { Skeleton } from "@/components/ui/skeleton";

interface ListContainersProps {
  po_id: string;
}

const ContainerCardSkeleton = () => {
  return (
    <Card>
      <CardHeader className="space-y-2">
        <Skeleton className="h-5 w-1/3" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-2/3" />
      </CardContent>

      <CardFooter>
        <Skeleton className="h-9 w-full" />
      </CardFooter>
    </Card>
  );
};

const ListContainers = ({ po_id }: ListContainersProps) => {
  const { data, isLoading, isError } = useGetContainersByPurchaseOrder(po_id);

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-2 gap-4 mt-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <ContainerCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 mt-6">
      {data.map((item, index) => {
        return (
          <Card key={item.id}>
            <CardHeader>
              <CardTitle>Size: {item.size}</CardTitle>
              <CardAction className="space-x-2">
                <AddContainerDialog
                  purchaseOrderId={po_id}
                  container={item}
                />
                <DeleteDialogConfirm containerId={item.id} />
              </CardAction>
            </CardHeader>
            <CardContent>
              <div>
                Date of Shipment:{" "}
                <span className="text-secondary font-semibold">
                  {formatDateDDMMYYYY(item.date_if_shipment)}
                </span>
              </div>
              <div>
                Date of Inspection:{" "}
                <span className="text-secondary font-semibold">
                  {formatDateDDMMYYYY(item.date_of_inspection)}
                </span>
              </div>
              <div>
                Date of Delivery:{" "}
                <span className="text-secondary font-semibold">
                  {formatDateDDMMYYYY(item.date_of_issue)}
                </span>
              </div>
            </CardContent>
            <CardFooter>
              <InventorySelect
                containerId={item.id}
                po_id={po_id}
              />
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
};

export default ListContainers;
