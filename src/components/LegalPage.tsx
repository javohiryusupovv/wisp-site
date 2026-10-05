import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { site } from "@/lib/site";

const updated = new Date(site.legalUpdated).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });

/** Shared shell for the Refund, Terms and Privacy pages. */
export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="legal">
      <header className="legal-top">
        <Link className="brand" href="/">
          <Image src="/brand/wisp-mark.png" alt="" width={24} height={24} unoptimized />
          Wisp
        </Link>
        <nav aria-label="Legal">
          <Link href="/refund">Refund</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/privacy">Privacy</Link>
        </nav>
      </header>
      <main className="legal-body">
        <h1>{title}</h1>
        <p className="legal-date">Last updated {updated}</p>
        {children}
        <p className="legal-contact">
          Questions? Email <a href={`mailto:${site.email}`}>{site.email}</a>.
        </p>
      </main>
    </div>
  );
}
