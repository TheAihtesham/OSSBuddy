import AppShell from "../_components/AppShell";
import { Suspense } from "react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-black dark:border-t-white rounded-full animate-spin" />
          <p className="text-xs text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <AppShell>{children}</AppShell>
    </Suspense>
  );
}
