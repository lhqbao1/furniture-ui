"use client";
import React, { useEffect, useMemo, useState, useTransition } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useQuery } from "@tanstack/react-query";
import { getPolicyItemsByVersion } from "@/features/policy/api";
import { Loader2 } from "lucide-react";
import { PolicyResponse, PolicyVersion } from "@/types/policy";
import { useLocale } from "next-intl";
import { useRouter } from "@/src/i18n/navigation";
import { formatDate } from "@/lib/date-formated";
import { usePathname } from "next/navigation";
import { useSmoothScrollToRef } from "@/hooks/scrollToRef";
import { sanitizeBodyHtml } from "@/lib/sanitize-body-html";
import {
  findPolicyByPathname,
  findPolicyByRouteKey,
  getPolicyHrefByName,
  type PolicyRouteKey,
} from "@/lib/policy-route";

interface ListPolicyProps {
  versionId: string;
  versionData: PolicyVersion[];
  initialPolicy?: PolicyResponse;
  policyId?: string;
  versionName?: string;
  isAdmin?: boolean;
  activePolicyKey?: PolicyRouteKey;
}

function getInitialOpenPolicyId(
  policies: PolicyResponse["legal_policies"] | undefined,
  activePolicyKey?: PolicyRouteKey,
) {
  if (!policies?.length) return "";

  const activePolicy = findPolicyByRouteKey(policies, activePolicyKey);
  if (activePolicy) return activePolicy.id;

  return activePolicyKey ? "" : policies[0]?.id ?? "";
}

const ListPolicy = ({
  versionId,
  versionData,
  initialPolicy,
  isAdmin = false,
  activePolicyKey,
}: ListPolicyProps) => {
  const [openAccordion, setOpenAccordion] = useState<string>(() =>
    getInitialOpenPolicyId(initialPolicy?.legal_policies, activePolicyKey),
  );
  const [isNavigating, setIsNavigating] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const locale = useLocale();
  const [currentVersion, setCurrentVersion] = useState(versionId);
  const pathname = usePathname();
  const { registerRef } = useSmoothScrollToRef<HTMLDivElement>();

  const { data: policy, isLoading } = useQuery({
    queryKey: ["policy-items", currentVersion],
    queryFn: () => getPolicyItemsByVersion(currentVersion),
    enabled: !!currentVersion,
    initialData: currentVersion === versionId ? initialPolicy : undefined,
  });

  const filteredPolicies = useMemo(
    () => policy?.legal_policies ?? [],
    [policy?.legal_policies],
  );
  const isRouteLoading = isNavigating || isPending;

  const isSamePolicyRoute = (href: string) => {
    const normalizedPath = pathname?.replace(/\/+$/, "") ?? "";
    const normalizedHref = href.replace(/\/+$/, "");
    return (
      normalizedPath === normalizedHref ||
      normalizedPath === `/${locale}${normalizedHref}`
    );
  };

  useEffect(() => {
    const matchedItem =
      findPolicyByRouteKey(filteredPolicies, activePolicyKey) ??
      findPolicyByPathname(filteredPolicies, pathname);

    if (matchedItem && matchedItem.id !== openAccordion) {
      setOpenAccordion(matchedItem.id);
    }
  }, [activePolicyKey, filteredPolicies, openAccordion, pathname]);

  useEffect(() => {
    setIsNavigating(false);
  }, [pathname]);

  // tìm current policy dựa trên accordion đang mở
  const currentPolicy =
    filteredPolicies.find((p) => p.id === openAccordion) ??
    findPolicyByRouteKey(filteredPolicies, activePolicyKey) ??
    (activePolicyKey ? undefined : filteredPolicies[0]);

  if (isLoading && filteredPolicies.length === 0)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-secondary" />
      </div>
    );
  if (!versionId) return <></>;
  if (!currentPolicy)
    return (
      <div className="flex min-h-screen items-center justify-center px-4 text-center text-gray-500">
        Keine passende Richtlinie gefunden. Bitte legen Sie den passenden
        Rechtstext im Admin-Bereich an.
      </div>
    );

  return (
    <div className="flex min-h-screen lg:pt-12 pt-3 pb-4 gap-6">
      {/* Sidebar bên trái */}
      <div className="hidden lg:block w-1/3 border-r sticky top-10">
        <div className="sticky top-42 max-h-[calc(100vh-2.5rem)] overflow-y-auto">
          <Accordion
            type="single"
            collapsible
            className="w-full"
            value={openAccordion ?? undefined}
            onValueChange={(val) => setOpenAccordion(val)}
          >
            {filteredPolicies.map((item) => (
              <AccordionItem
                value={item.id}
                key={item.id}
              >
                <AccordionTrigger
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    if (isAdmin) {
                      setOpenAccordion(item.id);
                    } else {
                      const href = getPolicyHrefByName(item.name);
                      if (isSamePolicyRoute(href)) {
                        setOpenAccordion(item.id);
                        setIsNavigating(false);
                        return;
                      }
                      setIsNavigating(true);
                      startTransition(() => {
                        router.push(href, { locale });
                      });
                    }
                  }}
                >
                  <div className="pr-6 cursor-pointer font-bold">
                    {item.name}
                  </div>
                </AccordionTrigger>
                {/* {item.name === "Impressum" ? (
                  ""
                ) : (
                  <AccordionContent className="flex flex-col gap-1.5 text-balance">
                    {item.child_legal_policies.map((child, policyItemIndex) => (
                      <div
                        key={child.id}
                        className={cn(
                          "cursor-pointer hover:underline lg:pl-6 pl-2 relative",
                          currentPolicy?.id === item.id &&
                            currentPolicyItem === policyItemIndex
                            ? "bg-secondary/20 hover:bg-secondary-20 px-2 py-1 font-semibold"
                            : "",
                        )}
                        onClick={() => {
                          setCurrentPolicyItem(policyItemIndex);
                          // delay 1 tick để đảm bảo DOM ổn định rồi mới scroll
                          setTimeout(() => {
                            scrollTo(`${item.id}-${policyItemIndex}`, -190);
                          }, 200);
                        }}
                      >
                        {child.label}
                        <div
                          className={cn(
                            "absolute w-1 h-full bg-secondary right-0 top-0",
                            currentPolicy?.id === item.id &&
                              currentPolicyItem === policyItemIndex
                              ? "block"
                              : "hidden",
                          )}
                        />
                      </div>
                    ))}
                  </AccordionContent>
                )} */}
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>

      {/* Nội dung bên phải */}
      <div
        // ref={setContainer}
        className="relative w-full lg:w-2/3 px-3 lg:px-12 space-y-6 lg:pb-8 pb-3 overflow-x-hidden content-scroll min-h-screen flex-1 max-h-full overflow-y-auto"
      >
        {isRouteLoading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/55 backdrop-blur-sm">
            <Loader2 className="h-6 w-6 animate-spin text-secondary" />
          </div>
        )}
        <h1 className="text-center lg:text-3xl text-2xl text-secondary font-semibold uppercase text-wrap">
          {currentPolicy?.name}
        </h1>

        {currentPolicy?.child_legal_policies.map((cl, clIndex) => {
          // const refKey = `${cl.id}-${clIndex}`
          return (
            <div
              key={cl.id}
              ref={(el) => registerRef(`${currentPolicy.id}-${clIndex}`, el)}
            >
              <div className="text-xl text-secondary font-bold">
                {cl.label ?? ""}
              </div>
              {typeof cl?.content === "string" && cl.content.trim() !== "" ? (
                <div
                  dangerouslySetInnerHTML={{
                    __html: sanitizeBodyHtml(cl.content),
                  }}
                  className="[&_a]:text-secondary [&_a]:underline"
                />
              ) : (
                <p className="text-gray-500 italic">Updated...</p>
              )}
            </div>
          );
        })}

        {/* <div className="lg:mt-12 mt-6">
          {currentPolicy.name.toLowerCase().includes("widerruf") && (
            <div className="flex justify-center col-span-12">
              {" "}
              <Button
                variant={"outline"}
                className="border border-black rounded-sm"
              >
                {" "}
                <a
                  href="/file/Widerruf.pdf"
                  download
                  className="cursor-pointer flex gap-1 items-center"
                >
                  {" "}
                  {t("download")}{" "}
                  <Image
                    src={"/pdf.png"}
                    width={15}
                    height={15}
                    alt=""
                    unoptimized
                  />{" "}
                </a>{" "}
              </Button>{" "}
            </div>
          )}
          {currentPolicy.name.toLowerCase().includes("agb") && (
            <div className="flex justify-center col-span-12">
              {" "}
              <Button
                variant={"outline"}
                className="border border-black rounded-sm"
              >
                {" "}
                <a
                  href="/file/AGB.pdf"
                  download
                  className="cursor-pointer flex gap-1 items-center"
                >
                  {" "}
                  {t("download")}{" "}
                  <Image
                    src={"/pdf.png"}
                    width={15}
                    height={15}
                    alt=""
                    unoptimized
                  />{" "}
                </a>{" "}
              </Button>{" "}
            </div>
          )}
        </div> */}

        {/* Version section */}
        {versionData[0] && (
          <div className="flex flex-col items-end col-span-12 lg:mt-12 mt-4 mb-3 lg:mb-0">
            <div
              className={`text-secondary cursor-pointer ${
                versionData[0].id === currentVersion ? "font-bold" : ""
              }`}
              onClick={() => setCurrentVersion(versionData[0].id)}
            >
              Stand: {formatDate(versionData[0].created_at)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListPolicy;
