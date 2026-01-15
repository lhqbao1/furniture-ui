"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductSoldPage from "@/components/layout/admin/accountant/cost/product-sold-tab/product-sold-page";
import FixedCostPage from "@/components/layout/admin/accountant/cost/fixed-cost/fixed-cost-page";
import VariableCostPage from "@/components/layout/admin/accountant/cost/variable-cost/variable-cost-page";
import ProductMarginPage from "@/components/layout/admin/accountant/cost/product-margin/product-margin-page";
import OverviewPage from "@/components/layout/admin/accountant/cost/overview/overview-page";
import { useAtom } from "jotai";
import { variableCostAtom } from "@/store/variable";
import { useVariableCost } from "@/components/layout/admin/accountant/cost/variable-cost/useVariableCost";
import { mergeMarketplaceCostData } from "@/components/layout/admin/accountant/cost/variable-cost/variable-cost-table";

const CostManagement = () => {
  const now = new Date();

  const [month, setMonth] = useState<number>(now.getMonth() + 1);
  const [year, setYear] = useState<number>(now.getFullYear());

  const [variableCost, setVariableCost] = useAtom(variableCostAtom);

  const { variableFeeData, marketplaceData } = useVariableCost({
    month,
    year,
    setMonth,
    setYear,
  });

  const tableRows = useMemo(() => {
    if (!variableFeeData || !marketplaceData) return [];

    return mergeMarketplaceCostData(
      variableFeeData,
      marketplaceData.data ?? [],
    );
  }, [variableFeeData, marketplaceData]);

  const totalFeePercent = useMemo(
    () => tableRows.reduce((sum, i) => sum + i.feePercent, 0),
    [tableRows],
  );

  useEffect(() => {
    setVariableCost(totalFeePercent);
  }, [totalFeePercent, setVariableCost]);

  return (
    <div className="space-y-3">
      {/* <StickyMonthSelector /> */}
      <div className="h-[2000px] mt-6">
        <Tabs defaultValue="overview">
          <TabsList className="gap-4 text-xl">
            <TabsTrigger
              value="overview"
              className="text-lg"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="fixed-cost"
              className="text-lg"
            >
              Fixed Cost
            </TabsTrigger>
            <TabsTrigger
              value="product-sold"
              className="text-lg"
            >
              Products Sold
            </TabsTrigger>
            <TabsTrigger
              value="variable-cost"
              className="text-lg"
            >
              Variable Cost
            </TabsTrigger>
            <TabsTrigger
              value="product-margin"
              className="text-lg"
            >
              Product Margin
            </TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <Card>
              <CardContent className="grid gap-6">
                <OverviewPage />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="product-sold">
            <Card>
              <CardContent className="grid gap-6">
                <ProductSoldPage />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="fixed-cost">
            <Card>
              <CardContent>
                <FixedCostPage />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="variable-cost">
            <Card>
              <CardContent>
                <VariableCostPage
                  month={month}
                  year={year}
                  setMonth={setMonth}
                  setYear={setYear}
                />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="product-margin">
            <Card>
              <CardContent>
                <ProductMarginPage />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CostManagement;
