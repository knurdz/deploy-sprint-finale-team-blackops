import { Sparkles } from 'lucide-react';
import type { Course } from '../data/courses';

type InsightsProps = {
  courses: Course[];
};

const showInsights = import.meta.env.VITE_FEATURE_SHOW_INSIGHTS === 'true';

export function Insights({ courses }: InsightsProps) {
  if (!showInsights) {
    return null;
  }

  const needsAttention = courses.filter((course) => course.progress < 60);

  return (
    <section className="panel insightsPanel" id="insights" aria-label="Insights">
      <div className="panelHeader">
        <div>
          <p className="eyebrow">Insights</p>
          <h2>Cohorts needing attention</h2>
        </div>
        <Sparkles size={22} />
      </div>
      {needsAttention.length === 0 ? (
        <p>Every course is at or above release pace.</p>
      ) : (
        <ul className="readinessList">
          {needsAttention.map((course) => (
            <li key={course.id} className="readinessItem readiness-watch">
              <span>{course.title}</span>
              <em>{course.progress}%</em>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
