import { apiAdmin } from "@/lib/axios";
import { BankInfoDetail } from "@/types/po";

export type POBankInput = {
  bank_name: string;
  account_no: string;
  account_name?: string;
  currency: string;
  swift_code: string;
  customer_id: string;
  address: string;
};

export async function createBankInfo(input: POBankInput) {
  const { data } = await apiAdmin.post("/po/bank-info", input, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("admin_access_token")}`,
    },
    withCredentials: true,
  });

  return data;
}

export async function updateBankInfo(bank_info_id: string, input: POBankInput) {
  const { data } = await apiAdmin.put(`/po/bank-info/${bank_info_id}`, input, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("admin_access_token")}`,
    },
    withCredentials: true,
  });

  return data;
}

export async function deleteBankInfo(bank_info_id: string) {
  const { data } = await apiAdmin.delete(`/po/bank-info/${bank_info_id}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("admin_access_token")}`,
    },
    withCredentials: true,
  });

  return data;
}

export async function getBankInfoDetail(bank_info_id: string) {
  const { data } = await apiAdmin.get(`/po/bank-info/details/${bank_info_id}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("admin_access_token")}`,
    },
    withCredentials: true,
  });

  return data as BankInfoDetail;
}

export async function getAllBankInfo() {
  const { data } = await apiAdmin.get("/po/bank-info/all", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("admin_access_token")}`,
    },
    withCredentials: true,
  });

  return data as BankInfoDetail[];
}
