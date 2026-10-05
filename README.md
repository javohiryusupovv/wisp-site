# wisp-site

Next.js (App Router) + TypeScript.

```bash
npm install
npm run dev     # http://localhost:3000
npm run build
```

## Launch'dan oldin

Hammasi `src/lib/site.ts` da:

- `checkoutUrl` — to'lov havolasi (Gumroad / Lemon Squeezy / Paddle)
- `launchPrice` / `regularPrice` / `launchEndsAt` — launch narxi qachongacha amal qilishi; muddat o'tgach sayt o'zi oddiy narxni ko'rsatadi
  (to'lov tizimidagi narxni o'sha kuni o'zingiz o'zgartirasiz)
- `xHandle`, `email`

Hostingda `NEXT_PUBLIC_SITE_URL` ni o'rnating (masalan `https://wisp.app`). Undan canonical, Open Graph, sitemap va robots tuziladi.

## SEO

- `src/app/layout.tsx` — title, description, Open Graph, X kartasi, robots
- `src/app/page.tsx` — JSON-LD (`SoftwareApplication` + narx, `FAQPage`)
- `robots.ts`, `sitemap.ts`, `manifest.ts`, `opengraph-image.png`, `twitter-image.png`, ikonkalar — `src/app/` ichida

## Sotuv: to'lov → yopiq GitHub repo

1. Xaridor Buy bosadi va GitHub username kiritadi. Sayt username borligini tekshiradi va
   `checkout[custom][github]=<username>` bilan Lemon Squeezy checkout'iga o'tkazadi.
2. To'lovdan keyin Lemon Squeezy `POST /api/lemonsqueezy` ga webhook yuboradi.
   Sayt xaridorni mahsulotiga mos GitHub team'ga qo'shadi (Mac yoki Windows). GitHub taklif emailini o'zi yuboradi.
3. Refund bo'lsa (`order_refunded`) — team'dan chiqariladi.

Sozlash:
- GitHub: org, ikkita private repo (Mac, Windows), har biriga **Read** huquqli team, org owner tokeni (`admin:org`).
- Lemon Squeezy → Settings → Webhooks: URL `https://<sayt>/api/lemonsqueezy`, eventlar `order_created`, `order_refunded`, signing secret.
- Hosting env: `.env.example` dagi hamma o'zgaruvchilar.
- `src/lib/site.ts`: `checkout.mac` / `checkout.windows` (Lemon Squeezy "Share" havolasi) va `github.macRepo` / `github.windowsRepo`.

Narx: launch paytida mahsulot narxi $5, `launchEndsAt` dan keyin Lemon Squeezy'da $10.90 ga o'zgartiriladi.

