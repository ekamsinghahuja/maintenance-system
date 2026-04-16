import type { ReactNode } from "react";

export function DashboardShell({
  header,
  sidebar,
  children,
}: {
  header: ReactNode;
  sidebar: ReactNode;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#f7f4ed_0%,_#fbfaf7_42%,_#f3efe4_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        {header}
        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          {sidebar}
          <div className="flex min-w-0 flex-col gap-6">{children}</div>
        </div>
      </div>
    </main>
  );
}
