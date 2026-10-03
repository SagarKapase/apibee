import { LearnSidebar } from "@/components/learn-sidebar";

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)]">
      <LearnSidebar />
      <div className="flex-1 min-w-0">
        <div className="max-w-3xl mx-auto px-5 lg:px-8 py-10 sm:py-12">{children}</div>
      </div>
    </div>
  );
}
