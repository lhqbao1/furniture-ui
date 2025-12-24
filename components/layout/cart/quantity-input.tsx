interface QuantityControlProps {
  quantity: number;
  onDecrease: () => void;
  onIncrease: () => void;
  isLoading?: boolean;
  // stock: number;
}

const QuantityControl = ({
  quantity,
  onDecrease,
  onIncrease,
  isLoading,
}: // stock,
QuantityControlProps) => {
  return (
    <div className="flex items-center border rounded-md overflow-hidden">
      <button
        type="button"
        onClick={onDecrease}
        className="px-3 py-1 hover:bg-gray-100 disabled:opacity-40 cursor-pointer"
        // disabled={isLoading}
      >
        −
      </button>

      <input
        type="number"
        value={quantity}
        readOnly
        className="w-10 text-center border-x focus:outline-none bg-white"
      />

      <button
        type="button"
        onClick={onIncrease}
        className="px-3 py-1 hover:bg-gray-100 cursor-pointer"
        // disabled={isLoading}
      >
        +
      </button>
    </div>
  );
};

export default QuantityControl;
