import * as React from "react";

export type PecoLogoSize = "sm" | "md" | "lg";
export type PecoLogoColor = "white" | "primary";

export interface PecoLogoProps {
  size?: PecoLogoSize;
  color?: PecoLogoColor;
  subtitle?: string;
  className?: string;
}

const sizeMap: Record<PecoLogoSize, { wordmark: string; subtitle: string; gap: string }> = {
  sm: { wordmark: "text-base", subtitle: "text-[10px]", gap: "gap-0" },
  md: { wordmark: "text-xl", subtitle: "text-[11px]", gap: "gap-0" },
  lg: { wordmark: "text-3xl", subtitle: "text-xs", gap: "gap-0.5" },
};

export function PecoLogo({
  size = "md",
  color = "white",
  subtitle = "Smart Pet Medical",
  className = "",
}: PecoLogoProps) {
  const s = sizeMap[size];
  const wordmarkColor = color === "white" ? "text-white" : "text-peco-primary";
  const subtitleColor = color === "white" ? "text-white/80" : "text-peco-primary/70";

  return (
    <div
      className={`inline-flex flex-col leading-none ${s.gap} ${className}`}
      aria-label="SPM Smart Pet Medical"
    >
      <span className={`font-bold tracking-tight ${s.wordmark} ${wordmarkColor}`}>SPM</span>
      {subtitle ? (
        <span className={`font-medium tracking-wide uppercase ${s.subtitle} ${subtitleColor}`}>
          {subtitle}
        </span>
      ) : null}
    </div>
  );
}

export default PecoLogo;
