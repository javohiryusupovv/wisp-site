import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Download", robots: { index: false } };

const reasons: Record<string, { title: string; body: string }> = {
  link: {
    title: "This download link doesn't work",
    body: "Use the Download button in your Wisp receipt email, or the one on your order page. If you copied the link by hand, part of it may be missing.",
  },
  pending: {
    title: "Your payment is still processing",
    body: "The download unlocks as soon as the payment goes through, usually within a minute. Try the link in your receipt again shortly.",
  },
  refunded: {
    title: "This order was refunded",
    body: "Downloads for refunded orders are switched off. If you think this is a mistake, email us.",
  },
  busy: {
    title: "Too many attempts",
    body: "Please wait a few minutes, then use the link from your receipt again.",
  },
  server: {
    title: "Something went wrong on our side",
    body: "We couldn't prepare your download just now. Try the link again in a minute. If it keeps failing, email us with your order number.",
  },
};

export default async function DownloadHelp(props: PageProps<"/download/help">) {
  const { reason } = await props.searchParams;
  const r = reasons[typeof reason === "string" ? reason : ""] ?? reasons.link;
  return (
    <LegalPage title={r.title} dated={false}>
      <p>{r.body}</p>
      <p>
        Lost your receipt? Email <a href={`mailto:${site.email}`}>{site.email}</a> from the address you bought with and
        we&apos;ll send a new download link.
      </p>
    </LegalPage>
  );
}
