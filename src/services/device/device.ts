// Jenis perangkat, dideteksi dari User-Agent di src/proxy.ts dan diteruskan ke server
// lewat header DEVICE_HEADER. Dipakai untuk memilih tampilan (navbar, footer, halaman).

export const DEVICES = ["android", "ios", "desktop"] as const;
export type Device = (typeof DEVICES)[number];

export const DEVICE_HEADER = "x-device";

export const DEVICE_LABEL: Record<Device, string> = {
  android: "Android",
  ios: "iPhone / iPad",
  desktop: "Desktop",
};

export function isDevice(value: unknown): value is Device {
  return typeof value === "string" && (DEVICES as readonly string[]).includes(value);
}

// Catatan: iPad dengan iPadOS 13+ mengaku sebagai Mac di User-Agent, jadi terbaca "desktop".
export function detectDevice(ua: { os: { name?: string } }): Device {
  const os = ua.os.name?.toLowerCase() ?? "";
  if (os.includes("android")) return "android";
  if (os === "ios") return "ios";
  return "desktop";
}
