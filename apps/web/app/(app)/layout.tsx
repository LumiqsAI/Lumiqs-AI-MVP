import { Sidebar } from "@/components/layout/sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell flex min-h-screen overflow-hidden">
      <Sidebar />
      <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto pt-16 lg:pt-0">{children}</main>
    </div>
  );
}
