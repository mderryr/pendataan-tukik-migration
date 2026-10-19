// Role & izin. Harus selaras dengan firestore.rules.
//
// owner        : kamu, semua tempat
// admin_tempat : pengelola tempat (pendaftar tempat), semua izin di tempatnya
// custom       : anggota yang ditambahkan admin tempat; izinnya mengikuti jabatan
//                (mis. "Wakil Pengelola") yang dibuat admin tempat

export const ROLES = ["owner", "admin_tempat", "custom"] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_LABEL: Record<Role, string> = {
  owner: "Pemilik Sistem",
  admin_tempat: "Pengelola Tempat",
  custom: "Anggota",
};

// Menu yang izinnya diatur lewat jabatan. Manajemen Konservasi tidak termasuk:
// khusus pengelola tempat & owner (isTempatAdmin).
export const RESOURCES = ["pendataan", "arsip", "laporan"] as const;
export type Resource = (typeof RESOURCES)[number];

export const RESOURCE_LABEL: Record<Resource, string> = {
  pendataan: "Pendataan",
  arsip: "Arsip Data",
  laporan: "Laporan",
};

export const ACTIONS = ["read", "create", "update", "delete"] as const;
export type Action = (typeof ACTIONS)[number];

// Aksi yang berlaku untuk tiap menu
export const RESOURCE_ACTIONS = {
  pendataan: ["read", "create", "update", "delete"],
  arsip: ["read", "update", "delete"],
  laporan: ["read", "create"],
} as const satisfies Record<Resource, readonly Action[]>;

export const ACTION_LABEL: Record<Action, string> = {
  read: "Lihat",
  create: "Tambah",
  update: "Ubah",
  delete: "Hapus",
};

// Label yang lebih jelas untuk aksi tertentu, mis. "laporan:create" = Terbitkan
const ACTION_LABEL_KHUSUS: Partial<Record<string, string>> = {
  "arsip:update": "Buka kembali",
  "laporan:create": "Terbitkan",
};

export function actionLabel(resource: Resource, action: Action) {
  return ACTION_LABEL_KHUSUS[`${resource}:${action}`] ?? ACTION_LABEL[action];
}

export function hasAction(resource: Resource, action: Action) {
  return (RESOURCE_ACTIONS[resource] as readonly Action[]).includes(action);
}

export type Permission = {
  [R in Resource]: `${R}:${(typeof RESOURCE_ACTIONS)[R][number]}`;
}[Resource];

export const ALL_PERMISSIONS: Permission[] = RESOURCES.flatMap((resource) =>
  RESOURCE_ACTIONS[resource].map((action) => `${resource}:${action}` as Permission)
);

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}

// Izin lama (per koleksi, mis. "penyuNaik:read") otomatis terbuang di sini
export function isPermission(value: string): value is Permission {
  return (ALL_PERMISSIONS as string[]).includes(value);
}

export interface AccessSubject {
  role: Role | null;
  tempatId: string | null;
  permissions?: string[];
}

// Boleh mengelola anggota & jabatan di tempat ini
export function isTempatAdmin(user: AccessSubject, tempatId: string) {
  return user.role === "owner" || (user.role === "admin_tempat" && user.tempatId === tempatId);
}

// permissions = izin dari jabatan user (hanya dipakai untuk role custom)
export function can(user: AccessSubject, permission: Permission, tempatId: string): boolean {
  if (isTempatAdmin(user, tempatId)) return true;
  if (user.role !== "custom" || user.tempatId !== tempatId) return false;
  return user.permissions?.includes(permission) ?? false;
}
