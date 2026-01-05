"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Users, ShoppingCart, Euro } from "lucide-react";

interface DashboardStatsProps {
  total_item: number;
  total_quantity: number;
  total_amount: number;
}

export function DashboardStats({
  total_item,
  total_quantity,
  total_amount,
}: DashboardStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Total Providers */}
      <Card>
        <CardContent className="flex items-center gap-4 p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <Users className="h-6 w-6" />
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Total items</p>
            <p className="text-2xl font-semibold">{total_item}</p>
          </div>
        </CardContent>
      </Card>

      {/* Total Quantity */}
      <Card>
        <CardContent className="flex items-center gap-4 p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
            <ShoppingCart className="h-6 w-6" />
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Total items sold</p>
            <p className="text-2xl font-semibold">{total_quantity}</p>
          </div>
        </CardContent>
      </Card>

      {/* Total Revenue */}
      <Card>
        <CardContent className="flex items-center gap-4 p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-600">
            <Euro className="h-6 w-6" />
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Total Revenue</p>
            <p className="text-2xl font-semibold">€{total_amount}</p>
            {/* <p className="text-sm text-muted-foreground">€157,728.73</p> */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
