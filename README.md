# RakitIQ

RakitIQ adalah SPA web Next.js untuk AI PC Builder Advisor user Indonesia. Fokus aplikasi ini bukan hanya budget, tetapi juga diagnosis kebutuhan, risiko listrik, suhu ruangan, UPS, PSU quality, upgrade path, dan trade-off komponen.

## Stack

- Next.js App Router
- TypeScript
- TailwindCSS
- Zustand
- OpenRouter API via Next.js API Routes

## Menjalankan Project

1. Install dependency:

```bash
npm install
```

2. Siapkan environment variable di `.env.local`:

```env
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_MODEL=openrouter/model-name
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=RakitIQ
```

3. Jalankan development server:

```bash
npm run dev
```

4. Buka `http://localhost:3000`

## API Routes

- `POST /api/ai/diagnosis`
- `POST /api/ai/recommend-builds`
- `POST /api/ai/analyze-change`

Semua request AI berjalan lewat server route agar `OPENROUTER_API_KEY` tidak bocor ke frontend.

## Catatan

- Jika `OPENROUTER_API_KEY` atau `OPENROUTER_MODEL` belum diset, aplikasi tetap berjalan memakai fallback local engine.
- Mock component database sudah mencakup CPU, GPU, motherboard, RAM, SSD, PSU, case, cooler, dan UPS.
- Admin mode saat ini menyimpan perubahan hanya di Zustand state browser.


