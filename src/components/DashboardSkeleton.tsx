import { Sprout } from 'lucide-react';

type Props = {
  theme: string;
  title: string;
  hint: string;
};

export default function DashboardSkeleton({ theme, title, hint }: Props) {
  return (
    <div className={`living-field-root ${theme} dashboard-loading-shell`} role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">{title}. {hint}</span>
      <aside className="dashboard-skeleton-sidebar" aria-hidden="true">
        <span className="dashboard-skeleton-brand"><Sprout className="h-5 w-5" /></span>
        {Array.from({ length: 6 }, (_, index) => <i key={index} />)}
      </aside>
      <div className="dashboard-skeleton-content" aria-hidden="true">
        <header><span /><span /></header>
        <main>
          <section className="dashboard-skeleton-hero"><div><i /><i /><i /></div><b /></section>
          <section className="dashboard-skeleton-grid">
            <div /><div /><div /><div />
          </section>
        </main>
      </div>
      <div className="dashboard-loading-copy">
        <Sprout className="h-5 w-5" />
        <span><strong>{title}</strong><small>{hint}</small></span>
      </div>
    </div>
  );
}
