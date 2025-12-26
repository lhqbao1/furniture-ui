import { Link } from "@/src/i18n/navigation";
import Image from "next/image";
import React from "react";

const HeaderLogo = () => {
  return (
    <>
      {/* <div className={`flex-row gap-2 items-center hidden`}>
        <Link
          href={`/`}
          aria-label="Go to homepage"
          className="relative lg:w-16 lg:h-16 h-10 w-10 flex"
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
      </div> */}
      <Link
        href={"/"}
        className="h-full w-full lg:w-auto"
      >
        <Image
          src={"/logo-noel-1.svg"}
          height={200}
          width={200}
          alt=""
          className="block xl:h-16 xl:w-auto h-12 w-auto object-contain cursor-pointer "
        />
      </Link>
    </>
  );
};

export default HeaderLogo;
