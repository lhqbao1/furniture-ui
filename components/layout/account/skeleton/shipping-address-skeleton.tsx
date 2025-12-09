"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import React from "react";

export const AddressListSkeleton = () => {
  return (
    <div className="grid grid-cols-2 gap-4">
      {[1, 2].map((i) => (
        <Card
          key={i}
          className="col-span-2 lg:col-span-1 border-secondary border-2 animate-pulse"
        >
          <CardContent className="space-y-3 py-4">
            <div className="h-4 w-40 bg-muted rounded"></div>
            <div className="h-4 w-32 bg-muted rounded"></div>
            <div className="h-4 w-28 bg-muted rounded"></div>

            <div className="h-4 w-36 bg-muted rounded"></div>
            <div className="h-4 w-24 bg-muted rounded"></div>
          </CardContent>

          <CardFooter className="px-2 justify-center">
            <div className="flex gap-2">
              <div className="h-8 w-20 bg-muted rounded"></div>
              <div className="h-8 w-24 bg-muted rounded"></div>
              <div className="h-8 w-20 bg-muted rounded"></div>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};
