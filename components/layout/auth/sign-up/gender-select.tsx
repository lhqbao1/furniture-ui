"use client";

import { FormControl, FormItem, FormLabel } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type TranslationFn = (key: string) => string;

interface GenderSelectProps {
  value?: string;
  onChange: (value: string) => void;
  t: TranslationFn;
}

export default function GenderSelect({ value, onChange, t }: GenderSelectProps) {
  const options = [
    { value: "male", label: t("male") },
    { value: "female", label: t("female") },
    { value: "other", label: t("otherGender") },
  ];

  return (
    <FormItem className="space-y-3">
      <FormLabel className="text-sm font-medium text-slate-700">
        {t("gender")}
      </FormLabel>
      <FormControl>
        <RadioGroup
          onValueChange={onChange}
          value={value}
          className="grid grid-cols-1 gap-2 sm:grid-cols-3"
        >
          {options.map((option) => {
            const id = `signup-gender-${option.value}`;
            const isSelected = value === option.value;

            return (
              <FormItem key={option.value}>
                <FormLabel
                  htmlFor={id}
                  className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border bg-white px-3 py-2 text-sm shadow-sm transition-[border-color,background-color,box-shadow] hover:border-secondary/40 ${
                    isSelected
                      ? "border-secondary/60 bg-secondary/5 text-secondary shadow-secondary/10"
                      : "border-slate-200 text-slate-700"
                  }`}
                >
                  <FormControl>
                    <RadioGroupItem id={id} value={option.value} />
                  </FormControl>
                  <span>{option.label}</span>
                </FormLabel>
              </FormItem>
            );
          })}
        </RadioGroup>
      </FormControl>
    </FormItem>
  );
}
