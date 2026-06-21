import "server-only";

import React from "react";

import AboutUs from "../../components/premium/AboutUs";
import FAQ from "../../components/premium/FAQ";
import Follow from "../../components/premium/Follow";

export default function Page() {
  return (
    <main className="space-y-12 py-12">
      <AboutUs />
      <FAQ />
      <div className="max-w-4xl mx-auto">
        <Follow />
      </div>
    </main>
  );
}
