import { redirect } from "next/navigation";

const AffiliateEventsRoute = ({ params }: { params: { locale: string } }) => {
  redirect(`/${params.locale}/affiliate?tab=events`);
};

export default AffiliateEventsRoute;
