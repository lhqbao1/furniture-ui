import { redirect } from "next/navigation";

const page = ({ params }: { params: { locale: string } }) => {
  redirect(`/${params.locale}/dsp/admin/orders/list/preparing`);
};

export default page;
