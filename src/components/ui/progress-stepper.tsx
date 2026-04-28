import { cn } from "@/lib/utils";

export function ProgressStepper({
  steps,
  current,
}: {
  steps: string[];
  current: number;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      {steps.map((step, index) => {
        const active = index === current;
        const done = index < current;
        return (
          <div
            key={step}
            className={cn(
              "flex items-center gap-3 rounded-2xl border px-3 py-2 text-xs transition md:text-sm",
              active
                ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-100"
                : done
                  ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-100"
                  : "border-white/10 bg-white/5 text-zinc-400",
            )}
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full border border-current/30 text-[11px]">
              {index + 1}
            </span>
            {step}
          </div>
        );
      })}
    </div>
  );
}
