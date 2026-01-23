import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type FieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  optional?: boolean;
};

export const Field = ({
  label,
  value,
  onChange,
  type = "text",
  required,
  optional,
}: FieldProps) => {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="flex items-center gap-1">
        {label}
        {required && <span className="text-destructive">*</span>}
        {optional && (
          <span className="text-muted-foreground text-xs">(optional)</span>
        )}
      </Label>

      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};
