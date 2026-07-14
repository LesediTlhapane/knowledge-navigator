import estudyWordmark from "@/assets/estudy-wordmark.png.asset.json";
import estudyMark from "@/assets/estudy-mark.png.asset.json";
import type { ReactNode } from "react";

interface Props {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
}

export function BrandHeader({ eyebrow, title, description, actions }: Props) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-primary text-primary-foreground shadow-[var(--shadow-brand)]">
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle at 85% 15%, oklch(0.72 0.17 158 / 0.35), transparent 45%), radial-gradient(circle at 15% 90%, oklch(0.4 0.13 262 / 0.7), transparent 55%)",
        }}
      />
      <div className="relative flex flex-col gap-6 p-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-5">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white shadow-lg">
            <img src={estudyMark.url} alt="eStudy mark" className="h-11 w-11 object-contain" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
              {eyebrow}
            </p>
            <h1 className="mt-2 text-2xl font-bold leading-tight lg:text-3xl">{title}</h1>
            <p className="mt-2 max-w-2xl text-sm text-primary-foreground/75">{description}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 lg:flex-col lg:items-end">
          <img
            src={estudyWordmark.url}
            alt="eStudy South Africa"
            className="h-6 w-auto object-contain brightness-0 invert opacity-90"
          />
          {actions}
        </div>
      </div>
    </div>
  );
}