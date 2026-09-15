import type { ReactNode } from "react";
import { CheckCircle2, CircleDot } from "lucide-react";
export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: string;
}) {
  return (
    <span className={`badge ${tone}`}>
      <span />
      {children}
    </span>
  );
}
export function Panel({
  title,
  subtitle,
  children,
  extra,
  headingId,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  extra?: ReactNode;
  headingId?: string;
}) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <h2 id={headingId} tabIndex={headingId ? -1 : undefined}>
            {title}
          </h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {extra}
      </div>
      {children}
    </section>
  );
}
export function CheckRow({
  children,
  done = true,
}: {
  children: ReactNode;
  done?: boolean;
}) {
  return (
    <div className={`check-row ${done ? "" : "incomplete"}`}>
      {done ? <CheckCircle2 size={17} /> : <CircleDot size={17} />}
      <span>{children}</span>
    </div>
  );
}
export function title(
  eyebrow: string,
  heading: string,
  description: string,
  action?: ReactNode,
) {
  return (
    <div className="page-heading">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{heading}</h1>
        <p>{description}</p>
      </div>
      {action}
    </div>
  );
}
