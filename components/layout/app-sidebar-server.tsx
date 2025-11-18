import {
  getCategoriesWithChildren,
  serverGetCategories,
} from "@/features/category/api";
import AppSidebarClient from "./app-sidebar";

interface AppSideBarServerProps {
  defaultOpen?: boolean;
}

const AppSidebarServer = async ({
  defaultOpen = true,
}: AppSideBarServerProps) => {
  const categories = await getCategoriesWithChildren();
  return (
    <AppSidebarClient
      categories={categories}
      defaultOpen={defaultOpen}
    />
  );
};

export default AppSidebarServer;
