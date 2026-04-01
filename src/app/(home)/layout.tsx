import type { Metadata } from "next";
import { Gabarito } from "next/font/google";
import "../globals.css";
import Navbar from "@/components/organisms/navbar";
import Providers from "../providers";
import { getSession } from "@/lib/session";


const gabarito = Gabarito({
  variable: "--font-gabarito",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Protocol",
  description: "Protocol",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession().catch(() => null);
  
  const user = session?.user
    ? {
        name: session.user.name,
        username: session.user.id, // Using ID as username for now
        avatar: undefined, // You can add avatar URL if available
      }
    : undefined;

  return (
    <html lang="en">
      <body
        className={`${gabarito.variable} antialiased`}
      >
        <Providers>
          <Navbar user={user} />
          {children}
        </Providers>
      </body>
    </html>
  );
}
