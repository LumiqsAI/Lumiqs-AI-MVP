import { Spinner } from "@/components/ui/loading";

export default function AppLoading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center" role="status" aria-label="Loading page">
      <Spinner size="lg" />
    </div>
  );
}
