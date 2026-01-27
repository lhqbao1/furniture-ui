import { apiAdmin } from "@/lib/axios";
import { ContactPersonDetail } from "@/types/po";

export interface POContactPersonInput {
  name: string;
  email: string;
  phone_number: string;
  customer_id: string;
}

export async function createContactPerson(input: POContactPersonInput) {
  const { data } = await apiAdmin.post("/po/contact-person", input, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("admin_access_token")}`,
    },
    withCredentials: true,
  });

  return data;
}

export async function updateContactPerson(
  contactPersonId: string,
  input: POContactPersonInput,
) {
  const { data } = await apiAdmin.put(
    `/po/contact-person/${contactPersonId}`,
    input,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("admin_access_token")}`,
      },
      withCredentials: true,
    },
  );

  return data;
}

export async function getContactPersonDetail(
  contactPersonId: string,
): Promise<ContactPersonDetail> {
  const { data } = await apiAdmin.get(
    `/po/contact-person/details/${contactPersonId}`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("admin_access_token")}`,
      },
      withCredentials: true,
    },
  );

  return data;
}

export async function getAllContactPersons(): Promise<ContactPersonDetail[]> {
  const { data } = await apiAdmin.get("/po/contact-person/all", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("admin_access_token")}`,
    },
    withCredentials: true,
  });

  return data;
}

export async function deleteContactPerson(contactPersonId: string) {
  const { data } = await apiAdmin.delete(
    `/po/contact-person/${contactPersonId}`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("admin_access_token")}`,
      },
      withCredentials: true,
    },
  );

  return data;
}
