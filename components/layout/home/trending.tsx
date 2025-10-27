"use client";

import { ProductGridSkeleton } from "@/components/shared/product-grid-skeleton";
import ProductsGridLayout from "@/components/shared/products-grid-layout";
import { useGetProductsSelect } from "@/features/product-group/hook";
import { useGetProductByTag } from "@/features/products/hook";
import { useIsPhone } from "@/hooks/use-is-phone";
import { useTranslations } from "next-intl";
import React from "react";

const TrendingProducts = () => {
    const t = useTranslations()
    const isPhone = useIsPhone()
    // const { data: products, isLoading, isError } = useGetProductByTag('Trending');
    const { data: products, isLoading, isError } = useGetProductsSelect({
        is_customer: true
    });

    return (
        <div className="section-padding">
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
                        }
                    />
                </>
            )}
        </div>
    );
};

export default TrendingProducts;
