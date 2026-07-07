import { OrderDetail } from "@/features/order";

export const metadata = {
  title: "Order Details — Daygist",
};

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <OrderDetail orderId={id} />
    </div>
  );
}
