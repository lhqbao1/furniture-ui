import StickyMonthSelector from "@/components/layout/admin/accountant/cost/sticky-month-selector";
import React from "react";

const CostManagement = () => {
  return (
    <div className="space-y-3">
      <StickyMonthSelector />
      <div className="h-[2000px]"></div>
    </div>
  );
};

export default CostManagement;
