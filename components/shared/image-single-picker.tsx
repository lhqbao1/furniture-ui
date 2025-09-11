'use client'
import Image from "next/image";
import React from "react";
import { Controller, useFormContext } from "react-hook-form";

export enum SizeType {
    Icon = "icon",
    Image = "image",
    LargeImage = "large-image",
}

const sizeMap: Record<SizeType, string> = {
    icon: "w-6 h-6",
    image: "w-12 h-full",
    "large-image": "w-20 h-20",
}

interface ImageSinglePickerProps {
    item: string;
    size: SizeType;
    active?: boolean;
    onClick?: () => void;
    isFormInput?: boolean;
    name?: string;
}

const ImageSinglePicker: React.FC<ImageSinglePickerProps> = ({ item, active, onClick, size, isFormInput = false, name }) => {
    const form = useFormContext(); // ✅ luôn gọi
    const control = form?.control; // nếu không có FormProvider thì undefined

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
                            e.preventDefault(); // ngăn form submit
                            field.onChange(item);
                        }}
                        className={`${sizeMap[size]} rounded-xs`}
                        style={{
                            outline: field.value === item ? `2px solid #f15a24` : "none",
                            outlineOffset: "3px",
                        }}
                    >
                        <Image
                            src={`/${item}`}
                            width={50}
                            height={50}
                            alt=""
                            className="object-fill h-full"
                            unoptimized
                        />
                    </button>
                )}
            />
        );
    }

    return (
        <button
            onClick={onClick}
            className={`${sizeMap[size]} rounded-xs`}
            style={{
                outline: active ? `2px solid #f15a24` : "none",
                outlineOffset: "3px",
            }}
        >
            <Image
                src={`/${item}`}
                width={50}
                height={50}
                alt=""
                className="object-fill h-full"
                unoptimized
            />
        </button>
    );
};


export default ImageSinglePicker;
