import { Topbar } from "./_components/topbar";
import { Sidebar } from "./_components/sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg">
      <Topbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8 max-md:p-4 max-md:pb-12">
          <div className="max-w-[900px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
