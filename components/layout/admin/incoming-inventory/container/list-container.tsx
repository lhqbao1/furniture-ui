import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  useGetContainersByPurchaseOrder,
  useSendContainerToAmm,
} from "@/features/incoming-inventory/container/hook";
import React from "react";
import AddContainerDialog from "../dialog/add-container-dialog";
import { formatDateDDMMYYYY } from "@/lib/date-formated";
import DeleteDialogConfirm from "../dialog/delete-dialog-confirm";
import InventorySelect from "./inventory-select";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { FolderUp } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  getContainerInventory,
  updateInventoryPo,
} from "@/features/incoming-inventory/inventory/api";
import { useContainerInventory } from "@/features/incoming-inventory/inventory/hook";
import { POContainerDetail } from "@/types/po";
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
  const sendContainerToAmmMutation = useSendContainerToAmm();
  const [pendingContainerId, setPendingContainerId] = React.useState<
    string | null
  >(null);
  const pendingContainerIdRef = React.useRef<string | null>(null);

  const handleLogInventory = async (container: POContainerDetail) => {
    if (pendingContainerIdRef.current === container.id) return;
    const missing: string[] = [];
    if (!container.container_number) missing.push("container number");
    if (!container.date_if_shipment) missing.push("date of shipment");
    if (!container.date_of_inspection) missing.push("date of inspection");
    if (!container.date_of_issue) missing.push("date of issue");
    if (!container.date_of_delivery) missing.push("date of delivery");
    if (!container.date_to_warehouse) missing.push("date to warehouse");

    if (missing.length > 0) {
      toast.error(`Missing: ${missing.join(", ")}`);
      return;
    }

    try {
      pendingContainerIdRef.current = container.id;
      setPendingContainerId(container.id);
      const inventory = await getContainerInventory(container.id);

      if (inventory.length === 0) {
        toast.error("Please add at least one inventory item first.");
        return;
      }

      await Promise.all(
        inventory.map((item) =>
          updateInventoryPo(item.id, {
            container_id: container.id,
            product_id: item.product.id,
            quantity: item.quantity,
            unit_cost: item.unit_cost,
            total_cost: item.total_cost,
            description: item.description,
            list_delivery_date: container.date_to_warehouse!,
          }),
        ),
      );
      await sendContainerToAmmMutation.mutateAsync(container.id);
      toast.success("Inventory delivery date updated.");
    } catch (error) {
      console.error("Failed to load container inventory", error);
      toast.error("Failed to load container inventory.");
    } finally {
      pendingContainerIdRef.current = null;
      setPendingContainerId(null);
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
      {data.map((item) => (
        <ContainerCard
          key={item.id}
          item={item}
          po_id={po_id}
          onLogInventory={handleLogInventory}
          isLogging={pendingContainerId === item.id}
        />
      ))}
    </div>
  );
};

export default ListContainers;

function ContainerCard({
  item,
  po_id,
  onLogInventory,
  isLogging,
}: {
  item: POContainerDetail;
  po_id: string;
  onLogInventory: (container: POContainerDetail) => void;
  isLogging: boolean;
}) {
  const { data: containerInventory } = useContainerInventory(item.id);
  const hasInventory = (containerInventory?.length ?? 0) > 0;
  const canSendAmm =
    item.is_sended_avis === false || item.is_sended_avis === null;
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <div>
            Container Number:{" "}
            <span
              className={
                item.container_number
                  ? "text-secondary font-semibold"
                  : "text-red-500"
              }
            >
              {item.container_number || "Missing"}
            </span>
          </div>
        </CardTitle>
        {item.is_sended_avis && (
          <CardDescription>
            <Badge variant="secondary" className="text-white">
              Sent to AMM: {item.avis_code}
            </Badge>
          </CardDescription>
        )}
        <CardAction className="space-x-2">
          <AddContainerDialog purchaseOrderId={po_id} container={item} />
          {hasInventory && canSendAmm && (
            <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  aria-label="Log container inventory"
                  disabled={isLogging}
                  aria-busy={isLogging}
                >
                  <FolderUp className="h-4 w-4 text-secondary" />
                </Button>
              </DialogTrigger>
              <DialogContent className="w-100">
                <DialogHeader>
                  <DialogTitle className="text-lg">Send PO to AMM</DialogTitle>
                  <DialogDescription className="text-base">
                    This will update inventory delivery dates and send the
                    container to AMM.This action can not be undo, Continue?
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setConfirmOpen(false)}
                    disabled={isLogging}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      onLogInventory(item);
                      setConfirmOpen(false);
                    }}
                    disabled={isLogging}
                  >
                    Confirm
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          <DeleteDialogConfirm containerId={item.id} />
        </CardAction>
      </CardHeader>
      <CardContent>
        <div>
          Date of issue PO:{" "}
          <span
            className={
              item.date_of_issue
                ? "text-secondary font-semibold"
                : "text-red-500"
            }
          >
            {item.date_of_issue
              ? formatDateDDMMYYYY(item.date_of_issue)
              : "Missing"}
          </span>
        </div>

        <div>
          Date of Inspection:{" "}
          <span
            className={
              item.date_of_inspection
                ? "text-secondary font-semibold"
                : "text-red-500"
            }
          >
            {item.date_of_inspection
              ? formatDateDDMMYYYY(item.date_of_inspection)
              : "Missing"}
          </span>
        </div>

        <div>
          Date of Shipment (ETD):{" "}
          <span
            className={
              item.date_if_shipment
                ? "text-secondary font-semibold"
                : "text-red-500"
            }
          >
            {item.date_if_shipment
              ? formatDateDDMMYYYY(item.date_if_shipment)
              : "Missing"}
          </span>
        </div>

        <div>
          Port Arrival Date:{" "}
          <span
            className={
              item.date_of_delivery
                ? "text-secondary font-semibold"
                : "text-red-500"
            }
          >
            {item.date_of_delivery
              ? formatDateDDMMYYYY(item.date_of_delivery)
              : "Missing"}
          </span>
        </div>

        <div>
          Warehouse Arrival Date:
          <span
            className={
              item.date_to_warehouse
                ? "text-secondary font-semibold"
                : "text-red-500"
            }
          >
            {item.date_to_warehouse
              ? formatDateDDMMYYYY(item.date_to_warehouse)
              : "Missing"}
          </span>
        </div>

        <div>
          Size:{" "}
          <span
            className={
              item.size ? "text-secondary font-semibold" : "text-red-500"
            }
          >
            {item.size || "Missing"}
          </span>
        </div>
      </CardContent>
      <CardFooter>
        <InventorySelect containerId={item.id} po_id={po_id} />
      </CardFooter>
    </Card>
  );
}
