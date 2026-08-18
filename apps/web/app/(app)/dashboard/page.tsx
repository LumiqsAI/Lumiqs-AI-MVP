import { auth } from "@clerk/nextjs/server";
import { serverApi } from "@/lib/api/server";
import { DashboardData } from "@/types";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) return null;

  let data: DashboardData | null = null;
  try {
    data = await serverApi.get<DashboardData>("/users/dashboard");
  } catch {
    // handled in client
  }

  return <DashboardClient initialData={data} />;
}
