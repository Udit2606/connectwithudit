import Link from "next/link";

import { site } from "@/data/site";

export default function NotFound() {
  return (
    <div className="flex min-h-[100svh] flex-col justify-center py-24 gut">
      <span className="label text-amber">404</span>
      <h1 className="display mt-6 text-d2 text-bone">
        No route
        <br />
        to that page.
      </h1>
      <p className="mt-7 max-w-[44ch] text-lead leading-[1.6] text-ash">
        The link resolved, the handler didn&rsquo;t. Nothing here has that
        address — try the work instead.
      </p>
      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/"
          className="label rounded-full bg-bone px-6 py-3.5 text-void transition-colors hover:bg-amber"
        >
          Back to start
        </Link>
        <Link
          href="/#work"
          className="label rounded-full border border-line-strong px-6 py-3.5 text-bone transition-colors hover:border-amber hover:text-amber"
        >
          Selected work
        </Link>
      </div>
      <p className="label mt-16 text-faint">
        {site.name} — {site.role}
      </p>
    </div>
  );
}
