"use client";
import StickyMonthSelector from "@/components/layout/admin/accountant/cost/sticky-month-selector";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OverViewTab from "@/components/layout/admin/accountant/cost/overview-tabs";
import ProductSoldPage from "@/components/layout/admin/accountant/cost/product-sold-tab/product-sold-page";
import FixedCostPage from "@/components/layout/admin/accountant/cost/fixed-cost/fixed-cost-page";
import VariableCostPage from "@/components/layout/admin/accountant/cost/variable-cost/variable-cost-page";

const CostManagement = () => {
  return (
    <div className="space-y-3">
      <StickyMonthSelector />
      <div className="h-[2000px] mt-6">
        <Tabs defaultValue="product-sold">
          <TabsList className="gap-4 text-xl">
            <TabsTrigger
              value="product-sold"
              className="text-lg"
            >
              Products Sold
            </TabsTrigger>
            <TabsTrigger
              value="fixed-cost"
              className="text-lg"
            >
              Fixed Cost
            </TabsTrigger>
            <TabsTrigger
              value="variable-cost"
              className="text-lg"
            >
              Variable Cost
            </TabsTrigger>
            <TabsTrigger
              value="allocation"
              className="text-lg"
            >
              Allocation
            </TabsTrigger>
            <TabsTrigger
              value="product-margin"
              className="text-lg"
            >
              Product Margin
            </TabsTrigger>
            <TabsTrigger
              value="reports"
              className="text-lg"
            >
              Reports
            </TabsTrigger>
          </TabsList>
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
                <VariableCostPage />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CostManagement;
