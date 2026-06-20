import React from "react";

type Item = { q: string; a: React.ReactNode };

type Props = { items?: Item[] };

export default function FAQ({ items = [] }: Props) {
  const defaults: Item[] = [
    { q: "How do I apply?", a: "Submit an application and our team will review it." },
    { q: "Who can join?", a: "Founders, operators, investors and senior executives of vetted businesses." },
  ];
  const list = items.length ? items : defaults;

  return (
    <section aria-labelledby="faq-title" className="max-w-4xl mx-auto py-12 px-6">
      <h3 id="faq-title" className="text-2xl font-semibold mb-4">
        Frequently asked questions
      </h3>
      <div className="space-y-3">
        {list.map((it, idx) => (
          <details key={idx} className="group border border-neutral-200 rounded-lg p-4 open:shadow-sm">
            <summary className="cursor-pointer list-none flex justify-between items-center">
              <span className="font-medium">{it.q}</span>
              <span className="ml-4 text-neutral-500 group-open:rotate-180 transition-transform duration-150">▾</span>
            </summary>
            <div className="mt-3 text-neutral-700">{it.a}</div>
          </details>
        ))}
      </div>
    </section>
  );
}
