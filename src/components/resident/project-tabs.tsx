import Link from "next/link";
import type { ResidentProject } from "@/lib/resident-dashboard-data";

export function ProjectTabs({
  projects,
}: {
  projects: ResidentProject[];
}) {
  return (
    <section className="rounded-[1.75rem] border border-[#e8e0cf] bg-white p-5 shadow-[0_12px_40px_rgba(77,62,28,0.06)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.26em] text-[#8d6e3b]">
            Initiatives
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#1f2937]">
            Open an initiative to see dues, payments, and balance
          </h2>
        </div>
        <div className="rounded-full bg-[#f6f2e9] px-4 py-2 text-sm font-medium text-[#6b7280]">
          {projects.length} active
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {projects.map((project) => (
          <Link
            key={project.id}
            href={`/initiative/${project.slug}`}
            className="flex flex-col gap-4 rounded-[1.5rem] border border-[#ede5d5] bg-[#fcfbf8] p-5 transition hover:border-[#d7c39b] hover:bg-white hover:shadow-[0_18px_45px_rgba(95,76,42,0.08)] sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-xl font-semibold text-[#1f2937]">{project.name}</h3>
                <span className="rounded-full bg-[#e8f3ec] px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[#215b47]">
                  {project.frequency}
                </span>
              </div>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6b7280]">
                {project.description}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <div className="rounded-[1.25rem] bg-white px-4 py-3 text-right shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8d6e3b]">
                  Due
                </p>
                <p className="mt-1 text-lg font-semibold text-[#1f2937]">
                  Rs {project.monthlyAmount.toLocaleString("en-IN")}
                </p>
              </div>
              <div className="text-sm font-semibold text-[#215b47]">View details</div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
