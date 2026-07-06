import { ProductDetail } from "@/features/marketplace/components/product-detail";
import { FloatingCart } from "@/features/marketplace/components/floating-cart";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <>
      <ProductDetail productId={id} />
      <FloatingCart />
    </>
  );
}
