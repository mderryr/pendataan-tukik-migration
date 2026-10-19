import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { homePath } from "@/services/auth/constants";
import { getCurrentUser } from "@/services/auth/session";
import RegisterForm from "./register-form";

export const metadata: Metadata = { title: "Daftarkan Tempat Konservasi" };

export default async function DaftarPage() {
  const user = await getCurrentUser();
  if (user?.role) redirect(homePath(user));

  return (
    <section className="min-h-screen flex items-center px-4 pt-24 pb-10">
      <RegisterForm />
    </section>
  );
}
