// components/ColorPickerButton.tsx
"use client";
import React from "react";
import { Controller, useFormContext } from "react-hook-form";

interface ColorPickerButtonProps {
    color: string;
    active?: boolean;
    onClick?: () => void;
    isFormInput?: boolean;
    name?: string;
}

const ColorPickerButton: React.FC<ColorPickerButtonProps> = ({
    color,
    active,
    onClick,
    isFormInput = false,
    name,
}) => {
    const form = useFormContext(); // ✅ luôn gọi
    const control = form?.control; // nếu không có FormProvider thì undefined

    // ✅ Trường hợp dùng với react-hook-form
    if (isFormInput) {
        if (!name) {
            throw new Error("Prop `name` is required when `isFormInput` is true");
        }

        return (
            <Controller
                name={name}
                control={control}
                render={({ field }) => (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault(); // ngăn submit form ngoài ý muốn
                            field.onChange(color);
                        }}
                        className="w-6 h-6 rounded-full border border-gray-300"
                        style={{
                            backgroundColor: color,
                            outline: field.value === color ? `2px solid ${color}` : "none",
                            outlineOffset: "3px",
                        }}
                    />
                )}
            />
        );
    }

    // ✅ Trường hợp button thường
    return (
        <button
            type="button"
            onClick={(e) => {
                e.preventDefault(); // để chắc chắn không submit
                onClick?.();
            }}
            className="w-6 h-6 rounded-full border border-gray-300"
            style={{
                backgroundColor: color,
                outline: active ? `2px solid ${color}` : "none",
                outlineOffset: "3px",
            }}
        />
    );
};

export default ColorPickerButton;
