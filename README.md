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

1. Xaridor Buy bosadi va to'g'ridan-to'g'ri Lemon Squeezy checkout'iga o'tadi.
2. To'lovdan keyin Lemon Squeezy `POST /api/lemonsqueezy` ga webhook yuboradi. Sayt GitHub'dan xaridor to'lagan
   emailga org taklifini yuborishni so'raydi (mahsulotiga mos team bilan: Mac yoki Windows). GitHub emailni o'zi yuboradi.
3. Xaridor taklifni qabul qiladi (GitHub'ga kiradi yoki akkaunt ochadi) va repo'dan yuklab oladi.
4. Refund (`order_refunded`): kutilayotgan taklif bekor qilinadi. Taklif allaqachon qabul qilingan bo'lsa — logda
   yoziladi, team'dan qo'lda chiqarish kerak (GitHub email bo'yicha a'zoni topib bermaydi).

Cheklovlar:
- Taklif 7 kunda eskiradi. Qayta yuborish: GitHub → wisp-widgets → People → Invitations / Invite member (o'sha email, o'sha team).
- Email allaqachon org a'zosiga tegishli bo'lsa (masalan, ikkinchi mahsulotni keyinroq sotib olgan), GitHub email bo'yicha
  team qo'sha olmaydi — logda yoziladi, qo'lda qo'shiladi.

Sozlash:
- GitHub: org `wisp-widgets`, private repo'lar, **Read** huquqli team'lar, org owner classic tokeni (`admin:org`).
- Lemon Squeezy → Settings → Webhooks: URL `https://<sayt>/api/lemonsqueezy`, eventlar `order_created`, `order_refunded`, signing secret.
- Hosting env: `.env.example` dagi o'zgaruvchilar.
- `src/lib/site.ts`: `checkout.mac` / `checkout.windows`.

Narx: launch paytida mahsulot narxi $5, `launchEndsAt` dan keyin Lemon Squeezy'da $10.90 ga o'zgartiriladi.
