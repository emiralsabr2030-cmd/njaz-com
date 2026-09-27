import { Link } from "@tanstack/react-router";
import { Building2, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EMPLOYMENT_LABELS, WORK_MODE_LABELS, formatDate, type EmploymentType, type WorkMode } from "@/lib/constants";

export type JobCardData = {
  id: string;
  slug: string;
  title: string;
  employment_type: EmploymentType;
  work_mode: WorkMode;
  published_at: string | null;
  companies: { name: string; slug: string } | null;
  locations: { city_ar: string } | null;
};

export const JOB_CARD_SELECT =
  "id, slug, title, employment_type, work_mode, published_at, companies(name, slug), locations(city_ar)";

export function JobCard({ job }: { job: JobCardData }) {
  return (
    <Link
      to="/jobs/$slug"
      params={{ slug: job.slug }}
      className="block rounded-2xl border bg-card p-5 transition-shadow hover:shadow-soft focus-visible:outline-2 focus-visible:outline-ring"
    >
      <h3 className="truncate text-lg font-bold text-primary">{job.title}</h3>
      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
        {job.companies && (
          <span className="inline-flex items-center gap-1">
            <Building2 className="size-4" aria-hidden /> {job.companies.name}
          </span>
        )}
        {job.locations && (
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-4" aria-hidden /> {job.locations.city_ar}
          </span>
        )}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Badge variant="secondary">{EMPLOYMENT_LABELS[job.employment_type]}</Badge>
        <Badge className="bg-accent text-accent-foreground hover:bg-accent">{WORK_MODE_LABELS[job.work_mode]}</Badge>
        {job.published_at && <span className="ms-auto text-xs text-muted-foreground">{formatDate(job.published_at)}</span>}
      </div>
    </Link>
  );
}
