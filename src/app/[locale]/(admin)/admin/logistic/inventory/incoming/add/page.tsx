import AdminBackButton from "@/components/layout/admin/admin-back-button";
import AddIncomingInventoryForm from "@/components/layout/admin/incoming-inventory/add-incoming-inventory-form";
import React from "react";

const CreateIncomingInventory = () => {
  return (
    <div className="space-y-6 my-6">
      <AdminBackButton />
      <AddIncomingInventoryForm />
    </div>
  );
};

export default CreateIncomingInventory;
