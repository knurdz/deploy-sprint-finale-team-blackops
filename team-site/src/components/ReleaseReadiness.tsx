import { AlertTriangle, CheckCircle2, OctagonAlert } from 'lucide-react';
import { releaseReadinessItems, type ReleaseReadinessItem } from '../data/releaseReadiness';

const statusIcons: Record<ReleaseReadinessItem['status'], typeof CheckCircle2> = {
  ready: CheckCircle2,
  watch: AlertTriangle,
  blocked: OctagonAlert,
};

export function ReleaseReadiness() {
  return (
    <section className="panel releaseReadinessPanel" id="release-readiness">
      <div className="panelHeader">
        <div>
          <p className="eyebrow">Release readiness</p>
          <h2>Readiness checks</h2>
        </div>
        <span>{releaseReadinessItems.length} checks</span>
      </div>
      <ul className="readinessList">
        {releaseReadinessItems.map((item) => {
          const Icon = statusIcons[item.status];
          return (
            <li key={item.label} className={`readinessItem readiness-${item.status}`}>
              <Icon size={18} />
              <span>{item.label}</span>
              <em>{item.status}</em>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
