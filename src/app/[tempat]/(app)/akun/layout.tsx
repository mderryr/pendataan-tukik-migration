import AkunNav from "./akun-nav";

// /{tempatId}/akun/... — pengaturan akun milik user yang sedang login
export default async function AkunLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ tempat: string }>;
}) {
  const { tempat: tempatId } = await params;

  return (
    <div className="max-w-2xl space-y-6">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">Akun Saya</h2>
        <p className="text-sm text-muted-foreground">Ubah data diri, password, atau email akun kamu.</p>
      </div>
      <AkunNav tempatId={tempatId} />
      {children}
    </div>
  );
}
