// In-app updates for paying customers.
//
// POST /api/update  {"platform":"mac"|"windows","email":"<purchase email>"}
//   200 {"version":"1.0.8","notes":"…","url":"<short-lived download URL>","size":12345}
//   400 {"error":"bad_request"} · 403 {"error":"no_purchase"} · 429 {"error":"rate_limited"} · 500 {"error":"server"}
//
// Env: LEMONSQUEEZY_API_KEY, GITHUB_TOKEN (read access to the private repos), PRODUCT_MAC_ID, PRODUCT_WINDOWS_ID,
//      LEMONSQUEEZY_STORE_ID (optional: looked up from the API when the account has a single store).
import { hasPurchase, latestAsset } from "@/lib/delivery";
import { limited } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const json = (body: object, status: number) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(request: Request) {
  if (limited(request)) return json({ error: "rate_limited" }, 429);

  let platform: unknown, email: unknown;
  try {
    ({ platform, email } = await request.json());
  } catch {
    return json({ error: "bad_request" }, 400);
  }
  if ((platform !== "mac" && platform !== "windows") || typeof email !== "string" || email.length > 254 || !EMAIL.test(email.trim())) {
    return json({ error: "bad_request" }, 400);
  }

  try {
    if (!(await hasPurchase(email.trim(), platform))) return json({ error: "no_purchase" }, 403);
    const { version, notes, url, size } = await latestAsset(platform, "update");
    return json({ version, notes, url, size }, 200);
  } catch (e) {
    console.error(`[update] ${platform}: ${e instanceof Error ? e.message : e}`);
    return json({ error: "server" }, 500);
  }
}
