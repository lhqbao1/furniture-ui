import Image from "next/image";

interface BannerProps {
  height?: number;
  isHome?: boolean;
}

const Banner = ({ height, isHome = false }: BannerProps) => {
  const isPriority = Boolean(isHome);

  return (
    <div
      className="relative w-full flex-shrink-0 z-0 h-[200px] lg:h-[300px] 2xl:h-[550px] block"
      style={height ? { height: `${height}px` } : undefined}
    >
      {/* Background image */}
      <Image
        src="/home-banner1.webp"
        alt="Banner"
        fill
        priority={isPriority}
        fetchPriority={isPriority ? "high" : "auto"}
        loading={isPriority ? "eager" : "lazy"}
        className="object-cover"
        quality={80}
        unoptimized
        sizes="
          (max-width: 640px) 100vw,
          (max-width: 1024px) 100vw,
          100vw
        "
      />
    </div>
  );
};

export default Banner;
