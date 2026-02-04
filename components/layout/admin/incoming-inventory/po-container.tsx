"use client";
import { useGetPurchaseOrderDetail } from "@/features/incoming-inventory/po/hook";
import React from "react";
import AddContainerDialog from "./dialog/add-container-dialog";
import ListContainers from "./container/list-container";
import { Button } from "@/components/ui/button";
import AdminBackButton from "../admin-back-button";

interface POContainerProps {
  id: string;
}

const POContainer = ({ id }: POContainerProps) => {
  const { data, isLoading, isError } = useGetPurchaseOrderDetail(id);

  return (
    <div className="mb-6">
      <h2 className="text-secondary text-center">
        Containers of {data?.po_number}
      </h2>
      {data && (
        <div className="text-left ">
          <AddContainerDialog
            purchaseOrderId={id}
            currentContainer={data.number_of_containers ?? 0}
          />
        </div>
      )}
      <ListContainers po_id={id} />
    </div>
  );
};

export default POContainer;
