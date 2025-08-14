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
    { id: 1, image: "/1.png", name: "Sofa" },
    { id: 2, image: "/2.png", name: "Bed" },
    { id: 3, image: "/3.png", name: "Dining Table" },
    { id: 4, image: "/13.png", name: "Wardrobe" },
    { id: 5, image: "/5.png", name: "Bookshelf" },
    { id: 6, image: "/6.png", name: "Coffee Table" },
    { id: 7, image: "/7.png", name: "TV Stand" },
    { id: 8, image: "/8.png", name: "Office Chair" },
    // { id: 9, image: "/home-banner-image1.png", name: "Desk" },
    // { id: 10, image: "/home-banner-image1.png", name: "Nightstand" },
    // { id: 11, image: "/home-banner-image1.png", name: "Outdoor Furniture" },
];

export const preOrderItems: PreOrderProduct[] = [
    {
        id: 1,
        name: "Premium Chair 1",
        award: "Best Seller",
        image: "/1.png",
        price: 120,
        category: "Furniture",
        color: ["#FF0000", "#000000"],
        desc: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna ali'
    },
    {
        id: 2,
        name: "Premium Chair 2",
        award: "Top Rated",
        image: "/2.png",
        price: 140,
        category: "Furniture",
        color: ["#00FF00", "#FFFFFF"],
        desc: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna ali'
    },
    {
        id: 3,
        name: "Premium Chair 3",
        image: "/3.png",
        price: 150,
        category: "Furniture",
        color: ["#0000FF", "#CCCCCC"],
        desc: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna ali'
    },
    {
        id: 4,
        name: "Premium Chair 4",
        award: "New Arrival",
        image: "/4.png",
        price: 160,
        category: "Furniture",
        color: ["#FFFF00", "#333333"],
        desc: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna ali'
    },
    {
        id: 5,
        name: "Premium Chair 5",
        image: "/5.png",
        price: 170,
        category: "Furniture",
        color: ["#FF00FF", "#666666"],
        desc: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna ali'
    }
];

export const trendingProducts: Product[] = [
    { id: 1, name: "Classic Bed", image: "/1.png", price: 120, salePrice: 90, category: "Bedroom", rating: 3.5 },
    { id: 2, name: "Modern Bed", image: "/4.png", price: 150, salePrice: 120, category: "Bedroom", rating: 4.7 },
    { id: 3, name: "Queen Bed", image: "/6.png", price: 180, salePrice: 150, category: "Bedroom", rating: 4.6 },
    { id: 4, name: "King Bed", image: "/8.png", price: 220, salePrice: 190, category: "Bedroom", rating: 3.8 },
    { id: 5, name: "Single Bed", image: "/10.png", price: 80, salePrice: 50, category: "Bedroom", rating: 4.2 },
    { id: 6, name: "Double Bed", image: "/13.png", price: 140, salePrice: 110, category: "Bedroom", rating: 4.4 },
    { id: 7, name: "Futon Bed", image: "/14.png", price: 100, salePrice: 70, category: "Bedroom", rating: 2.3 },
    { id: 8, name: "Storage Bed", image: "/3.png", price: 200, salePrice: 170, category: "Bedroom", rating: 4.7 },
];


export const collectionList: Collection[] = [
    { id: 1, name: 'Interior', image: '/collection-1.jpg' },
    { id: 2, name: 'Decoration', image: '/collection-2.jpg' },
    { id: 3, name: 'Chair', image: '/collection-3.jpg' },
    { id: 4, name: 'Sofa', image: '/collection-4.jpg' },
    { id: 5, name: 'Furniture', image: '/collection-5.jpg' },

]