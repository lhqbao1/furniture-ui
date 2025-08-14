import { Category, HomeBannerItems } from "@/types/categories";
import { Collection } from "@/types/collection";
import { PreOrderProduct, Product } from "@/types/products";
import { Bed, Sofa, Table } from "lucide-react";

export const Categories: Category[] = [
    {
        id: 1,
        name: "Sofa",
        icon: Sofa
    },
    {
        id: 2,
        name: "Armchair",
        icon: Sofa
    },
    {
        id: 3,
        name: "Table",
        icon: Table
    },
    {
        id: 4,
        name: "Cabinet",
        icon: Sofa
    },
    {
        id: 5,
        name: "Chair",
        icon: Sofa
    },
    {
        id: 5,
        name: "Bed",
        icon: Bed
    }

]

export const homeBannerItems: HomeBannerItems[] = [
    { id: 1, image: "/home-banner-image1.png", name: "Sofa" },
    { id: 2, image: "/home-banner-image1.png", name: "Bed" },
    { id: 3, image: "/home-banner-image1.png", name: "Dining Table" },
    { id: 4, image: "/home-banner-image1.png", name: "Wardrobe" },
    { id: 5, image: "/home-banner-image1.png", name: "Bookshelf" },
    { id: 6, image: "/home-banner-image1.png", name: "Coffee Table" },
    { id: 7, image: "/home-banner-image1.png", name: "TV Stand" },
    { id: 8, image: "/home-banner-image1.png", name: "Office Chair" },
    { id: 9, image: "/home-banner-image1.png", name: "Desk" },
    { id: 10, image: "/home-banner-image1.png", name: "Nightstand" },
    { id: 11, image: "/home-banner-image1.png", name: "Outdoor Furniture" },
];

export const preOrderItems: PreOrderProduct[] = [
    {
        id: 1,
        name: "Premium Chair 1",
        award: "Best Seller",
        image: "/chair.jpg",
        price: 120,
        category: "Furniture",
        color: ["#FF0000", "#000000"],
        desc: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna ali'
    },
    {
        id: 2,
        name: "Premium Chair 2",
        award: "Top Rated",
        image: "/chair.jpg",
        price: 140,
        category: "Furniture",
        color: ["#00FF00", "#FFFFFF"],
        desc: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna ali'
    },
    {
        id: 3,
        name: "Premium Chair 3",
        image: "/chair.jpg",
        price: 150,
        category: "Furniture",
        color: ["#0000FF", "#CCCCCC"],
        desc: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna ali'
    },
    {
        id: 4,
        name: "Premium Chair 4",
        award: "New Arrival",
        image: "/chair.jpg",
        price: 160,
        category: "Furniture",
        color: ["#FFFF00", "#333333"],
        desc: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna ali'
    },
    {
        id: 5,
        name: "Premium Chair 5",
        image: "/chair.jpg",
        price: 170,
        category: "Furniture",
        color: ["#FF00FF", "#666666"],
        desc: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna ali'
    }
];

export const trendingProducts: Product[] = [
    { id: 1, name: "Classic Bed", image: "/bed.webp", price: 1200, salePrice: 900, category: "Bedroom", rating: 3.5 },
    { id: 2, name: "Modern Bed", image: "/bed.webp", price: 1500, salePrice: 1200, category: "Bedroom", rating: 4.7 },
    { id: 3, name: "Queen Bed", image: "/bed.webp", price: 1800, salePrice: 1500, category: "Bedroom", rating: 4.6 },
    { id: 4, name: "King Bed", image: "/bed.webp", price: 2200, salePrice: 1900, category: "Bedroom", rating: 3.8 },
    { id: 5, name: "Single Bed", image: "/bed.webp", price: 800, salePrice: 500, category: "Bedroom", rating: 4.2 },
    { id: 6, name: "Double Bed", image: "/bed.webp", price: 1400, salePrice: 1100, category: "Bedroom", rating: 4.4 },
    { id: 7, name: "Futon Bed", image: "/bed.webp", price: 1000, salePrice: 700, category: "Bedroom", rating: 2.3 },
    { id: 8, name: "Storage Bed", image: "/bed.webp", price: 2000, salePrice: 1700, category: "Bedroom", rating: 4.7 },
];


export const collectionList: Collection[] = [
    { id: 1, name: 'Interior', image: '/collection-1.jpg' },
    { id: 2, name: 'Decoration', image: '/collection-2.jpg' },
    { id: 3, name: 'Chair', image: '/collection-3.jpg' },
    { id: 4, name: 'Sofa', image: '/collection-4.jpg' },
    { id: 5, name: 'Furniture', image: '/collection-5.jpg' },

]