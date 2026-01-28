import EditIncomingInventoryForm from "@/components/layout/admin/incoming-inventory/edit-incoming-inventory-form";

interface EditIncomingInventoryPageProps {
  params: {
    id: string;
  };
}

const EditIncomingInventory = ({ params }: EditIncomingInventoryPageProps) => {
  const { id } = params;

  return (
    <div className="space-y-6 my-6">
      <EditIncomingInventoryForm id={id} />
    </div>
  );
};

export default EditIncomingInventory;
