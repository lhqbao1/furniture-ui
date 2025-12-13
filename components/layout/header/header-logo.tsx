import { Link } from "@/src/i18n/navigation";
import Image from "next/image";
import React from "react";

const HeaderLogo = () => {
  return (
    <div className={`flex flex-row gap-2 items-center`}>
      <Link
        href={`/`}
        aria-label="Go to homepage"
        className="relative w-16 h-16 flex"
      >
        <Image
          src="/new-logo.svg"
          alt="Go to homepage"
          fill
          style={{ objectFit: "contain" }}
        />
      </Link>
      <Link href={"/"}>
        <div
          className="hidden lg:flex text-[29px] gap-1"
          translate="no"
        >
          <span className="text-secondary font-bold">Prestige</span>
          <span className="text-primary font-bold">Home</span>
        </div>
      </Link>
    </div>
  );
};

export default HeaderLogo;
