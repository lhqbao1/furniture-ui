"use client";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { paymentOptions } from "@/data/data";

interface Props {
  control: any;
  selectedMethod: string;
  onChange: (value: string) => void;
  t: any;
}

export default function CheckoutPaymentUI({
  control,
  selectedMethod,
  onChange,
  t,
}: Props) {
  return (
    <Card className="mx-auto p-4 shadow-lg">
      <CardHeader>
        <div className="font-bold text-base">{t("selectPayment")}</div>
      </CardHeader>

      <CardContent className="space-y-4">
        <FormField
          control={control}
          name="payment_method"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <RadioGroup
                  value={selectedMethod}
                  onValueChange={onChange}
                  className="grid grid-cols-1 gap-y-3"
                >
                  {paymentOptions.map((option) => (
                    <FormItem
                      key={option.id}
                      className="flex items-center gap-2"
                    >
                      <FormControl>
                        <RadioGroupItem
                          value={option.id}
                          id={option.id}
                        />
                      </FormControl>

                      <FormLabel
                        htmlFor={option.id}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        {option.logo && (
                          <Image
                            src={option.logo}
                            width={30}
                            height={30}
                            alt={option.label}
                            unoptimized
                          />
                        )}
                        {option.label}
                      </FormLabel>
                    </FormItem>
                  ))}
                </RadioGroup>
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
