import { Suspense } from "react";
import { redirect } from "next/navigation";
import Loading from "./loading";
import LoginForm from "./login-page-new";
import { getCurrentUser } from "@/services/auth/session";
import { homePath, safeRedirectPath } from "@/services/auth/constants";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const next = safeRedirectPath((await searchParams).next);

  const user = await getCurrentUser();
  if (user?.role) redirect(next ?? homePath(user));

  return (
    <Suspense fallback={<Loading />}>
      <section className="min-h-screen flex items-center px-4 py-10">
        <LoginForm next={next} />
      </section>
    </Suspense>
  );
}
