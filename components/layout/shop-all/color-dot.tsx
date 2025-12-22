import { cn } from "@/lib/utils";

interface ColorDotProps {
  color: string;
  checked: boolean;
}

const ColorDot = ({ color, checked }: { color: string; checked: boolean }) => {
  const isGradient = color.startsWith("repeating");

  return (
    <div
      className={cn(
        "h-5 w-5 rounded-full transition",
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
