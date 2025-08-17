import Image from "next/image";
import React from "react";

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
}

const ImageSinglePicker: React.FC<ImageSinglePickerProps> = ({ item, active, onClick, size }) => {
    return (
        <button
            onClick={onClick}
            className={`${sizeMap[size]} rounded-xs`}
            style={{
                // backgroundColor: color,
                outline: active ? `2px solid red` : "none",
                outlineOffset: "3px", // cách nút 1px nhưng outline thường tính theo px, nên 2px sẽ đẹp hơn
            }}
        >
            <Image
                src={`/${item}`}
                width={50}
                height={50}
                alt=""
                className="object-fill h-full"
            />
        </button>
    );
};

export default ImageSinglePicker;
