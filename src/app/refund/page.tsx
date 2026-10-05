import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Refund policy",
  description: `Wisp comes with a ${site.refundDays}-day money-back guarantee.`,
  alternates: { canonical: "/refund" },
};

export default function Refund() {
  return (
    <LegalPage title="Refund policy">
      <p>
        If Wisp isn&apos;t right for you, you can get a full refund within <b>{site.refundDays} days</b> of your purchase.
        You don&apos;t need to give a reason.
      </p>

      <h2>How to get a refund</h2>
      <ul>
        <li>Email <a href={`mailto:${site.email}`}>{site.email}</a> from the address you used to buy Wisp, or reply to your receipt.</li>
        <li>Include your order number if you have it. It&apos;s in your receipt email.</li>
        <li>You can also request a refund from the order page linked in your receipt.</li>
      </ul>

      <h2>What happens next</h2>
      <ul>
        <li>We process refund requests within 2 business days.</li>
        <li>The money goes back to the payment method you used. Depending on your bank, it can take 5–10 business days to appear.</li>
        <li>Once the refund is issued, your purchase email no longer unlocks updates.</li>
      </ul>

      <h2>Who processes the payment</h2>
      <p>
        Our order process is handled by our online reseller Lemon Squeezy, who is the merchant of record for all orders and
        issues the refund.
      </p>

      <h2>After {site.refundDays} days</h2>
      <p>
        Purchases older than {site.refundDays} days aren&apos;t refundable, except where the law in your country says otherwise.
        If something isn&apos;t working, email us anyway and we&apos;ll help.
      </p>
    </LegalPage>
  );
}
