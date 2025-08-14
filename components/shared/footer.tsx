import React from "react";
import Image from "next/image";
import Link from "next/link";

const Footer = () => {
    return (
        <footer className="bg-white shadow-2xl text-black w-full grid grid-cols-4 gap-6 p-8 rounded-tl-2xl rounded-tr-2xl">
            {/* Cột 1: Logo */}
            <div>
                <div className="flex items-center gap-3 mb-4">
                    <Image src="/logo.svg" alt="P Furniture Logo" width={40} height={40} />
                    <span className="text-xl font-bold">P Furniture</span>
                </div>
                <p className="text-sm text-gray-400">
                    Mang đến cho bạn những sản phẩm nội thất chất lượng và tinh tế.
                </p>
            </div>

            {/* Cột 2: Các trang */}
            <div>
                <h3 className="font-semibold mb-3">Trang</h3>
                <ul className="space-y-2 text-gray-400 text-sm">
                    <li><Link href="/#" className="hover:text-white">Trang chủ</Link></li>
                    <li><Link href="/about" className="hover:text-white">Giới thiệu</Link></li>
                    <li><Link href="/products" className="hover:text-white">Sản phẩm</Link></li>
                    <li><Link href="/contact" className="hover:text-white">Liên hệ</Link></li>
                </ul>
            </div>

            {/* Cột 3: Danh mục sản phẩm */}
            <div>
                <h3 className="font-semibold mb-3">Danh mục</h3>
                <ul className="space-y-2 text-gray-400 text-sm">
                    <li><Link href="/category/sofa" className="hover:text-white">Sofa</Link></li>
                    <li><Link href="/category/ban-an" className="hover:text-white">Bàn ăn</Link></li>
                    <li><Link href="/category/giuong" className="hover:text-white">Giường ngủ</Link></li>
                    <li><Link href="/category/tu-quan-ao" className="hover:text-white">Tủ quần áo</Link></li>
                </ul>
            </div>

            {/* Cột 4: Bản đồ + Social */}
            <div>
                <h3 className="font-semibold mb-3">Địa chỉ</h3>
                <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.5023358887835!2d106.70042387585859!3d10.773374089378272!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f482e5fef8d%3A0x3a99376a5e0e02d1!2zMjIzIE5ndXnhu4VuIFRy4buNdSwgUGjGsOG7nW5nIDUsIFF14bqtbiAxLCBUaMOgbmggcGjhu5EgSG8gQ2jDrSBNaW5oLCBWaWV0bmFt!5e0!3m2!1svi!2s!4v1692000000000!5m2!1svi!2s"
                    width="100%"
                    height="120"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                ></iframe>
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
