import { serverApi } from "@/lib/api/server";
import { Business } from "@/types";
import { BusinessesClient } from "./businesses-client";

export default async function BusinessesPage() {
  let businesses: Business[] = [];
  try {
    businesses = await serverApi.get<Business[]>("/businesses");
  } catch {
    // handled in client
  }
  return <BusinessesClient initialBusinesses={businesses} />;
}
