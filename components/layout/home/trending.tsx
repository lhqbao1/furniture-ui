"use client";

import { ProductGridSkeleton } from "@/components/shared/product-grid-skeleton";
import ProductsGridLayout from "@/components/shared/products-grid-layout";
import { useGetProductByTag } from "@/features/products/hook";
import { useTranslations } from "next-intl";
import React from "react";

const TrendingProducts = () => {
    const t = useTranslations()
    const { data: products, isLoading, isError } = useGetProductByTag('Trending');

    return (
        <div className="section-padding">
            <h2 className="section-header">{t('trending')}</h2>
            <p className="text-primary text-lg text-center">
                most wanted on social media
            </p>

            {isLoading || isError || !products ? (
                <ProductGridSkeleton />
            ) : (
                <>
                    <ProductsGridLayout data={products.slice(0, 8)} />
                </>
            )}
        </div>
    );
};

export default TrendingProducts;
