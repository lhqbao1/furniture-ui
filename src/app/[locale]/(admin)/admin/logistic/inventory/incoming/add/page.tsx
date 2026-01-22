import AddIncomingInventoryForm from "@/components/layout/admin/incoming-inventory/add-incoming-inventory-form";
import React from "react";

const CreateIncomingInventory = () => {
  return (
    <div className="space-y-6 mt-6">
      <AddIncomingInventoryForm />
      <div>List products with container wrapped</div>
    </div>
  );
};

export default CreateIncomingInventory;
