import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { getFixedFeeWithTime } from "@/features/fixed-fee/api";
import {
  useCreateFixedFee,
  useDeleteFixedFee,
  useUpdateFixedFee,
} from "@/features/fixed-fee/hook";
import { CreateFixedFeeValues } from "@/lib/schema/fixed-cost";

export interface FixedCostItemUI {
  type: string;
  amount: number | "";
  isCloned?: boolean;

  id?: string; // id của fixed_fee (nếu có)
  originalAmount?: number; // giá trị từ DB
}

const DEFAULT_FIXED_COSTS = [
  "Warehouse",
  "Facebook Marketing",
  "Google Marketing",
  "Office",
  "Vietnam Employee",
  "German Employee",
  "Austria Employee",
  "Bank Interest",
];

export function useFixedCostForm() {
  const now = new Date();

  const [month, setMonth] = useState<number>(now.getMonth() + 1);
  const [year, setYear] = useState<number>(now.getFullYear());

  const [items, setItems] = useState<FixedCostItemUI[]>(
    DEFAULT_FIXED_COSTS.map((type) => ({ type, amount: "" })),
  );

  const [baseMonthItems, setBaseMonthItems] = useState<FixedCostItemUI[]>([]);
  const [hasCloned, setHasCloned] = useState(false);

  const createFixedFeeMutation = useCreateFixedFee();
  const updateFixedFeeMutation = useUpdateFixedFee();
  const deleteFixedFeeMutation = useDeleteFixedFee();

  const { data, isLoading } = useQuery({
    queryKey: ["fixed-fee-time", month, year],
    queryFn: () => getFixedFeeWithTime({ month, year }),
    enabled: Boolean(month && year),
  });

  /* ---------------- helpers ---------------- */

  const isPastMonth = () => {
    if (year < now.getFullYear()) return true;
    if (year === now.getFullYear() && month < now.getMonth() + 1) return true;
    return false;
  };

  const isFutureMonth = () => {
    if (year > now.getFullYear()) return true;
    if (year === now.getFullYear() && month > now.getMonth() + 1) return true;
    return false;
  };

  const hasChanges = items.some((i) => !i.id || i.amount !== i.originalAmount);

  /* -------- map backend -> items ---------- */
  useEffect(() => {
    if (!data) return;

    const mapped: FixedCostItemUI[] = DEFAULT_FIXED_COSTS.map((type) => {
      const matched = data.fixed_fees.find((i) => i.type === type);

      return {
        type,
        amount: matched ? Number(matched.amount) : "",
        isCloned: false,
        id: matched?.id, // 👈 LƯU ID
        originalAmount: matched ? Number(matched.amount) : undefined,
      };
    });

    setItems(mapped);

    const isCurrentMonth =
      month === now.getMonth() + 1 && year === now.getFullYear();

    if (isCurrentMonth) {
      setBaseMonthItems(mapped);
      setHasCloned(false);
    }
  }, [data, month, year]);

  /* -------- clone missing fields ONLY ---------- */
  useEffect(() => {
    if (!data) return;
    if (!baseMonthItems.length) return;
    if (!isFutureMonth()) return;
    if (hasCloned) return;

    const backendHasData = data.fixed_fees.length > 0;

    setItems((prev) =>
      prev.map((item) => {
        // backend có data → không clone
        if (item.amount !== "") {
          return { ...item, isCloned: false };
        }

        // backend chưa có → tìm base
        const base = baseMonthItems.find(
          (b) => b.type === item.type && b.amount !== "",
        );

        return base
          ? {
              ...item,
              amount: base.amount,
              isCloned: true,
              id: undefined,
              originalAmount: undefined,
            }
          : item;
      }),
    );

    if (!backendHasData) {
      toast.info("Missing fixed costs were cloned from previous month");
    }

    setHasCloned(true);
  }, [month, year, data, baseMonthItems, hasCloned]);

  /* -------- actions ---------- */

  const updateItem = (
    index: number,
    field: keyof FixedCostItemUI,
    value: string,
  ) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]: field === "amount" ? Number(value) || "" : value,
              isCloned: false,
            }
          : item,
      ),
    );
  };

  const addRow = () => {
    setItems((prev) => [...prev, { type: "", amount: "" }]);
  };

  const removeRow = async (index: number) => {
    const item = items[index];
    if (!item) return;

    try {
      // ✅ CASE 1: item đã tồn tại trên DB → DELETE API
      if (item.id) {
        await deleteFixedFeeMutation.mutateAsync(item.id);
      }

      // ✅ CASE 2: item local → chỉ xoá state
      setItems((prev) => prev.filter((_, i) => i !== index));

      toast.success("Fixed cost removed");
    } catch (error) {
      toast.error("Failed to remove fixed cost");
    }
  };

  const submit = async () => {
    try {
      let created = 0;
      let updated = 0;

      for (const item of items) {
        if (!item.type || !item.amount) continue;

        const payload: CreateFixedFeeValues = {
          type: item.type,
          amount: Number(item.amount),
          month,
          year,
        };

        // ✅ CASE 1: đã tồn tại → UPDATE nếu thay đổi
        if (item.id) {
          if (item.amount !== item.originalAmount) {
            await updateFixedFeeMutation.mutateAsync({
              id: item.id,
              input: payload,
            });
            updated++;
          }
          continue;
        }

        // ✅ CASE 2: chưa tồn tại → CREATE
        await createFixedFeeMutation.mutateAsync(payload);
        created++;
      }

      toast.success(
        `Saved successfully: ${created} created, ${updated} updated`,
      );
    } catch (error) {
      toast.error("Failed to save fixed costs");
    }
  };

  return {
    month,
    year,
    setMonth,
    setYear,
    items,
    isLoading,
    isReadonly: isPastMonth(),
    updateItem,
    addRow,
    removeRow,
    submit,
    isSubmitting: createFixedFeeMutation.isPending,
    hasChanges,
  };
}
