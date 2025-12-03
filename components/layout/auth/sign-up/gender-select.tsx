"use client";

import { FormControl, FormItem, FormLabel } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function GenderSelect({ value, onChange, t }: any) {
  return (
    <FormItem>
      <FormControl>
        <RadioGroup
          onValueChange={onChange}
          value={value}
          className="flex gap-4"
        >
          <FormItem className="flex gap-1 items-center">
            <FormControl>
              <RadioGroupItem value="male" />
            </FormControl>
            <FormLabel className="ml-2">{t("male")}</FormLabel>
          </FormItem>

          <FormItem className="flex gap-1 items-center">
            <FormControl>
              <RadioGroupItem value="female" />
            </FormControl>
            <FormLabel className="ml-2">{t("female")}</FormLabel>
          </FormItem>

          <FormItem className="flex gap-1 items-center">
            <FormControl>
              <RadioGroupItem value="other" />
            </FormControl>
            <FormLabel className="ml-2">{t("otherGender")}</FormLabel>
          </FormItem>
        </RadioGroup>
      </FormControl>
    </FormItem>
  );
}
