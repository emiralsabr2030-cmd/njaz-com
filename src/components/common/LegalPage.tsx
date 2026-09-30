import type { ReactNode } from "react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { formatDate } from "@/lib/constants";
import { useSiteContent, type ContentKey } from "@/lib/site-content";

/** Renders simple markup: lines starting with "## " become headings, blank lines split paragraphs. */
export function RichText({ text }: { text: string }) {
  return (
    <>
      {text.split(/\n{2,}/).map((block, i) =>
        block.startsWith("## ") ? <h2 key={i}>{block.slice(3).trim()}</h2> : <p key={i} className="whitespace-pre-line">{block.trim()}</p>,
      )}
    </>
  );
}

export function LegalPage({ title, contentKey, children }: { title: string; contentKey: ContentKey; children: ReactNode }) {
  const c = useSiteContent(contentKey);
  const body = c.data?.body?.trim();
  return (
    <PublicLayout>
      <div className="border-b bg-card">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
          <h1 className="text-3xl font-extrabold text-primary sm:text-4xl">{c.data?.title || title}</h1>
          {c.data?.updated_at && <p className="mt-2 text-sm text-muted-foreground">آخر تحديث: {formatDate(c.data.updated_at)}</p>}
        </div>
      </div>
      <article className="mx-auto max-w-3xl px-4 py-10">
        <div className="space-y-5 leading-8 [&_h2]:pt-2 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-primary">
          {c.isLoading ? <div className="h-40 animate-pulse rounded-xl bg-muted" /> : body ? <RichText text={body} /> : children}
        </div>
      </article>
    </PublicLayout>
  );
}
