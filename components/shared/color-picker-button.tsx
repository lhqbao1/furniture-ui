// components/ColorPickerButton.tsx
import React from "react";

interface ColorPickerButtonProps {
    color: string;
    active?: boolean;
    onClick?: () => void;
}

const ColorPickerButton: React.FC<ColorPickerButtonProps> = ({ color, active, onClick }) => {
    return (
        <button
            onClick={onClick}
            className="w-6 h-6 rounded-full border border-gray-300"
            style={{
                backgroundColor: color,
                outline: active ? `2px solid ${color}` : "none",
                outlineOffset: "3px", // cách nút 1px nhưng outline thường tính theo px, nên 2px sẽ đẹp hơn
            }}
        />
    );
};

export default ColorPickerButton;
