import { Star } from "lucide-react";

interface RatingFieldProps {
    name?: string;
    label?: string;
    value: number;
    onChange: (value: number) => void;
}

export function RatingField({ label, value, onChange }: RatingFieldProps) {
    return (
        <div className="flex flex-col gap-1">
            <div className="flex flex-row gap-1">
                {[1, 2, 3, 4, 5].map((item) => (
                    <button
                        key={item}
                        type="button"
                        onClick={() => onChange(item)}
                        className="focus:outline-none"
                    >
                        <Star
                            stroke="#f15a24"
                            fill={item <= value ? "#f15a24" : "none"}
                            className="w-6 h-6 cursor-pointer transition-colors duration-150"
                        />
                    </button>
                ))}
            </div>
            {label && (
                <p className="text-sm text-gray-600 font-semibold mt-1">{label}</p>
            )}
        </div>
    );
}
