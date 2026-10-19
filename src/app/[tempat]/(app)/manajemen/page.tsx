import { redirect } from "next/navigation";

export default async function ManajemenPage({ params }: { params: Promise<{ tempat: string }> }) {
  const { tempat: tempatId } = await params;
  redirect(`/${tempatId}/manajemen/anggota`);
}
