// In-app updates for paying customers.
//
// POST /api/update  {"platform":"mac"|"windows","email":"<purchase email>"}
//   200 {"version":"1.0.8","notes":"…","url":"<short-lived download URL>","size":12345}
//   400 {"error":"bad_request"} · 403 {"error":"no_purchase"} · 429 {"error":"rate_limited"} · 500 {"error":"server"}
//
// The email is checked against paid, not-refunded Lemon Squeezy orders for that platform's product, then the
// latest release asset is fetched from the private repo and handed back as a signed GitHub download URL.
//
// Env: LEMONSQUEEZY_API_KEY, GITHUB_TOKEN (read access to the private repos), PRODUCT_MAC_ID, PRODUCT_WINDOWS_ID,
//      LEMONSQUEEZY_STORE_ID (optional: looked up from the API when the account has a single store).

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Platform = "mac" | "windows";

const REPOS: Record<Platform, string> = { mac: "wisp-widgets/wisp-mac", windows: "wisp-widgets/wisp-windows" };
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const json = (body: object, status: number) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

class ConfigError extends Error {}
const env = (name: string) => {
  const v = process.env[name];
  if (!v) throw new ConfigError(`missing env ${name}`);
  return v;
};

// ───── rate limit: 20 requests per IP per 10 minutes, per server instance ─────

const hits = new Map<string, { count: number; reset: number }>();
function limited(ip: string) {
  const now = Date.now();
  if (hits.size > 5000) for (const [k, v] of hits) if (v.reset < now) hits.delete(k);
  const h = hits.get(ip);
  if (!h || h.reset < now) {
    hits.set(ip, { count: 1, reset: now + 10 * 60_000 });
    return false;
  }
  return ++h.count > 20;
}

// ───── Lemon Squeezy ─────

async function ls<T>(path: string): Promise<T> {
  const res = await fetch(`https://api.lemonsqueezy.com/v1${path}`, {
    headers: { Accept: "application/vnd.api+json", Authorization: `Bearer ${env("LEMONSQUEEZY_API_KEY")}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`lemonsqueezy ${res.status} ${path.split("?")[0]}`);
  return res.json();
}

let storeId: string | undefined = process.env.LEMONSQUEEZY_STORE_ID;
async function getStoreId() {
  if (storeId) return storeId;
  const { data } = await ls<{ data: { id: string }[] }>("/stores");
  if (data.length !== 1) throw new ConfigError("set LEMONSQUEEZY_STORE_ID (the account has several stores)");
  return (storeId = data[0].id);
}

type Order = { attributes: { user_email: string; status: string; refunded: boolean; first_order_item?: { product_id?: number } } };

async function hasPurchase(email: string, productId: string) {
  const store = await getStoreId();
  // The filter is an exact match, so try the address as typed and lowercased.
  const variants = [...new Set([email, email.toLowerCase()])];
  for (const v of variants) {
    const q = new URLSearchParams({ "filter[store_id]": store, "filter[user_email]": v, "page[size]": "100" });
    const { data } = await ls<{ data: Order[] }>(`/orders?${q}`);
    const ok = data.some(
      ({ attributes: a }) =>
        a.user_email?.trim().toLowerCase() === email.toLowerCase() &&
        a.status === "paid" &&
        !a.refunded &&
        String(a.first_order_item?.product_id) === productId,
    );
    if (ok) return true;
  }
  return false;
}

// ───── GitHub ─────

type Release = { tag_name: string; body: string | null; assets: { name: string; url: string; size: number }[] };

async function latestRelease(platform: Platform) {
  const headers = { Authorization: `Bearer ${env("GITHUB_TOKEN")}`, "X-GitHub-Api-Version": "2022-11-28" };
  const res = await fetch(`https://api.github.com/repos/${REPOS[platform]}/releases/latest`, {
    headers: { ...headers, Accept: "application/vnd.github+json" },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`github release ${res.status}`);
  const release: Release = await res.json();

  const asset =
    platform === "mac"
      ? release.assets.find((a) => a.name.toLowerCase().endsWith(".zip") && !a.name.toLowerCase().includes("windows"))
      : release.assets.find((a) => a.name === "Wisp-Windows.zip");
  if (!asset) throw new Error(`no ${platform} asset in ${release.tag_name}`);

  // The asset API answers with a redirect to a signed, short-lived URL. Hand that out instead of the token.
  const dl = await fetch(asset.url, { headers: { ...headers, Accept: "application/octet-stream" }, redirect: "manual", cache: "no-store" });
  const url = dl.headers.get("location");
  if (!url) throw new Error(`github asset ${dl.status}: no redirect`);

  return { version: release.tag_name.replace(/^v/, ""), notes: release.body ?? "", url, size: asset.size };
}

// ───── handler ─────

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (limited(ip)) return json({ error: "rate_limited" }, 429);

  let platform: unknown, email: unknown;
  try {
    ({ platform, email } = await request.json());
  } catch {
    return json({ error: "bad_request" }, 400);
  }
  if ((platform !== "mac" && platform !== "windows") || typeof email !== "string" || !EMAIL.test(email.trim()) || email.length > 254) {
    return json({ error: "bad_request" }, 400);
  }
  const address = email.trim();

  try {
    const productId = env(platform === "mac" ? "PRODUCT_MAC_ID" : "PRODUCT_WINDOWS_ID");
    if (!(await hasPurchase(address, productId))) return json({ error: "no_purchase" }, 403);
    return json(await latestRelease(platform), 200);
  } catch (e) {
    console.error(`[update] ${platform}: ${e instanceof Error ? e.message : e}`);
    return json({ error: "server" }, 500);
  }
}
