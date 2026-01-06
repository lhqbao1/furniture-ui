import Image from "next/image";

interface BannerProps {
  height?: number;
  isHome?: boolean;
}

const Banner = ({ height, isHome = false }: BannerProps) => {
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
        priority
        fetchPriority="high"
        // sizes="(min-width: 1024px) 100vw"
        className="object-cover"
        unoptimized
        sizes="
          (max-width: 640px) 100vw,
          (max-width: 1024px) 100vw,
          100vw
        "
      />
      {/* <Image
        src="/short-banner.jpg"
        alt="Banner"
        fetchPriority="high"
        width={1900}
        height={200}
        // sizes="(min-width: 1024px) 100vw"
        className="object-cover"
        unoptimized
      /> */}
    </div>
  );
};

export default Banner;
