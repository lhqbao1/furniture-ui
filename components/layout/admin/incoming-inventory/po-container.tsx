"use client";
import { useGetPurchaseOrderDetail } from "@/features/incoming-inventory/po/hook";
import React from "react";
import AddContainerDialog from "./dialog/add-container-dialog";
import ListContainers from "./container/list-container";

interface POContainerProps {
  id: string;
}

const POContainer = ({ id }: POContainerProps) => {
  const { data, isLoading, isError } = useGetPurchaseOrderDetail(id);

  return (
    <div>
      <h2 className="text-secondary text-center">
        Containers of {data?.po_number}
      </h2>
      {data && (
        <div className="text-left ">
          <AddContainerDialog purchaseOrderId={id} />
        </div>
      )}
      <ListContainers po_id={id} />
    </div>
  );
};

export default POContainer;
