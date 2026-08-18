import { serverApi } from "@/lib/api/server";
import { Business } from "@/types";
import { notFound } from "next/navigation";

export default async function BusinessLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  try {
    await serverApi.get<Business>(`/businesses/${id}`);
  } catch {
    notFound();
  }
  return <>{children}</>;
}
