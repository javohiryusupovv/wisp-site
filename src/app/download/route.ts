// Download link from the Lemon Squeezy receipt / confirmation button:
//   https://<site>/download?order=[order_id]&key=[order_identifier]
// Checks that the order is paid and not refunded, then redirects to a short-lived GitHub URL for the latest
// installer of the product bought. The UUID key proves the link came from the receipt. No GitHub account needed.
import { ConfigError, getOrder, isActive, latestAsset, platformFor } from "@/lib/delivery";
import { limited } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ORDER_ID = /^\d{1,12}$/;
const ORDER_KEY = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const help = (request: Request, reason: string) =>
  new Response(null, { status: 303, headers: { Location: new URL(`/download/help?reason=${reason}`, request.url).toString(), "Cache-Control": "no-store" } });

export async function GET(request: Request) {
  if (limited(request, 30)) return help(request, "busy");

  const url = new URL(request.url);
  const order = url.searchParams.get("order") ?? "";
  const key = url.searchParams.get("key") ?? "";
  if (!ORDER_ID.test(order) || !ORDER_KEY.test(key)) return help(request, "link");

  try {
    const o = await getOrder(order);
    if (!o || o.attributes.identifier?.toLowerCase() !== key.toLowerCase()) return help(request, "link");
    if (o.attributes.refunded || o.attributes.status === "refunded") return help(request, "refunded");
    if (!isActive(o.attributes)) return help(request, "pending");
    const platform = platformFor(o.attributes.first_order_item?.product_id);
    if (!platform) return help(request, "link");

    const asset = await latestAsset(platform, "install");
    return new Response(null, { status: 302, headers: { Location: asset.url, "Cache-Control": "no-store" } });
  } catch (e) {
    console.error(`[download] order ${order}: ${e instanceof ConfigError ? e.message : e instanceof Error ? e.message : e}`);
    return help(request, "server");
  }
}
