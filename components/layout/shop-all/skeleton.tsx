const FilterSection = () => {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-2"
        >
          {/* Fake checkbox */}
          <div className="h-5 w-5 rounded-sm border border-gray-300 bg-gray-200 animate-pulse" />

          {/* Fake text */}
          <div className="h-5 w-full rounded bg-gray-200 animate-pulse" />
        </div>
      ))}
    </div>
  );
};

export default FilterSection;
