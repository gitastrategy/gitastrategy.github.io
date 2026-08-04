import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  intro,
}: {
  eyebrow: string;
  title: string;
  intro: string;
}) {
  return (
    <section className="surface-dusk">
      <div className="mx-auto max-w-4xl px-5 py-20 text-center sm:py-24">
        <p className="eyebrow rise-in text-[var(--gold)]">{eyebrow}</p>
        <h1 className="rise-in mt-4 text-4xl font-semibold sm:text-5xl">{title}</h1>
        <p className="rise-in mx-auto mt-5 max-w-2xl text-base opacity-80">{intro}</p>
      </div>
    </section>
  );
}

export function Section({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`mx-auto max-w-6xl px-5 py-16 ${className}`}>{children}</section>
  );
}
