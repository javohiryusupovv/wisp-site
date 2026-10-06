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
- `regularPrice` / `launchPrice` / `discountCode` / `launchEndsAt` — launch: hammaga -50% `launchEndsAt` gacha (Lemon Squeezy'dagi `LAUNCH` kodi, o'sha vaqtda tugaydi). Keyin sayt o'zi oddiy narxni ko'rsatadi
  (to'lov tizimidagi narxni o'sha kuni o'zingiz o'zgartirasiz)
- `xHandle`, `email`

Hostingda `NEXT_PUBLIC_SITE_URL` ni o'rnating (masalan `https://wisp.app`). Undan canonical, Open Graph, sitemap va robots tuziladi.

## SEO

- `src/app/layout.tsx` — title, description, Open Graph, X kartasi, robots
- `src/app/page.tsx` — JSON-LD (`SoftwareApplication` + narx, `FAQPage`)
- `robots.ts`, `sitemap.ts`, `manifest.ts`, `opengraph-image.png`, `twitter-image.png`, ikonkalar — `src/app/` ichida

## Sotuv va yangilanishlar

- **Xarid:** Buy → Mac yoki Windows uchun alohida Lemon Squeezy checkout.
- **Yuklab olish:** chek emailidagi (va tasdiqlash oynasidagi) tugma
  `https://wisp-mac.vercel.app/download?order=[order_id]&key=[order_identifier]` ga olib boradi.
  Sayt Lemon Squeezy API orqali buyurtma to'langan va refund qilinmaganini, `key` buyurtmaning UUID'iga mosligini
  tekshiradi va yopiq repo'dagi oxirgi relizning qisqa muddatli GitHub havolasiga yo'naltiradi
  (Mac: `Wisp-mac.dmg`, Windows: `Wisp-Windows.zip`). Xaridorga GitHub akkaunti kerak emas.
  Muammo bo'lsa — `/download/help?reason=…` sahifasi.
- **Yangilanishlar:** ilovaga xarid emaili bir marta kiritiladi. Ilova `POST /api/update` ga
  `{"platform":"mac"|"windows","email":"…"}` yuboradi → `{"version","notes","url","size"}`.
  Xatolar: 400 `bad_request`, 403 `no_purchase`, 429 `rate_limited`, 500 `server`.

Lemon Squeezy'da har bir mahsulot: Confirmation modal va Email receipt → button link yuqoridagi `/download` havolasi.

Env (Vercel): `LEMONSQUEEZY_API_KEY`, `GITHUB_TOKEN` (wisp-widgets/wisp-mac va wisp-windows: Contents read-only),
`PRODUCT_MAC_ID`, `PRODUCT_WINDOWS_ID`, ixtiyoriy `LEMONSQUEEZY_STORE_ID`.

Narx: $9.99. Launch: `LAUNCH` kodi (-50%, 15-oktabr 23:59 Toshkentgacha) Buy havolasiga avtomatik qo'shiladi → $4.99.
