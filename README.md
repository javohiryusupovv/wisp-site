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

## Sotuv va yangilanishlar

- **Xarid:** Buy → Lemon Squeezy checkout. To'lovdan keyin Lemon Squeezy mahsulotga yuklangan faylning
  yuklab olish havolasini emailga o'zi yuboradi (Wisp-mac.dmg / Wisp-Windows.zip).
- **Yangilanishlar:** ilovaga xarid emaili bir marta kiritiladi. Ilova `POST /api/update` ga
  `{"platform":"mac"|"windows","email":"…"}` yuboradi. Sayt Lemon Squeezy API orqali shu emailda o'sha
  platforma uchun to'langan, refund qilinmagan buyurtma borligini tekshiradi va yopiq repo'dagi oxirgi relizning
  qisqa muddatli yuklab olish havolasini qaytaradi: `{"version","notes","url","size"}`.
  Xatolar: 400 `bad_request`, 403 `no_purchase`, 429 `rate_limited`, 500 `server`.

Env (Vercel): `LEMONSQUEEZY_API_KEY`, `GITHUB_TOKEN` (wisp-widgets/wisp-mac va wisp-windows'ni o'qiy oladigan),
`PRODUCT_MAC_ID`, `PRODUCT_WINDOWS_ID`, ixtiyoriy `LEMONSQUEEZY_STORE_ID`.

Narx: launch paytida mahsulot narxi $5, `launchEndsAt` dan keyin Lemon Squeezy'da $10.90 ga o'zgartiriladi.
