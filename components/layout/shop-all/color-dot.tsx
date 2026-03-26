import { cn } from "@/lib/utils";

interface ColorDotProps {
  color: string;
  checked: boolean;
}

const ColorDot = ({ color, checked }: ColorDotProps) => {
  const isGradient = color.startsWith("repeating");

  return (
    <div
      className={cn(
        "size-5 min-w-5 min-h-5 shrink-0 rounded-full transition",
        checked ? "ring-2 ring-black ring-offset-2" : "border border-gray-300",
      )}
      style={{
        background: isGradient ? color : undefined,
        backgroundColor: !isGradient ? color : undefined,
      }}
    />
  );
};

export default ColorDot;
