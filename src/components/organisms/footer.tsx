"use client";

import Image from "next/image";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-12">
          {/* Left Section - Logo and Description */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <p className="font-baumans text-2xl text-center bg-[#2445CE] text-white rounded-md px-2">
                P
              </p>
              <p className="font-baumans text-2xl uppercase">Daygist </p>
            </div>
            <p className="text-sm leading-relaxed">
              Empowering you to take charge of your financial future with
              intuitive tools and personalized insights.
            </p>
          </div>

          {/* Products Column */}
          <div>
            <h3 className="font-bold mb-4">Products</h3>
            <ul className="space-y-3">
              <li>
                <Link href="#" className="text-sm">
                  About
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm">
                  Blog Details
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Column */}
          <div>
            <h3 className="font-bold mb-4">Support</h3>
            <ul className="space-y-3">
              <li>
                <Link href="#" className="text-sm">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm">
                  Live chat
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h3 className="font-bold mb-4">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link href="#" className="text-sm">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm">
                  Reviews
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm">
                  Changelog
                </Link>
              </li>
            </ul>
          </div>

          {/* Right Section - App Store Buttons */}
          <div className="flex flex-col gap-3">
            {/* Google Play Button */}
            <Image
              src="/landing-page/google-play.png"
              alt="Google Play"
              width={200}
              height={200}
            />

            {/* App Store Button */}
            <Image
              src="/landing-page/app-store.png"
              alt="App Store"
              width={200}
              height={200}
            />
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100 pt-8">
          <p className="text-sm">
            Copyright © 2025 Daygist. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
