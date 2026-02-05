import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useGetContainersByPurchaseOrder } from "@/features/incoming-inventory/container/hook";
import React from "react";
import AddContainerDialog from "../dialog/add-container-dialog";
import { formatDateDDMMYYYY } from "@/lib/date-formated";
import DeleteDialogConfirm from "../dialog/delete-dialog-confirm";
import InventorySelect from "./inventory-select";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { FolderUp } from "lucide-react";
import { toast } from "sonner";
import {
  getContainerInventory,
  updateInventoryPo,
} from "@/features/incoming-inventory/inventory/api";
import { useGetPurchaseOrderDetail } from "@/features/incoming-inventory/po/hook";

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
  const {
    data: purchaseOrder,
    isLoading: isLoadingPurchaseOrder,
    isError: isErrorPurchaseOrder,
  } = useGetPurchaseOrderDetail(po_id);

  console.log(purchaseOrder);

  const handleLogInventory = async (
    containerId: string,
    deliveryDate?: string,
  ) => {
    if (!deliveryDate) {
      toast.error("Delivery date is required before loading inventory.");
      return;
    }

    try {
      const inventory = await getContainerInventory(containerId);
      console.log("Container inventory:", inventory);
      console.log("Container delivery date:", deliveryDate);

      if (inventory.length === 0) {
        return;
      }

      await Promise.all(
        inventory.map((item) =>
          updateInventoryPo(item.id, {
            container_id: containerId,
            product_id: item.product.id,
            quantity: item.quantity,
            unit_cost: item.unit_cost,
            total_cost: item.total_cost,
            description: item.description,
            list_delivery_date: deliveryDate,
          }),
        ),
      );
      toast.success("Inventory delivery date updated.");
    } catch (error) {
      console.error("Failed to load container inventory", error);
      toast.error("Failed to load container inventory.");
    }
  };

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
                <AddContainerDialog purchaseOrderId={po_id} container={item} />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleLogInventory(item.id, item.date_of_delivery)
                  }
                  aria-label="Log container inventory"
                >
                  <FolderUp className="h-4 w-4 text-secondary" />
                </Button>
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
                Date of issue:{" "}
                <span className="text-secondary font-semibold">
                  {formatDateDDMMYYYY(item.date_of_issue)}
                </span>
              </div>
              <div>
                Date of delivery:{" "}
                <span className="text-secondary font-semibold">
                  {formatDateDDMMYYYY(item.date_of_delivery)}
                </span>
              </div>
            </CardContent>
            <CardFooter>
              <InventorySelect
                containerId={item.id}
                po_id={po_id}
                // delivery_date={item.date_if_shipment}
              />
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
};

export default ListContainers;
