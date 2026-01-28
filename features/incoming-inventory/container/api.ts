import { apiAdmin } from "@/lib/axios";
import { ContainerValues } from "@/lib/schema/incoming-inventory";
import { POContainerDetail } from "@/types/po";

interface UpdatePOContainerParams {
  containerId: string;
  input: ContainerValues;
}

export async function createPOContainer(
  input: ContainerValues,
): Promise<POContainerDetail> {
  const { data } = await apiAdmin.post("/po/container", input, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("admin_access_token")}`,
    },
    withCredentials: true,
  });

  return data;
}

export async function updatePOContainer({
  containerId,
  input,
}: UpdatePOContainerParams): Promise<POContainerDetail> {
  const { data } = await apiAdmin.put(`/po/container/${containerId}`, input, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("admin_access_token")}`,
    },
    withCredentials: true,
  });

  return data;
}

export async function getContainersByPurchaseOrder(
  purchaseOrderId: string,
): Promise<POContainerDetail[]> {
  const { data } = await apiAdmin.get(
    `/po/purchase-order/container/${purchaseOrderId}`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("admin_access_token")}`,
      },
      withCredentials: true,
    },
  );

  return data;
}
