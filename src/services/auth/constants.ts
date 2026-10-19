// Konstanta auth yang aman dipakai di client, server, maupun proxy.

export const SESSION_COOKIE = "session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 5; // 5 hari (maksimal Firebase: 14 hari)

export const REGISTRATION_TTL_MS = 1000 * 60 * 60 * 48; // link persetujuan berlaku 48 jam

export const COLLECTIONS = {
  users: "users",
  usernames: "usernames",
  registrationRequests: "registrationRequests",
  tempatKonservasi: "tempatKonservasi",
  penyu: "penyu",
  laporan: "laporan",
  // Subkoleksi: tempatKonservasi/{tempatId}/jabatan/{jabatanId}, dst.
  // Koleksi pendataan ada di src/services/pendataan/rantai.ts (CATATAN_INFO)
  jabatan: "jabatan",
  zona: "zona",
  inkubator: "inkubator",
} as const;

// Owner ke panel owner, selain itu ke dashboard tempatnya: /{tempatId}/dashboard
export function homePath(user: { role: string | null; tempatId: string | null }) {
  if (user.role === "owner") return "/admin";
  if (user.tempatId) return `/${user.tempatId}/dashboard`;
  return "/login";
}

// Hanya izinkan redirect ke path internal, cegah "?next=//situs-lain.com".
export function safeRedirectPath(next: string | null | undefined) {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return null;
  return next;
}
