import OrderDetailClient from "./OrderDetailClient";

export default async function OrderDetailPage({ params }) {
  const { id } = await params;
  return <OrderDetailClient orderId={id} />;
}
