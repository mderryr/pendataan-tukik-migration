# Struktur Proyek — Si Penyu (Pendataan Tukik Indonesia)

Sistem informasi untuk **pendataan, pengawasan, dan pelaporan** konservasi penyu di Indonesia.
Uji coba pertama dilakukan di Pokmaswas Pantai Taman Kili Kili, Trenggalek, dengan dukungan
Pertamina Patra Niaga dan Universitas Brawijaya.

- **Framework:** Next.js (App Router), React 18, TypeScript
- **UI:** Tailwind CSS + shadcn/ui (Radix UI), sebagian MUI / Mantine / Flowbite
- **Data fetching:** TanStack Query, tabel dengan TanStack Table
- **Database:** Prisma + CockroachDB (awal) → sedang dimigrasikan ke Appwrite / Firebase
- **Laporan:** `@react-pdf/renderer` + Chart.js (grafik dirender ke gambar lalu dimasukkan ke PDF)
- **Package manager:** pnpm

---

## Pohon folder (ringkas)

```
pendataan-tukik-new/
├── .storybook/              Konfigurasi Storybook
├── .vscode/                 Pengaturan editor
├── appwrite/                Docker Compose untuk menjalankan Appwrite self-hosted
├── database/                Seeder Firestore + middleware lama (nonaktif)
├── dbml/                    Diagram skema database (hasil generate Prisma)
├── prisma/                  Skema, migrasi, dan seeder Prisma
├── public/                  Aset statis (manifest PWA, robots)
├── src/
│   ├── app/                 Routing Next.js (halaman)
│   ├── asset/               Gambar & animasi (logo sponsor, ilustrasi)
│   ├── components/          Komponen React
│   │   ├── Chart/           Grafik Chart.js
│   │   ├── another/         Komponen umum buatan sendiri (navbar, tabel, dialog, dll.)
│   │   ├── coloms/          Definisi kolom tabel per jenis data
│   │   ├── examples/        Contoh komponen (Zona Location Picker)
│   │   ├── landing-page/    Bagian-bagian landing page
│   │   ├── loading/         Skeleton loading
│   │   ├── template/        Template laporan PDF bulanan & tahunan
│   │   └── ui/              Komponen shadcn/ui
│   ├── env/                 Konfigurasi, koneksi backend, konstanta
│   ├── hooks/               Custom hooks (CRUD, dialog, query, mobile view)
│   ├── logic/               Logika bisnis lama (sebagian besar dikomentari)
│   ├── stories/             Contoh bawaan Storybook
│   ├── styles/              CSS & style object tambahan
│   ├── utils/               Fungsi utilitas
│   └── view/                Halaman statis (under construction, coming soon)
└── (file konfigurasi di root)
```

---

## File di root

| File | Fungsi |
|---|---|
| `package.json` | Dependensi dan script (`dev`, `build`, `seed`, `migrate:dev`, `studio:dev`, `storybook`, `seed:firebase`) |
| `pnpm-lock.yaml`, `pnpm-workspace.yaml` | Lockfile pnpm dan daftar paket yang boleh menjalankan build script |
| `next.config.mjs` | Konfigurasi Next.js: Million.js compiler, React Compiler (mode anotasi), domain gambar eksternal, fallback `fs/net/tls` di sisi klien. PWA (`next-pwa`) dikomentari |
| `tsconfig.json` | Konfigurasi TypeScript, alias `@/*` → `src/*` |
| `tailwind.config.ts`, `postcss.config.js` | Konfigurasi Tailwind CSS |
| `components.json` | Konfigurasi shadcn/ui (style `new-york`, alias ke `@/components/ui`, `@/utils/cn-tools`, `@/hooks`) |
| `docker-compose.yml` | Lingkungan database lokal: PostgreSQL + pgAdmin, dan cluster CockroachDB 3 node |
| `secret.tsx` | Catatan perintah `docker run` untuk CockroachDB testing (isinya komentar semua) |
| `README.md` | README bawaan `create-next-app` (belum disesuaikan) |
| `APPWRITE_MIGRATION.md` | Catatan migrasi Prisma → Appwrite (service, collection ID, struktur storage) |
| `ZONA_FUNCTIONS_SUMMARY.md` | Ringkasan fungsi zona dengan koordinat hex Google |
| `.gitignore` | Mengabaikan `node_modules`, `.next`, semua file `.env*`, dll. |

---

## `prisma/` dan `dbml/` — Model data

| Path | Fungsi |
|---|---|
| `prisma/schema.prisma` | Skema utama (CockroachDB, 2 schema: `DataKonservasi` dan `Report`). Juga menghasilkan `dbml/awesome.dbml` |
| `prisma/schema/allData.prisma`, `report.prisma` | Pecahan skema (saat ini tanpa model aktif) |
| `prisma/migrations/` | 16 migrasi dari `0_init` sampai `20241202180920_penambahan_logs` (Jul–Des 2024) |
| `prisma/seed.ts` | Seeder tempat konservasi & jenis penyu (dikomentari) |
| `prisma/testing.ts` | Skrip uji query login (dikomentari) |
| `dbml/awesome.dbml` | Diagram ERD hasil generate — bisa dibuka di dbdiagram.io |

**Alur data konservasi** (schema `DataKonservasi`):

```
PenyuNaik ──► TelurDikerami ──► TelurMenetas ──► InkubasiPenyu ──► Inkubator
 (Zona)                            (JenisPenyu)                        │
                                                                       ├──► Pelepasan (tukik dilepas)
                                                                       └──► PenyuMati (tukik mati)
```

Model pendukung: `User` (petugas, relasi ke `TempatKonservasi`), `TempatKonservasi`, `JenisPenyu`, `Zona`, `Inkubator`.

Schema `Report`: `PenyimpananBulanan` dan `PenyimpananTahunan` — rekap angka per bulan/tahun
(penyu naik bertelur/tidak, telur diselamatkan/menetas, tukik mati/dilepas) plus `Logs` JSON.

---

## `database/`

| File | Fungsi |
|---|---|
| `seed.ts` | Seeder Firestore: mengisi koleksi `penyu` dengan 7 jenis penyu. Dijalankan lewat `pnpm seed:firebase` |
| `middleware.ts` | Middleware Next.js lama (deteksi device, session JWT, rate limit, proteksi `/admin`). Dikomentari dan diletakkan di luar `src/`, jadi **tidak aktif** |

## `appwrite/`

`docker-compose.yml` untuk menjalankan Appwrite secara self-hosted, beserta satu file backup.

---

## `src/app/` — Halaman (routing)

| Route | File | Status |
|---|---|---|
| `/` | `page.tsx` → `landing-page.view.tsx` | Aktif — Hero, Features, Sponsors |
| `/pendataan` | `pendataan/page.tsx` | Menampilkan *Under Construction*. Dashboard aslinya ada di `pendataan-all.view.tsx` (dikomentari) |
| `/laporan` | `laporan/page.tsx` | Aktif — daftar laporan (data dummy, link Google Drive) |
| `/laporan/[id]` | `laporan/[id]/page.tsx` | Penampil PDF (`react-pdf`) dengan zoom/navigasi; data masih dummy |
| `/login` | `login/page.tsx` | Menampilkan *Under Construction*. Form login ada di `login-page-new.tsx` (dikomentari) |
| `/tentang-kami` | `tentang-kami/page.tsx` | Aktif — profil dan ucapan terima kasih |
| `/construction` | `construction/page.tsx` | Halaman "sedang dibangun" |
| `/error` | `error/page.tsx` | Halaman error |

File pendukung:
- `layout.tsx` — root layout: font, metadata, `ThemeProvider`, `Toaster`, Vercel Analytics & Speed Insights
- `providers-tanstack.tsx` — `QueryClientProvider` + React Query Devtools
- `globals.css` — variabel tema Tailwind/shadcn
- `loading.tsx`, `global-error.tsx`, `*/loading.tsx`, `login/error.tsx` — state loading & error
- `favicon.ico`, `logo-sipenyu.png` — ikon aplikasi

> Banyak komponen (sidebar, navbar admin, `utils/select-name.ts`, `env/description.mjs`) merujuk ke
> route `/admin/list-penyu-naik`, `/admin/list-inkubator`, dst. **Folder `/admin` tidak ada di repo ini.**

---

## `src/components/`

### `ui/` — shadcn/ui
Komponen dasar hasil generate shadcn: `button`, `card`, `dialog`, `drawer`, `form`, `input`, `select`,
`table`, `tabs`, `toast`/`toaster`/`use-toast`, `sonner`, `calendar`, `datepicker-form`, dan lainnya.
Sebaiknya tidak diubah manual kecuali perlu.

### `another/` — Komponen umum buatan sendiri
| Kelompok | File |
|---|---|
| Navigasi | `navbar-all`, `navbar-admin` (bottom navigation MUI), `navbar-mobile`, `navbar-list-back`, `navigation-bottom`, `sidebar` (dashboard admin), `footer`, `scrollToTop` |
| Tabel | `DataTable/DataTable.tsx`, `DataTableColumnHeader.tsx`, dan varian aksi baris: `DataTableRowActions` (umum), `.inkubator`, `.report`, `.track` |
| Kartu | `DataCard/Card`, `UserCard`, `menu`, `menu-inkubator` — tampilan kartu untuk mobile |
| Form & input | `date-picker`, `date-picker-form`, `datepicker`, `select-custom-yearMonth`, `add-bottom` |
| Dialog | `custom-popup`, `popup-drawer` |
| Tampilan & state | `empty-view`, `error-tryAgain`, `skeleton-loading`, `skeleton-table`, `ratelimit-toast`, `lazy-lottie`, `sparkle`, `devider`, `grafik`, `tabs-custom`, `tabs-in-dashboard`, `table-custom-values` |

### `coloms/` — Definisi kolom TanStack Table
Satu file per jenis data: `naik-bertelur`, `naik-tidak-bertelur`, `dikerami`, `menetas`, `dirawat`,
`dilepas`, `mati`, `inkubator`, `zona`, `pengguna`, `report-month`, `report-year`.

### `template/` — Laporan PDF
| File | Fungsi |
|---|---|
| `template.generate.tsx` | Dokumen PDF utama (`@react-pdf/renderer`) |
| `halamanPertama-month.report.tsx`, `halamanKedua-month.report.tsx` | Halaman laporan bulanan |
| `halamanPertama-years.report.tsx`, `halamanKedua-…`, `halamanKetiga-…` | Halaman laporan tahunan |
| `chart.generate.tsx`, `table.generate.tsx` | Grafik dan tabel di dalam PDF |

### `Chart/`
`bar`, `line`, `doughnat` (grafik Chart.js) dan `converter.tsx` (mengubah grafik jadi gambar
dengan `chartjs-to-image` untuk dimasukkan ke PDF). `index.ts` sebagai barrel export.

### Lainnya
- `landing-page/` — `hero`, `features`, `sponsors`
- `loading/table.skeleton.tsx` — skeleton tabel
- `examples/ZonaLocationPicker.example.tsx` — contoh pemilih lokasi zona (dikomentari)
- `theme-provider.tsx` — wrapper `next-themes`

---

## `src/env/` — Konfigurasi & koneksi

| File | Fungsi |
|---|---|
| `schema.mjs`, `server.mjs`, `client.mjs` | Validasi environment variable dengan Zod (pola T3) |
| `appwrite.connect.js` | Client Appwrite (Account, Databases, Storage) — masih berisi placeholder |
| `firebase.connect.ts` | Inisialisasi Firebase client dari env |
| `firebase-admin.connect.ts` | Inisialisasi Firebase Admin (dipakai `database/seed.ts`) |
| `prisma.mjs` | Singleton PrismaClient (dikomentari) |
| `codeID.ts` | Generator ID dokumen berprefix, mis. `PN` (Penyu Naik), `TD` (Telur Dikerami), `TM` (Telur Menetas) |
| `description.mjs` | Teks judul/deskripsi/link untuk setiap jenis data |
| `time.mjs` | Konstanta waktu cache, refetch, dan timeout |
| `size.mjs` | Breakpoint mobile (838px) |

## `src/hooks/`

Custom hooks untuk mengurangi boilerplate CRUD. Dokumentasi lengkap ada di `src/hooks/README.md`.

| Hook | Fungsi |
|---|---|
| `useCrudOperations` | Gabungan query + tabel + dialog + mutasi (disarankan) |
| `useDataQuery` | Wrapper React Query dengan helper `isEmpty` / `hasData` |
| `useTableData` | Kolom tabel + state dialog |
| `useFormState` | Mutasi create/update/delete + toast |
| `useDialogState` | State dialog dengan mode create/edit/view/delete |
| `useMobileView`, `useMobileViewMultiDialog`, `useMobileViewWithFilter` | Logika tampilan mobile |
| `index.ts` | Barrel export |

## `src/logic/`

| File | Status |
|---|---|
| `login-seter-geter.ts` | Aktif — class `Credentials` (getter/setter username & password) |
| `tukik-pendataan.ts` | Pemanggilan API backend lama via axios (sebagian besar dikomentari) |
| `konservasi.ts` | CRUD tempat konservasi via Prisma (dikomentari) |
| `firebase-logic.ts` | Konfigurasi Firebase lama (dikomentari) |

## `src/utils/`

| File | Fungsi |
|---|---|
| `cn-tools.ts` | `cn()` — gabungan `clsx` + `tailwind-merge` (dipakai shadcn) |
| `classname.ts` | `classNames()` versi sederhana |
| `env-reading.utils.ts` | `requireEnvVar()` / `requireInProduction()` |
| `mediaquery-hook.tsx` | Hook `useMediaQuery` |
| `nama-bulan.utils.ts` | Nama bulan dalam Bahasa Indonesia (panjang & pendek) |
| `select-name.ts` | Menentukan judul halaman dari pathname `/admin/...` |
| `status-card.urils.ts` | Warna badge per status (Bertelur, Menetas, Mati, Dilepas, dll.) |
| `status-toast.utils.ts` | Hook `useStatusUtils` — update cache React Query + toast setelah create/update/delete |

## `src/styles/`

`grafik.css`, `lapoeanKEE.css` (gaya laporan KEE), dan style object untuk tabs, kartu user, dan navbar.

## `src/view/asset/`

`under-construction.tsx` dan `coming-soon.view.tsx` — halaman placeholder yang dipakai `/pendataan` dan `/login`.

## `src/asset/`

- `image/` — logo sponsor (Pertamina, Universitas Brawijaya, Pokmaswas, Kab. Trenggalek), foto tim, ilustrasi properti
- `animation/` — animasi *under construction* (GIF & Lottie JSON)

## `src/stories/` dan `.storybook/`

Contoh bawaan Storybook (`Button`, `Header`, `Page`). Belum ada story untuk komponen proyek.

---

## Catatan kondisi saat ini

1. **Folder yang hilang.** Kode dan dokumentasi merujuk ke `src/services/`, `src/types/`, `Pending/`,
   `src/app/admin/`, dan `src/app/api/`, tapi folder-folder ini tidak ada di repo. Semua import ke folder
   tersebut sudah dikomentari, sehingga fitur pendataan, login, dan dashboard admin saat ini dinonaktifkan
   (diganti halaman *Under Construction*).
2. **Tiga backend sekaligus.** Ada jejak Prisma/CockroachDB (skema & migrasi lengkap), Firebase
   (seeder Firestore, koneksi client/admin), dan Appwrite (koneksi & dokumen migrasi). Perlu dipilih
   satu sebagai target sebelum fitur diaktifkan kembali.
3. **Kode yang sebagian besar dikomentari:** `login-page-new.tsx`, `pendataan-all.view.tsx`,
   `ZonaLocationPicker.example.tsx`, `env/prisma.mjs`, `logic/konservasi.ts`, `logic/firebase-logic.ts`,
   `database/middleware.ts`.
4. **Data yang ditulis langsung di kode (perlu dipindah ke `.env` atau dihapus):** password database dan
   email di `docker-compose.yml`, konfigurasi Firebase di `logic/firebase-logic.ts`, dan token JWT di
   `logic/tukik-pendataan.ts` (walaupun dalam bentuk komentar).
5. **Dependensi yang tumpang tindih.** Ada beberapa library UI (Tailwind/shadcn, MUI, Mantine, Flowbite,
   Bootstrap, Material Tailwind), grafik (Chart.js, ECharts), dan PDF (`@react-pdf`, `jspdf`,
   `html2pdf`, `pdf-lib`). Bisa dirapikan kalau proyek ini dilanjutkan.
