"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import React from "react";

export const InvoiceAddressSkeleton = () => {
  return (
    <Card className="border-secondary border-2 animate-pulse">
      <CardContent className="space-y-3 py-4">
        <div className="h-4 w-40 bg-muted rounded"></div>
        <div className="h-4 w-32 bg-muted rounded"></div>
        <div className="h-4 w-28 bg-muted rounded"></div>
        <div className="h-4 w-24 bg-muted rounded"></div>

        <div className="h-4 w-36 bg-muted rounded"></div>
        <div className="h-4 w-28 bg-muted rounded"></div>
      </CardContent>

      <CardFooter>
        <div className="h-8 w-20 bg-muted rounded"></div>
      </CardFooter>
    </Card>
  );
};
