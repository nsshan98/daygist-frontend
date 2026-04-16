import type { Metadata } from "next";
import Providers from "../providers";

export const metadata: Metadata = {
  title: "Daygist",
  description: "Daygist",
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Providers>
      {children}
    </Providers>
  );
}
