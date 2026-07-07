import { MyOrdersList } from "@/features/order";

export const metadata = {
  title: "My Orders — Daygist",
};

export default function OrdersPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>
      <MyOrdersList />
    </div>
  );
}
