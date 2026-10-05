import { createHmac, timingSafeEqual } from "node:crypto";

// Lemon Squeezy webhook: after payment GitHub emails the buyer an invitation to the private repo they paid for.
// Lemon Squeezy → Settings → Webhooks: URL https://<site>/api/lemonsqueezy, events order_created + order_refunded,
// signing secret = LEMONSQUEEZY_WEBHOOK_SECRET.
//
// Env:
//   LEMONSQUEEZY_WEBHOOK_SECRET  signing secret from the webhook settings
//   GITHUB_TOKEN                 classic token of an org owner with admin:org
//   GITHUB_ORG                   organisation that owns the private repos
//   PRODUCT_MAC_ID, TEAM_MAC          Lemon Squeezy product ID → team slug with Read access to the Mac repo
//   PRODUCT_WINDOWS_ID, TEAM_WINDOWS  same for Windows
//
// Invitations go to the email the buyer paid with and expire after 7 days. To resend one: GitHub → the org →
// People → Invitations (or "Invite member"), invite the same email to the same team.

export const runtime = "nodejs";

type Payload = {
  meta?: { event_name?: string };
  data?: { id?: string; attributes?: { status?: string; user_email?: string; first_order_item?: { product_id?: number } } };
};

type Invitation = { id: number; email: string | null; login: string | null };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function verify(raw: string, signature: string | null, secret: string) {
  if (!signature) return false;
  const expected = Buffer.from(createHmac("sha256", secret).update(raw).digest("hex"), "utf8");
  const given = Buffer.from(signature, "utf8");
  return expected.length === given.length && timingSafeEqual(expected, given);
}

function teamSlugFor(productId: number | undefined) {
  if (productId === undefined) return null;
  if (String(productId) === process.env.PRODUCT_MAC_ID) return process.env.TEAM_MAC ?? null;
  if (String(productId) === process.env.PRODUCT_WINDOWS_ID) return process.env.TEAM_WINDOWS ?? null;
  return null;
}

class GitHubError extends Error {
  constructor(public status: number, detail: string) {
    super(`GitHub ${status}: ${detail.slice(0, 300)}`);
  }
}

async function gh<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`https://api.github.com/orgs/${process.env.GITHUB_ORG}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
    },
    cache: "no-store",
  });
  if (!res.ok) throw new GitHubError(res.status, await res.text().catch(() => ""));
  return (res.status === 204 ? null : await res.json()) as T;
}

const teamId = async (slug: string) => (await gh<{ id: number }>(`/teams/${slug}`)).id;

/** Pending invitations for this email (case-insensitive), across all pages. */
async function pendingFor(email: string) {
  const found: Invitation[] = [];
  for (let page = 1; page <= 10; page++) {
    const list = await gh<Invitation[]>(`/invitations?per_page=100&page=${page}`);
    found.push(...list.filter((i) => i.email?.toLowerCase() === email.toLowerCase()));
    if (list.length < 100) break;
  }
  return found;
}

const invitationTeams = async (id: number) => (await gh<{ id: number; slug: string }[]>(`/invitations/${id}/teams`)).map((t) => t.id);

const invite = (email: string, teamIds: number[]) =>
  gh("/invitations", { method: "POST", body: JSON.stringify({ email, role: "direct_member", team_ids: teamIds }) });

/** Payment: invite the email to the team. A pending invite (e.g. they bought the other app too) is reissued with both teams. */
async function grant(order: string, email: string, slug: string) {
  const id = await teamId(slug);
  const pending = await pendingFor(email);
  const teams = new Set([id]);
  for (const inv of pending) {
    for (const t of await invitationTeams(inv.id)) teams.add(t);
    await gh(`/invitations/${inv.id}`, { method: "DELETE" });
  }
  try {
    await invite(email, [...teams]);
    console.log(`[lemonsqueezy] order ${order}: invited ${email} to ${slug}${pending.length ? " (reissued pending invite)" : ""}`);
  } catch (e) {
    // 422 = the email already belongs to an org member: GitHub can't add a team by email, so a person has to
    if (e instanceof GitHubError && e.status === 422) {
      console.error(`[lemonsqueezy] order ${order}: ${email} is already in the org. Add them to team ${slug} by hand. ${e.message}`);
      return;
    }
    throw e;
  }
}

/** Refund: take the team out of a pending invite. Accepted invites can't be matched by email, so they're logged. */
async function revoke(order: string, email: string, slug: string) {
  const id = await teamId(slug);
  const pending = await pendingFor(email);
  if (pending.length === 0) {
    console.error(`[lemonsqueezy] order ${order}: refund for ${email}, no pending invite. If they accepted, remove them from team ${slug} by hand.`);
    return;
  }
  for (const inv of pending) {
    const rest = (await invitationTeams(inv.id)).filter((t) => t !== id);
    await gh(`/invitations/${inv.id}`, { method: "DELETE" });
    if (rest.length) await invite(email, rest);
  }
  console.log(`[lemonsqueezy] order ${order}: refund, cancelled the ${slug} invite for ${email}`);
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
  const email = attrs?.user_email?.trim() ?? "";
  const slug = teamSlugFor(attrs?.first_order_item?.product_id);

  const granting = event === "order_created" && attrs?.status === "paid";
  const revoking = event === "order_refunded";
  if (!granting && !revoking) return new Response("ignored", { status: 200 });

  // 200 for orders we can't act on, so Lemon Squeezy doesn't keep retrying; the log says why.
  if (!EMAIL.test(email)) {
    console.error(`[lemonsqueezy] order ${order}: no usable email "${email}"`);
    return new Response("no email", { status: 200 });
  }
  if (!slug) {
    console.error(`[lemonsqueezy] order ${order}: unknown product ${attrs?.first_order_item?.product_id}`);
    return new Response("unknown product", { status: 200 });
  }

  try {
    await (granting ? grant(order ?? "?", email, slug) : revoke(order ?? "?", email, slug));
    return new Response("ok", { status: 200 });
  } catch (e) {
    console.error(`[lemonsqueezy] order ${order}: ${e instanceof Error ? e.message : e}`);
    // Bad token, rate limit or GitHub down: let Lemon Squeezy retry. Other 4xx: retrying won't help.
    const status = e instanceof GitHubError ? e.status : 500;
    const retry = status >= 500 || [401, 403, 429].includes(status);
    return new Response("github error", { status: retry ? 502 : 200 });
  }
}
