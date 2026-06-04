"use client";

import { useState } from "react";
import { getAffiliateIconConfig } from "@/data/data";

type AffiliateChannelIconProps = {
  code?: string | null;
  name?: string | null;
  size?: "sm" | "md";
};

const sizeClasses = {
  sm: "size-6 text-[0.65rem]",
  md: "size-8 text-xs",
};

const AffiliateChannelIcon = ({
  code,
  name,
  size = "md",
}: AffiliateChannelIconProps) => {
  const icon = getAffiliateIconConfig(code, name);
  const [imageError, setImageError] = useState(false);
  const shouldRenderImage = Boolean(icon.imageUrl && !imageError);

  return (
    <span
      className={`${sizeClasses[size]} inline-flex shrink-0 items-center justify-center font-bold tracking-tight`}
      style={{ color: icon.foreground }}
      aria-hidden="true"
    >
      {shouldRenderImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={icon.imageUrl}
          alt=""
          className="size-full object-contain"
          loading="lazy"
          onError={() => setImageError(true)}
        />
      ) : (
        icon.label
      )}
    </span>
  );
};

export default AffiliateChannelIcon;
