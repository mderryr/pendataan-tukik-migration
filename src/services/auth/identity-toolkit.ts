import "server-only";
import { requireEnvVar } from "@/utils/env-reading.utils";

// Admin SDK tidak bisa mengecek password, jadi login memakai REST API Firebase Auth.
// https://firebase.google.com/docs/reference/rest/auth
const BASE_URL = "https://identitytoolkit.googleapis.com/v1/accounts";

export class IdentityToolkitError extends Error {
  // Contoh: INVALID_LOGIN_CREDENTIALS, USER_DISABLED, TOO_MANY_ATTEMPTS_TRY_LATER
  constructor(public code: string) {
    super(code);
  }
}

export async function signInWithPassword(email: string, password: string) {
  const res = await fetch(`${BASE_URL}:signInWithPassword?key=${requireEnvVar("APIKEY")}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
    cache: "no-store",
  });
  const body = await res.json();

  if (!res.ok) {
    const message: string = body?.error?.message ?? "UNKNOWN";
    throw new IdentityToolkitError(message.split(" ")[0]);
  }

  return { idToken: body.idToken as string, uid: body.localId as string };
}
