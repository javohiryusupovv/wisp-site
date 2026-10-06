// How many launch-price spots are left: GET /api/launch → {"active":true,"total":20,"remaining":14,"endsAt":"…"}
// Reads the Lemon Squeezy discount (site.discountCode) and counts its redemptions. Cached for a minute.
import { site } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Discount = {
  id: string;
  attributes: { code: string; status: string; is_limited_redemptions: boolean; max_redemptions: number; expires_at: string | null };
};

const ls = async <T,>(path: string): Promise<T> => {
  const res = await fetch(`https://api.lemonsqueezy.com/v1${path}`, {
    headers: { Accept: "application/vnd.api+json", Authorization: `Bearer ${process.env.LEMONSQUEEZY_API_KEY}` },
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`lemonsqueezy ${res.status}`);
  return res.json();
};

const reply = (body: object) =>
  Response.json(body, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } });

export async function GET() {
  try {
    const { data } = await ls<{ data: Discount[] }>(`/discounts?page[size]=100`);
    const discount = data.find((d) => d.attributes.code.toUpperCase() === site.discountCode);
    if (!discount || discount.attributes.status !== "published") {
      return reply({ active: false, total: site.launchSpots, remaining: 0, endsAt: site.launchEndsAt });
    }
    const endsAt = discount.attributes.expires_at ?? site.launchEndsAt;
    const expired = Date.now() >= new Date(endsAt).getTime();

    const total = discount.attributes.is_limited_redemptions ? discount.attributes.max_redemptions : site.launchSpots;
    const used = await ls<{ meta: { page: { total: number } } }>(`/discount-redemptions?filter[discount_id]=${discount.id}&page[size]=1`);
    const remaining = Math.max(0, total - used.meta.page.total);
    return reply({ active: remaining > 0 && !expired, total, remaining, endsAt });
  } catch (e) {
    // Unknown: keep showing the offer (Lemon Squeezy still enforces the limit at checkout)
    console.error(`[launch] ${e instanceof Error ? e.message : e}`);
    return reply({ active: Date.now() < new Date(site.launchEndsAt).getTime(), total: site.launchSpots, remaining: null, endsAt: site.launchEndsAt });
  }
}
