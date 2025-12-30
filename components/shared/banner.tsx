import Image from "next/image";

interface BannerProps {
  height?: number;
  isHome?: boolean;
}

const Banner = ({ height, isHome = false }: BannerProps) => {
  return (
    <div
      className="relative w-full flex-shrink-0 z-0 h-[200px] lg:h-[300px] 2xl:h-[750px] block"
      style={height ? { height: `${height}px` } : undefined}
    >
      {/* Background image */}
      {/* <Image
        src="/home1.webp"
        alt="Banner"
        fill
        priority
        fetchPriority="high"
        // sizes="(min-width: 1024px) 100vw"
        className="object-cover"
        unoptimized
      /> */}
      <video
        src="/video/banner-1.mp4"
        autoPlay={isHome}
        muted
        playsInline
        className="absolute w-full h-full object-cover object-[50%_80%]"
      />
    </div>
  );
};

export default Banner;
