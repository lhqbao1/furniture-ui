import { LucideIcon } from "lucide-react";

export interface Category {
    id: number;
    name: string;
    icon: LucideIcon | string;
};

export interface HomeBannerItems {
    id: number;
    image: string;
    name: string
}