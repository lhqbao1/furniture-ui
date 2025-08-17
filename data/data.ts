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
    { id: 1, name: "Classic Bed", image: "/1.png", price: 120, salePrice: 90, category: "Bedroom", rating: 3.5, tag: {name: 'Top Rated', color: '#fba707'} },
    { id: 2, name: "Modern Bed", image: "/4.png", price: 150, salePrice: 120, category: "Bedroom", rating: 4.7, tag: {
        name: 'Featured',
        color: '#8cc63f'
    }},
    { id: 3, name: "Queen Bed", image: "/6.png", price: 180, salePrice: 150, category: "Bedroom", rating: 4.6, tag: {name: 'Top Rated', color: '#fba707'} },
    { id: 4, name: "King Bed", image: "/8.png", price: 220, salePrice: 190, category: "Bedroom", rating: 3.8, tag: {
        name: 'Sale',
        color: '#f15454',
    }},
    { id: 5, name: "Single Bed", image: "/10.png", price: 80, salePrice: 50, category: "Bedroom", rating: 4.2, tag: {
        name: 'New',
        color: '#2dc4b6',
    }},
    { id: 6, name: "Double Bed", image: "/13.png", price: 140, salePrice: 110, category: "Bedroom", rating: 4.4, tag: {
        name: 'Trending',
        color: '#af01ff'
    } },
    { id: 7, name: "Futon Bed", image: "/14.png", price: 100, salePrice: 70, category: "Bedroom", rating: 2.3, tag: {
        name: 'Sale',
        color: '#f15454',
    } },
    { id: 8, name: "Storage Bed", image: "/3.png", price: 200, salePrice: 170, category: "Bedroom", rating: 4.7, tag: {name: 'Top Rated', color: '#fba707'} },
];

export const allProducts: Product[] = [
    { id: 1, name: "Classic Bed", image: "/1.png", price: 120, salePrice: 90, category: "Bedroom", rating: 3.5, tag: {name: 'Top Rated', color: '#fba707'} },
    { id: 2, name: "Modern Bed", image: "/4.png", price: 150, salePrice: 120, category: "Bedroom", rating: 4.7, tag: {
        name: 'Featured',
        color: '#8cc63f'
    }},
    { id: 3, name: "Queen Bed", image: "/6.png", price: 180, salePrice: 150, category: "Bedroom", rating: 4.6, tag: {name: 'Top Rated', color: '#fba707'} },
    { id: 4, name: "King Bed", image: "/8.png", price: 220, salePrice: 190, category: "Bedroom", rating: 3.8, tag: {
        name: 'Sale',
        color: '#f15454',
    }},
    { id: 5, name: "Single Bed", image: "/10.png", price: 80, salePrice: 50, category: "Bedroom", rating: 4.2, tag: {
        name: 'New',
        color: '#2dc4b6',
    }},
    { id: 6, name: "Double Bed", image: "/13.png", price: 140, salePrice: 110, category: "Bedroom", rating: 4.4, tag: {
        name: 'Trending',
        color: '#af01ff'
    } },
    { id: 7, name: "Futon Bed", image: "/14.png", price: 100, salePrice: 70, category: "Bedroom", rating: 2.3, tag: {
        name: 'Sale',
        color: '#f15454',
    } },
    { id: 8, name: "Storage Bed", image: "/3.png", price: 200, salePrice: 170, category: "Bedroom", rating: 4.7, tag: {name: 'Top Rated', color: '#fba707'} },
    { id: 9, name: "Classic Bed", image: "/1.png", price: 120, salePrice: 90, category: "Bedroom", rating: 3.5, tag: {name: 'Top Rated', color: '#fba707'} },
    { id: 10, name: "Modern Bed", image: "/4.png", price: 150, salePrice: 120, category: "Bedroom", rating: 4.7, tag: {
        name: 'Featured',
        color: '#8cc63f'
    }},
    { id: 11, name: "Queen Bed", image: "/6.png", price: 180, salePrice: 150, category: "Bedroom", rating: 4.6, tag: {name: 'Top Rated', color: '#fba707'} },
    { id: 12, name: "King Bed", image: "/8.png", price: 220, salePrice: 190, category: "Bedroom", rating: 3.8, tag: {
        name: 'Sale',
        color: '#f15454',
    }},
    { id: 13, name: "Single Bed", image: "/10.png", price: 80, salePrice: 50, category: "Bedroom", rating: 4.2, tag: {
        name: 'New',
        color: '#2dc4b6',
    }},
    { id: 14, name: "Double Bed", image: "/13.png", price: 140, salePrice: 110, category: "Bedroom", rating: 4.4, tag: {
        name: 'Trending',
        color: '#af01ff'
    } },
    { id: 15, name: "Futon Bed", image: "/14.png", price: 100, salePrice: 70, category: "Bedroom", rating: 2.3, tag: {
        name: 'Sale',
        color: '#f15454',
    } },
    { id: 16, name: "Storage Bed", image: "/3.png", price: 200, salePrice: 170, category: "Bedroom", rating: 4.7, tag: {name: 'Top Rated', color: '#fba707'} },
    { id: 17, name: "Classic Bed", image: "/1.png", price: 120, salePrice: 90, category: "Bedroom", rating: 3.5, tag: {name: 'Top Rated', color: '#fba707'} },
    { id: 18, name: "Modern Bed", image: "/4.png", price: 150, salePrice: 120, category: "Bedroom", rating: 4.7, tag: {
        name: 'Featured',
        color: '#8cc63f'
    }},
    { id: 19, name: "Queen Bed", image: "/6.png", price: 180, salePrice: 150, category: "Bedroom", rating: 4.6, tag: {name: 'Top Rated', color: '#fba707'} },
    { id: 20, name: "King Bed", image: "/8.png", price: 220, salePrice: 190, category: "Bedroom", rating: 3.8, tag: {
        name: 'Sale',
        color: '#f15454',
    }},
    { id: 21, name: "Single Bed", image: "/10.png", price: 80, salePrice: 50, category: "Bedroom", rating: 4.2, tag: {
        name: 'New',
        color: '#2dc4b6',
    }},
    { id: 22, name: "Double Bed", image: "/13.png", price: 140, salePrice: 110, category: "Bedroom", rating: 4.4, tag: {
        name: 'Trending',
        color: '#af01ff'
    } },
    { id: 23, name: "Futon Bed", image: "/14.png", price: 100, salePrice: 70, category: "Bedroom", rating: 2.3, tag: {
        name: 'Sale',
        color: '#f15454',
    } },
    { id: 24, name: "Storage Bed", image: "/3.png", price: 200, salePrice: 170, category: "Bedroom", rating: 4.7, tag: {name: 'Top Rated', color: '#fba707'} },
];

export const tags = [
    {
        name: 'Top Rated',
        color: '#fba707'
    },
    {
        name: 'Featured',
        color: '#8cc63f'
    },
    {
        name: 'Sale',
        color: '#f15454',
    },
    {
        name: 'Trending',
        color: '#af01ff'
    },
    {
        name: 'New',
        color: '#2dc4b6',
    },
    {
        name: 'Best Seller',
        color: '#01bfff'
    }
]


export const collectionList: Collection[] = [
    { id: 1, name: 'Interior', image: '/collection-1.jpg' },
    { id: 2, name: 'Decoration', image: '/collection-2.jpg' },
    { id: 3, name: 'Chair', image: '/collection-3.jpg' },
    { id: 4, name: 'Sofa', image: '/collection-4.jpg' },
    { id: 5, name: 'Furniture', image: '/collection-5.jpg' },
]

export const materials = ['Asset1.png', 'Asset2.png', 'Asset3.png', 'Asset4.png']
export const colors = ['#28abe2', '#009244', '#c1282d', '#93278f']
export const dimension = [
    {
        name: '120x50',
        available: true
    },
    {
        name: '150x60',
        available: true
    },
    {
        name: '180x80',
        available: false
    }
]