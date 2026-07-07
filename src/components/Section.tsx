import { ReactNode } from "react";

export function Section({
  id,
  children,
  className = "",
  containerClassName = "",
}: {
  id?: string;
  children: ReactNode;
  className?: string;
  containerClassName?: string;
}) {
  return (
    <section id={id} className={`py-16 md:py-24 scroll-mt-20 ${className}`}>
      <div className={`container mx-auto max-w-7xl px-4 lg:px-8 ${containerClassName}`}>
        {children}
      </div>
    </section>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = "center",
}: {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: "center" | "left";
}) {
  const alignCls = align === "center" ? "text-center mx-auto" : "text-left";
  return (
    <div className={`max-w-3xl ${alignCls} mb-12`}>
      {eyebrow && (
        <span className="inline-block text-xs font-semibold tracking-[0.18em] uppercase text-primary mb-3">
          {eyebrow}
        </span>
      )}
      <h2 className="font-display text-3xl md:text-5xl font-semibold leading-[1.1] text-foreground">
        {title}
      </h2>
      {subtitle && <p className="mt-4 text-lg text-muted-foreground">{subtitle}</p>}
    </div>
  );
}
