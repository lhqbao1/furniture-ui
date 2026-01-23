import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

type CurrencyFieldProps = {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
};

const CURRENCIES = [
  { value: "USD", label: "USD — US Dollar" },
  { value: "EUR", label: "EUR — Euro" },
  { value: "GBP", label: "GBP — British Pound" },
  { value: "JPY", label: "JPY — Japanese Yen" },
  { value: "CNY", label: "CNY — Chinese Yuan" },
  { value: "KRW", label: "KRW — Korean Won" },
  { value: "VND", label: "VND — Vietnamese Dong" },
  { value: "AUD", label: "AUD — Australian Dollar" },
  { value: "CAD", label: "CAD — Canadian Dollar" },
  { value: "SGD", label: "SGD — Singapore Dollar" },
];

export const CurrencyField = ({
  value,
  onChange,
  required,
}: CurrencyFieldProps) => {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="flex items-center gap-1">
        Currency
        {required && <span className="text-destructive">*</span>}
      </Label>

      <Select
        value={value}
        onValueChange={onChange}
      >
        <SelectTrigger
          className="border"
          placeholderColor
        >
          <SelectValue placeholder="Select currency" />
        </SelectTrigger>
        <SelectContent>
          {CURRENCIES.map((c) => (
            <SelectItem
              key={c.value}
              value={c.value}
            >
              {c.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
