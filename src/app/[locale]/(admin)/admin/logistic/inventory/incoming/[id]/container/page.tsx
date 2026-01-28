import POContainer from "@/components/layout/admin/incoming-inventory/po-container";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params; // ✅ BẮT BUỘC

  return <POContainer id={id} />;
}
