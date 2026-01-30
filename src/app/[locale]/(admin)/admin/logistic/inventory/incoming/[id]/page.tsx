import AdminBackButton from "@/components/layout/admin/admin-back-button";
import EditIncomingInventoryForm from "@/components/layout/admin/incoming-inventory/edit-incoming-inventory-form";

interface EditIncomingInventoryPageProps {
  params: Promise<{
    id: string;
  }>;
}

const EditIncomingInventory = async ({
  params,
}: EditIncomingInventoryPageProps) => {
  const { id } = await params; // ✅ BẮT BUỘC

  return (
    <div className="space-y-6 my-6">
      <AdminBackButton />
      <EditIncomingInventoryForm id={id} />
    </div>
  );
};

export default EditIncomingInventory;
