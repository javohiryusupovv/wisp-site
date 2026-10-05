import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of service",
  description: "The terms for buying and using Wisp.",
  alternates: { canonical: "/terms" },
};

export default function Terms() {
  const limit: number = site.activationLimit;
  const macs = limit === 1 ? "one Mac" : `up to ${limit} Macs`;
  return (
    <LegalPage title="Terms of service">
      <p>
        These terms apply when you buy or use Wisp, the macOS app, and this website. By buying or using Wisp you agree to
        them.
      </p>

      <h2>Purchases</h2>
      <p>
        Our order process is handled by our online reseller Lemon Squeezy, who is the merchant of record for all orders.
        Lemon Squeezy handles payment, taxes and receipts, and their buyer terms apply to the payment itself.
      </p>
      <p>Prices are shown in US dollars. Taxes may be added at checkout depending on where you live.</p>

      <h2>Your license</h2>
      <ul>
        <li>One purchase gives you a personal license to use Wisp on {macs} that you own or use.</li>
        <li>The license doesn&apos;t expire. Every 1.x update is included.</li>
        <li>You get a license key with your receipt. Wisp asks for it once, on each Mac.</li>
        <li>Don&apos;t share, resell or publish your license key, and don&apos;t redistribute the app.</li>
        <li>Don&apos;t modify Wisp or work around its license check.</li>
      </ul>

      <h2>Refunds</h2>
      <p>
        You can get a full refund within {site.refundDays} days. See the <Link href="/refund">refund policy</Link>.
      </p>

      <h2>Requirements</h2>
      <p>
        Wisp needs macOS {site.minMacOS.replace(/\.0$/, "")} or later. Some features need permissions you grant in System
        Settings. Each one is optional and unlocks one feature.
      </p>

      <h2>Prayer times</h2>
      <p>
        Prayer times come from the Muslim Board of Uzbekistan&apos;s published schedule or are calculated for your location.
        They&apos;re provided for convenience. Please check them against your local mosque.
      </p>

      <h2>No warranty</h2>
      <p>
        Wisp is provided &quot;as is&quot;. We work to keep it reliable, but we can&apos;t promise it will be free of bugs or work
        with every app, browser or future version of macOS.
      </p>

      <h2>Liability</h2>
      <p>
        To the extent the law allows, our total liability for any claim about Wisp is limited to the amount you paid for it.
      </p>

      <h2>Changes</h2>
      <p>
        We may update these terms. The date at the top shows the latest version. If a change matters for your purchase,
        we&apos;ll email you.
      </p>
    </LegalPage>
  );
}
