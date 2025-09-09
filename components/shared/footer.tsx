import React from "react";
import Image from "next/image";
import Link from "next/link";

const Footer = () => {
    return (
        <footer className="bg-white shadow-2xl text-black w-full grid xl:grid-cols-4 grid-cols-2 xl:gap-6 gap-4 p-8 rounded-tl-2xl rounded-tr-2xl">
            {/* Cột 1: Logo */}
            <div>
                <div className="space-y-2">
                    <p className="text-3xl text-secondary font-semibold">
                        Prestige Home GmbH
                    </p>
                    <p className="text-sm text-black-700">Greifswalder Straße 226, 10405 Berlin.</p>
                    <p className="text-sm text-black-700">Tax code: DE454714336</p>
                </div>
            </div>

            {/* Cột 2: Các trang */}
            <div>
                <h3 className="font-semibold mb-3">Pages</h3>
                <ul className="space-y-2 text-black-700 text-sm">
                    <li><Link href="/" className="">About us</Link></li>
                    <li><Link href="/" className="">Career</Link></li>
                    <li><Link href="/faq" className="">FAQ</Link></li>
                </ul>
            </div>

            {/* Cột 3: Danh mục sản phẩm */}
            <div>
                <h3 className="font-semibold mb-3">Terms & Policy</h3>
                <ul className="space-y-2 text-black-700 text-sm">
                    <li><Link href="/policy" className="">Term & Condition</Link></li>
                    <li><Link href="/policy" className="">Disclaimer</Link></li>
                    <li><Link href="/policy" className="">Privacy Policy</Link></li>
                </ul>
            </div>

            {/* Cột 4: Bản đồ + Social */}
            <div>
                <h3 className="font-semibold mb-3">Contact</h3>
                <div className="flex gap-3 mt-3">
                    <Image
                        src={'/fb.png'}
                        width={50}
                        height={50}
                        alt="fb"
                        className="w-12 h-12 object-fill"
                    />
                    <Image
                        src={'/x.png'}
                        width={50}
                        height={50}
                        alt="fb"
                        className="w-12 h-12 object-fill"

                    />
                    <Image
                        src={'/insta.png'}
                        width={50}
                        height={50}
                        alt="fb"
                        className="w-12 h-12 object-fill"

                    />
                </div>
            </div>
        </footer>
    );
};

export default Footer;
