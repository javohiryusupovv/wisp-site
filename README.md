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
