import React from "react";

type Props = {
  title?: string;
  paragraphs?: string[];
  ctaLabel?: string;
  ctaHref?: string;
};

export default function AboutUs({
  title = "About the Club",
  paragraphs = [],
  ctaLabel = "Join now",
  ctaHref = "#",
}: Props) {
  return (
    <section aria-labelledby="about-title" className="max-w-4xl mx-auto py-12 px-6">
      <div className="prose prose-lg">
        <h2 id="about-title" className="text-3xl font-semibold">
          {title}
        </h2>
        {paragraphs.length ? (
          paragraphs.map((p, i) => (
            <p key={i} className="text-neutral-700">
              {p}
            </p>
          ))
        ) : (
          <>
            <p className="text-neutral-700">
              Private business club for verified founders, operators and investors. We
              run curated events, one-on-one introductions and member-only
              opportunities.
            </p>
            <p className="text-neutral-700">
              Membership is selective — we focus on quality connections, confidentiality
              and tangible B2B introductions.
            </p>
          </>
        )}
        <div className="mt-6">
          <a
            href={ctaHref}
            className="inline-flex items-center gap-2 rounded-md bg-indigo-600 text-white px-4 py-2 hover:brightness-105 active:scale-95 transition-transform duration-150 ease-out"
          >
            {ctaLabel}
          </a>
        </div>
      </div>
    </section>
  );
}
