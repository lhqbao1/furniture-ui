import React from "react";
import DSPProductAddClient from "./dsp-add-client";

const ProductAddDsp = () => {
  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-12 flex flex-col gap-6">
        <DSPProductAddClient />
      </div>
    </div>
  );
};

export default ProductAddDsp;
