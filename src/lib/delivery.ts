// Server-side helpers shared by /download (link in the receipt email) and /api/update (in-app updates).
// Paid orders are checked with the Lemon Squeezy API; files come from the latest release of the private repo,
// handed out as GitHub's short-lived signed URL, so buyers never need a GitHub account.

export type Platform = "mac" | "windows";

const REPOS: Record<Platform, string> = { mac: "wisp-widgets/wisp-mac", windows: "wisp-widgets/wisp-windows" };

export class ConfigError extends Error {}
export const env = (name: string) => {
  const v = process.env[name];
  if (!v) throw new ConfigError(`missing env ${name}`);
  return v;
};

export function platformFor(productId: number | string | undefined): Platform | null {
  if (productId === undefined) return null;
  if (String(productId) === process.env.PRODUCT_MAC_ID) return "mac";
  if (String(productId) === process.env.PRODUCT_WINDOWS_ID) return "windows";
  return null;
}

// ───── Lemon Squeezy ─────

async function ls<T>(path: string): Promise<T | null> {
  const res = await fetch(`https://api.lemonsqueezy.com/v1${path}`, {
    headers: { Accept: "application/vnd.api+json", Authorization: `Bearer ${env("LEMONSQUEEZY_API_KEY")}` },
    cache: "no-store",
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`lemonsqueezy ${res.status} ${path.split("?")[0]}`);
  return res.json();
}

export type OrderAttrs = {
  identifier: string;
  user_email: string;
  status: string;
  refunded: boolean;
  first_order_item?: { product_id?: number };
};

export const isActive = (a: OrderAttrs) => a.status === "paid" && !a.refunded;

export async function getOrder(id: string) {
  const r = await ls<{ data: { id: string; attributes: OrderAttrs } }>(`/orders/${id}`);
  return r?.data ?? null;
}

let storeId: string | undefined = process.env.LEMONSQUEEZY_STORE_ID;
async function getStoreId() {
  if (storeId) return storeId;
  const r = await ls<{ data: { id: string }[] }>("/stores");
  if (!r || r.data.length !== 1) throw new ConfigError("set LEMONSQUEEZY_STORE_ID (the account has several stores)");
  return (storeId = r.data[0].id);
}

/** Does this email have a paid, not-refunded order for the platform's product? */
export async function hasPurchase(email: string, platform: Platform) {
  const productId = env(platform === "mac" ? "PRODUCT_MAC_ID" : "PRODUCT_WINDOWS_ID");
  const store = await getStoreId();
  // The filter is an exact match, so try the address as typed and lowercased.
  for (const v of new Set([email, email.toLowerCase()])) {
    const q = new URLSearchParams({ "filter[store_id]": store, "filter[user_email]": v, "page[size]": "100" });
    const r = await ls<{ data: { attributes: OrderAttrs }[] }>(`/orders?${q}`);
    const ok = (r?.data ?? []).some(
      ({ attributes: a }) =>
        a.user_email?.trim().toLowerCase() === email.toLowerCase() && isActive(a) && String(a.first_order_item?.product_id) === productId,
    );
    if (ok) return true;
  }
  return false;
}

// ───── GitHub ─────

type Release = { tag_name: string; body: string | null; assets: { name: string; url: string; size: number }[] };

/**
 * Latest release of the platform's private repo, with a signed download URL valid for a few minutes.
 * kind "install" is what a new buyer downloads (Mac: .dmg), "update" is what the app installs (Mac: .zip).
 */
export async function latestAsset(platform: Platform, kind: "install" | "update") {
  const headers = { Authorization: `Bearer ${env("GITHUB_TOKEN")}`, "X-GitHub-Api-Version": "2022-11-28" };
  const res = await fetch(`https://api.github.com/repos/${REPOS[platform]}/releases/latest`, {
    headers: { ...headers, Accept: "application/vnd.github+json" },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`github release ${res.status}`);
  const release: Release = await res.json();

  const name = (a: { name: string }) => a.name.toLowerCase();
  const asset =
    platform === "windows"
      ? release.assets.find((a) => a.name === "Wisp-Windows.zip")
      : kind === "install"
        ? release.assets.find((a) => a.name === "Wisp-mac.dmg") ?? release.assets.find((a) => name(a).endsWith(".dmg"))
        : release.assets.find((a) => name(a).endsWith(".zip") && !name(a).includes("windows"));
  if (!asset) throw new Error(`no ${platform} ${kind} asset in ${release.tag_name}`);

  // The asset API answers with a redirect to a signed, short-lived URL. Hand that out, never the token.
  const dl = await fetch(asset.url, { headers: { ...headers, Accept: "application/octet-stream" }, redirect: "manual", cache: "no-store" });
  const url = dl.headers.get("location");
  if (!url) throw new Error(`github asset ${dl.status}: no redirect`);

  return { version: release.tag_name.replace(/^v/, ""), notes: release.body ?? "", url, size: asset.size, name: asset.name };
}
