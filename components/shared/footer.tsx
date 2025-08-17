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
                    <li><Link href="/#" className="">Become a seller</Link></li>
                    <li><Link href="/about" className="">About us</Link></li>
                    <li><Link href="/products" className="">Career</Link></li>
                    <li><Link href="/contact" className="">FAQ</Link></li>
                </ul>
            </div>

            {/* Cột 3: Danh mục sản phẩm */}
            <div>
                <h3 className="font-semibold mb-3">Terms & Policy</h3>
                <ul className="space-y-2 text-black-700 text-sm">
                    <li><Link href="/category/sofa" className="">Term & Condition</Link></li>
                    <li><Link href="/category/ban-an" className="">Disclaimer</Link></li>
                    <li><Link href="/category/giuong" className="">Privacy Policy</Link></li>
                </ul>
            </div>

            {/* Cột 4: Bản đồ + Social */}
            <div>
                <h3 className="font-semibold mb-3">Contact</h3>
                <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4474729196345!2d106.69272717573601!3d10.776999459181726!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f385570472f%3A0x1787491df0ed8d6a!2zRGluaCDEkOG7mWMgTOG6rXA!5e0!3m2!1svi!2s!4v1755185910394!5m2!1svi!2s"
                    width={350}
                    height={250}
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="w-full"
                />
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
