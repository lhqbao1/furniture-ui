"use client";

import { ProductGridSkeleton } from "@/components/shared/product-grid-skeleton";
import ProductsGridLayout from "@/components/shared/products-grid-layout";
import { useGetProductByTag } from "@/features/products/hook";
import { useIsPhone } from "@/hooks/use-is-phone";
import { useTranslations } from "next-intl";
import React from "react";

const TrendingProducts = () => {
    const t = useTranslations()
    const isPhone = useIsPhone()
    const { data: products, isLoading, isError } = useGetProductByTag('Trending');

    return (
        <div className="section-padding">
            <h2 className="section-header">{t('trending')}</h2>
            <p className="text-primary text-lg text-center">
                {t('mostWanted')}
            </p>

            {isLoading || isError || !products ? (
                <ProductGridSkeleton />
            ) : (
                <>
                    <ProductsGridLayout
                        data={isPhone ?
                            products.filter(item => item.is_active === true)
                                .slice(0, 6)
                            :
                            products.filter(item => item.is_active === true)
                                .slice(0, 8)}
                    />
                </>
            )}
        </div>
    );
};

export default TrendingProducts;
