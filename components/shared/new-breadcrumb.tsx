"use client";

import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { Link } from "@/src/i18n/navigation"; // chỉnh path theo project của bạn
import { useTranslations } from "next-intl";

interface BreadcrumbItemType {
  title: string;
  link: string;
}

interface CustomBreadcrumbProps {
  parentPage?: BreadcrumbItemType | null;
  currentPage: BreadcrumbItemType;
}

export default function CustomBreadCrumb({
  parentPage,
  currentPage,
}: CustomBreadcrumbProps) {
  const t = useTranslations();
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {/* HOME */}
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/">{t("home")}</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {/* SEPARATOR */}
        {parentPage && <BreadcrumbSeparator />}

        {/* PARENT PAGE (optional) */}
        {parentPage && (
          <>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={parentPage.link}>{parentPage.title}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </>
        )}

        {/* CURRENT PAGE */}
        {!parentPage && <BreadcrumbSeparator />}
        <BreadcrumbItem>
          <BreadcrumbPage>{currentPage.title}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
