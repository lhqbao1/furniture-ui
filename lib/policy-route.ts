import type { LegalPolicy } from "@/types/policy";

export type PolicyRouteKey =
  | "agb"
  | "impressum"
  | "privacy"
  | "shipping"
  | "payment"
  | "cancellation"
  | "returnRefund";

type PolicyRouteConfig = {
  href: string;
  tokens: string[];
};

export const POLICY_ROUTE_CONFIGS: Record<
  PolicyRouteKey,
  PolicyRouteConfig
> = {
  agb: {
    href: "/agb",
    tokens: ["agb", "allgemeine geschaftsbedingungen"],
  },
  impressum: {
    href: "/impressum",
    tokens: ["impressum"],
  },
  privacy: {
    href: "/datenschutzerklaerung",
    tokens: ["datenschutzerklarung", "datenschutz", "privacy"],
  },
  shipping: {
    href: "/versandbedingungen",
    tokens: ["versandbedingungen", "lieferbedingungen", "versand"],
  },
  payment: {
    href: "/zahlungsbedingungen",
    tokens: ["zahlungsbedingungen", "zahlung"],
  },
  cancellation: {
    href: "/widerrufsbelehrung",
    tokens: ["widerrufsbelehrung", "widerruf"],
  },
  returnRefund: {
    href: "/rueckgabe-und-erstattung",
    tokens: ["ruckgabe", "retoure", "erstattung", "return", "refund"],
  },
};

const POLICY_ROUTE_ORDER: PolicyRouteKey[] = [
  "agb",
  "impressum",
  "privacy",
  "shipping",
  "payment",
  "cancellation",
  "returnRefund",
];

export function normalizePolicyText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/ä/g, "a")
    .replace(/ö/g, "o")
    .replace(/ü/g, "u")
    .replace(/ß/g, "ss")
    .replace(/\s+/g, " ")
    .trim();
}

export function getPolicyRouteKeyFromName(name: string) {
  const normalizedName = normalizePolicyText(name);

  return (
    POLICY_ROUTE_ORDER.find((key) =>
      POLICY_ROUTE_CONFIGS[key].tokens.some((token) =>
        normalizedName.includes(token),
      ),
    ) ?? null
  );
}

export function getPolicyRouteKeyFromPathname(pathname?: string | null) {
  if (!pathname) return null;

  const normalizedPath = normalizePolicyText(pathname);

  return (
    POLICY_ROUTE_ORDER.find((key) =>
      normalizedPath.includes(POLICY_ROUTE_CONFIGS[key].href.replace("/", "")),
    ) ?? null
  );
}

export function getPolicyHrefByName(name: string) {
  const routeKey = getPolicyRouteKeyFromName(name);
  return routeKey ? POLICY_ROUTE_CONFIGS[routeKey].href : "/agb";
}

export function findPolicyByRouteKey(
  policies: LegalPolicy[],
  routeKey?: PolicyRouteKey,
) {
  if (!routeKey) return undefined;

  const tokens = POLICY_ROUTE_CONFIGS[routeKey].tokens;

  return policies.find((policy) => {
    const normalizedName = normalizePolicyText(policy.name);
    return tokens.some((token) => normalizedName.includes(token));
  });
}

export function findPolicyByPathname(
  policies: LegalPolicy[],
  pathname?: string | null,
) {
  const routeKey = getPolicyRouteKeyFromPathname(pathname);
  return findPolicyByRouteKey(policies, routeKey ?? undefined);
}
