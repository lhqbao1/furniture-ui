interface QuantityControlProps {
  quantity: number;
  onDecrease: () => void;
  onIncrease: () => void;
  isLoading?: boolean;
  decreaseLabel: string;
  increaseLabel: string;
  quantityLabel: string;
  // stock: number;
}

const QuantityControl = ({
  quantity,
  onDecrease,
  onIncrease,
  isLoading,
  decreaseLabel,
  increaseLabel,
  quantityLabel,
}: // stock,
QuantityControlProps) => {
  return (
    <div className="flex items-center border rounded-md overflow-hidden">
      <button
        type="button"
        onClick={onDecrease}
        aria-label={decreaseLabel}
        className="min-h-9 min-w-9 px-3 py-1 hover:bg-gray-100 disabled:opacity-40 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-1"
        // disabled={isLoading}
      >
        −
      </button>

      <input
        type="number"
        value={quantity ?? 0}
        readOnly
        aria-label={quantityLabel}
        className="w-12 text-center border-x focus:outline-none bg-white"
      />

      <button
        type="button"
        onClick={onIncrease}
        aria-label={increaseLabel}
        className="min-h-9 min-w-9 px-3 py-1 hover:bg-gray-100 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-1"
        // disabled={isLoading}
      >
        +
      </button>
    </div>
  );
};

export default QuantityControl;
