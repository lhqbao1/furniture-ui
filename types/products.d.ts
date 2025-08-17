export interface Product {
    id: number;
    name: string;
    image: string;
    price: number;
    category: string;
    rating: number;
    salePrice: number;
    tag: Tag
}

export interface Tag {
    name: string;
    color: string
}

export interface PreOrderProduct {
    id: number;
    name: string;
    award?: string;
    image: string;
    price: number;
    category: string;
    color: string[];
    desc: string;
}