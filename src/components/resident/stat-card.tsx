export function StatCard({
  label,
  value,
  note,
  accent = "sand",
}: {
  label: string;
  value: string;
  note: string;
  accent?: "sand" | "mint" | "ink";
}) {
  const accentClasses = {
    sand: "bg-[#f5ecd9] text-[#5f4c2a]",
    mint: "bg-[#dff3ea] text-[#215b47]",
    ink: "bg-[#1f2937] text-white",
  };

  return (
    <article className="rounded-[1.5rem] border border-[#e8e0cf] bg-white p-5 shadow-[0_12px_40px_rgba(77,62,28,0.06)]">
      <div
        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] ${accentClasses[accent]}`}
      >
        {label}
      </div>
      <h3 className="mt-4 text-3xl font-semibold tracking-tight text-[#1f2937]">
        {value}
      </h3>
      <p className="mt-2 text-sm leading-6 text-[#6b7280]">{note}</p>
    </article>
  );
}
