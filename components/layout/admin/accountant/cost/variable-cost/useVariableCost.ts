import { useGetCheckOutDashboard } from "@/features/checkout/hook";
import {
  useCreateVariableFee,
  useDeleteVariableFee,
  useGetVariableFeeByMarketplaceAndTime,
  useUpdateVariableFee,
} from "@/features/variable-cost/hook";
import { getMonthDateRange } from "@/lib/getMonthDateRange";
import { VariableMarketplaceUI } from "@/types/variable-fee";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const DEFAULT_MARKETPLACES = [
  "amazon",
  "ebay",
  "kaufland",
  "netto",
  "freakout",
  "prestige_home",
];

const DEFAULT_FEES_BY_MARKETPLACE: Record<string, string[]> = {
  default: ["percent"],
  prestige_home: ["percent"],
};

const getDefaultFees = (marketplace: string): string[] => {
  return (
    DEFAULT_FEES_BY_MARKETPLACE[marketplace] ??
    DEFAULT_FEES_BY_MARKETPLACE.default
  );
};

const buildEmptyMarketplaces = (): VariableMarketplaceUI[] =>
  DEFAULT_MARKETPLACES.map((m) => ({
    marketplace: m,
    fees: getDefaultFees(m).map((f) => ({
      marketplace: m,
      type: f,
      amount: "",
    })),
  }));

interface useVariableCostProps {
  month: number;
  year: number;
  setMonth: (month: number) => void;
  setYear: (year: number) => void;
}

export function useVariableCost({
  month,
  year,
  setMonth,
  setYear,
}: useVariableCostProps) {
  const createMutation = useCreateVariableFee();
  const updateMutation = useUpdateVariableFee();
  const deleteMutation = useDeleteVariableFee();

  /* INIT STATE */
  const [marketplaces, setMarketplaces] = useState<VariableMarketplaceUI[]>(
    DEFAULT_MARKETPLACES.map((m) => ({
      marketplace: m,
      fees: getDefaultFees(m).map((f) => ({
        marketplace: m,
        type: f,
        amount: "",
      })),
    })),
  );

  /* ADD MARKETPLACE */
  const addMarketplace = (name: string) => {
    setMarketplaces((prev) => [
      ...prev,
      {
        marketplace: name,
        fees: getDefaultFees(name).map((f) => ({
          marketplace: name,
          type: f,
          amount: "",
        })),
      },
    ]);
  };

  /* ADD FEE */
  const addFee = (marketplace: string, type: string) => {
    setMarketplaces((prev) =>
      prev.map((m) =>
        m.marketplace === marketplace
          ? {
              ...m,
              fees: [...m.fees, { marketplace, type, amount: "" }],
            }
          : m,
      ),
    );
  };

  /* UPDATE AMOUNT */
  const updateAmount = (
    marketplace: string,
    type: string,
    amount: number | "",
  ) => {
    setMarketplaces((prev) =>
      prev.map((m) =>
        m.marketplace === marketplace
          ? {
              ...m,
              fees: m.fees.map((f) => (f.type === type ? { ...f, amount } : f)),
            }
          : m,
      ),
    );
  };

  /* REMOVE FEE */
  const removeFee = async (marketplace: string, type: string) => {
    const target = marketplaces
      .find((m) => m.marketplace === marketplace)
      ?.fees.find((f) => f.type === type);

    if (!target) return;

    try {
      const id = target.id; // unified

      if (id) {
        await deleteMutation.mutateAsync(id);
        toast.success("Variable fee deleted");
      }

      setMarketplaces((prev) =>
        prev.map((m) =>
          m.marketplace === marketplace
            ? {
                ...m,
                fees: m.fees.filter((f) => f.type !== type),
              }
            : m,
        ),
      );
    } catch {
      toast.error("Failed to delete variable fee");
    }
  };

  /* SUBMIT (CREATE / UPDATE) */
  const submit = async () => {
    try {
      let created = 0;
      let updated = 0;

      for (const m of marketplaces) {
        for (const fee of m.fees) {
          if (
            fee.amount === "" ||
            fee.amount === null ||
            fee.amount === undefined
          )
            continue;

          const payload = {
            marketplace: m.marketplace,
            type: fee.type,
            month,
            year,
            amount: Number(fee.amount), // 0 ok
          };

          if (fee.id) {
            if (Number(fee.amount) !== Number(fee.originalAmount)) {
              await updateMutation.mutateAsync({
                id: fee.id,
                input: payload,
              });
              updated++;
            }
          } else {
            await createMutation.mutateAsync(payload);
            created++;
          }
        }
      }

      toast.success(
        `Variable costs saved: ${created} created, ${updated} updated`,
      );
    } catch {
      toast.error("Failed to save variable costs");
    }
  };

  const { data: variableFeeData } = useGetVariableFeeByMarketplaceAndTime({
    year,
    month,
  });

  const { from_date, to_date } = useMemo(() => {
    return getMonthDateRange(year, month);
  }, [month, year]);

  const { data: marketplaceData } = useGetCheckOutDashboard({
    from_date,
    to_date,
  });

  useEffect(() => {
    setMarketplaces(buildEmptyMarketplaces());
  }, [month, year]);

  useEffect(() => {
    if (!variableFeeData) return;

    setMarketplaces((prev) =>
      prev.map((m) => {
        const marketplaceData = variableFeeData[m.marketplace];

        if (!marketplaceData || typeof marketplaceData === "number") {
          return m;
        }

        const apiFees = marketplaceData.type;

        // map existing fees
        const updatedFees = m.fees.map((fee) => {
          const matched = apiFees.find((f) => f.type === fee.type);

          return matched
            ? {
                ...fee,
                id: matched.ids[0], // unified here
                amount: matched.amount,
                originalAmount: matched.amount,
              }
            : fee;
        });

        // add fees that exist in API but not in UI
        const newFeesFromApi = apiFees.filter(
          (apiFee) => !m.fees.some((uiFee) => uiFee.type === apiFee.type),
        );

        return {
          ...m,
          fees: [
            ...updatedFees,
            ...newFeesFromApi.map((f) => ({
              marketplace: m.marketplace,
              type: f.type,
              id: f.ids[0],
              amount: f.amount,
              originalAmount: f.amount,
            })),
          ],
        };
      }),
    );
  }, [variableFeeData]);

  return {
    marketplaces,
    addMarketplace,
    addFee,
    updateAmount,
    removeFee,
    submit,
    marketplaceData,
    variableFeeData,
    isSubmitting: createMutation.isPending || updateMutation.isPending,
  };
}
