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

interface ListContainersProps {
  po_id: string;
}

const ListContainers = ({ po_id }: ListContainersProps) => {
  const { data, isLoading, isError } = useGetContainersByPurchaseOrder(po_id);
  if (!data) return <div>no</div>;
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
