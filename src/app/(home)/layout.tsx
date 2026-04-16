import type { Metadata } from "next";
import Navbar from "@/components/organisms/navbar";
import Providers from "../providers";
import { getSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Daygist",
  description: "Daygist",
};

export default async function HomeLayout({
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
    <Providers>
      <Navbar user={user} />
      {children}
    </Providers>
  );
}
