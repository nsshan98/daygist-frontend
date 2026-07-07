import { CheckoutForm } from "@/features/order";

export const metadata = {
  title: "Checkout — Daygist",
};

export default function CheckoutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <CheckoutForm />
    </div>
  );
}
