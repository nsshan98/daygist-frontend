import type { Metadata } from "next";
import { Baumans, Gabarito, Plus_Jakarta_Sans } from "next/font/google";
import "../globals.css";
import Navbar from "@/components/organisms/navbar";
import Providers from "../providers";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
});

const gabarito = Gabarito({
  variable: "--font-gabarito",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Protocol",
  description: "Protocol",
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${plusJakartaSans.variable} ${gabarito.variable} antialiased`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
