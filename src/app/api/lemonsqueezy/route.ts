import { createHmac, timingSafeEqual } from "node:crypto";

// Lemon Squeezy webhook: after payment, invite the buyer to the private GitHub repo for what they bought.
// Lemon Squeezy → Settings → Webhooks: URL https://<site>/api/lemonsqueezy, events order_created + order_refunded,
// signing secret = LEMONSQUEEZY_WEBHOOK_SECRET.
//
// Env:
//   LEMONSQUEEZY_WEBHOOK_SECRET  signing secret from the webhook settings
//   GITHUB_TOKEN                 token of an org owner, scope admin:org (fine-grained: Members read/write)
//   GITHUB_ORG                   organisation that owns the private repos
//   PRODUCT_MAC_ID, TEAM_MAC          Lemon Squeezy product ID → team slug with Read access to the Mac repo
//   PRODUCT_WINDOWS_ID, TEAM_WINDOWS  same for Windows

export const runtime = "nodejs";

type Payload = {
  meta?: { event_name?: string; custom_data?: { github?: string } };
  data?: {
    id?: string;
    attributes?: { status?: string; first_order_item?: { product_id?: number }; user_email?: string };
  };
};

const GITHUB_USER = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;

function verify(raw: string, signature: string | null, secret: string) {
  if (!signature) return false;
  const expected = Buffer.from(createHmac("sha256", secret).update(raw).digest("hex"), "utf8");
  const given = Buffer.from(signature, "utf8");
  return expected.length === given.length && timingSafeEqual(expected, given);
}

function teamFor(productId: number | undefined) {
  if (productId === undefined) return null;
  if (String(productId) === process.env.PRODUCT_MAC_ID) return process.env.TEAM_MAC ?? null;
  if (String(productId) === process.env.PRODUCT_WINDOWS_ID) return process.env.TEAM_WINDOWS ?? null;
  return null;
}

async function membership(method: "PUT" | "DELETE", team: string, user: string) {
  const url = `https://api.github.com/orgs/${process.env.GITHUB_ORG}/teams/${team}/memberships/${encodeURIComponent(user)}`;
  return fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
    },
    body: method === "PUT" ? JSON.stringify({ role: "member" }) : undefined,
  });
}

export async function POST(request: Request) {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret || !process.env.GITHUB_TOKEN || !process.env.GITHUB_ORG) {
    console.error("[lemonsqueezy] webhook is not configured: missing env vars");
    return new Response("not configured", { status: 500 });
  }

  const raw = await request.text();
  if (!verify(raw, request.headers.get("x-signature"), secret)) {
    return new Response("invalid signature", { status: 401 });
  }

  let payload: Payload;
  try {
    payload = JSON.parse(raw);
  } catch {
    return new Response("bad json", { status: 400 });
  }

  const event = payload.meta?.event_name;
  const order = payload.data?.id;
  const attrs = payload.data?.attributes;
  const github = payload.meta?.custom_data?.github?.trim() ?? "";
  const team = teamFor(attrs?.first_order_item?.product_id);

  const granting = event === "order_created" && attrs?.status === "paid";
  const revoking = event === "order_refunded";
  if (!granting && !revoking) return new Response("ignored", { status: 200 });

  // Answer 200 for orders we can't act on, so Lemon Squeezy doesn't keep retrying; the log says why.
  if (!GITHUB_USER.test(github)) {
    console.error(`[lemonsqueezy] order ${order}: missing or invalid GitHub username "${github}"`);
    return new Response("no github username", { status: 200 });
  }
  if (!team) {
    console.error(`[lemonsqueezy] order ${order}: unknown product ${attrs?.first_order_item?.product_id}`);
    return new Response("unknown product", { status: 200 });
  }

  const res = await membership(granting ? "PUT" : "DELETE", team, github);
  if (!res.ok && !(revoking && res.status === 404)) {
    const detail = await res.text().catch(() => "");
    console.error(`[lemonsqueezy] order ${order}: GitHub ${res.status} for ${github} on team ${team}: ${detail.slice(0, 300)}`);
    // Bad token, rate limit or GitHub down: let Lemon Squeezy retry, so fixing the token later still delivers.
    // 404/422 (no such user, wrong team): retrying won't help.
    const retry = res.status >= 500 || [401, 403, 429].includes(res.status);
    return new Response("github error", { status: retry ? 502 : 200 });
  }

  console.log(`[lemonsqueezy] order ${order}: ${granting ? "invited" : "removed"} ${github} ${granting ? "to" : "from"} ${team}`);
  return new Response("ok", { status: 200 });
}
