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

interface ListContainersProps {
  po_id: string;
}

const ListContainers = ({ po_id }: ListContainersProps) => {
  const { data, isLoading, isError } = useGetContainersByPurchaseOrder(po_id);
  console.log(data);
  if (!data) return <div>no</div>;
  return (
    <div className="grid grid-cols-2 gap-4 mt-6">
      {data.map((item, index) => {
        return (
          <Card key={item.id}>
            <CardHeader>
              <CardTitle>{item.container_number}</CardTitle>
              <CardDescription>Card Description</CardDescription>
              <CardAction>Card Action</CardAction>
            </CardHeader>
            <CardContent>
              <p>Card Content</p>
            </CardContent>
            <CardFooter>
              <p>Card Footer</p>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
};

export default ListContainers;
