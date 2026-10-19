import { NextResponse, userAgent, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/services/auth/constants";
import { detectDevice, DEVICE_HEADER } from "@/services/device/device";
import { HALAMAN_APP_TEMPAT, RESERVED_SLUGS } from "@/services/tempat/slug";

// Halaman yang wajib login: panel owner dan halaman aplikasi tiap tempat (/{tempatId}/dashboard, /pendataan, ...)
function wajibLogin(pathname: string) {
  const [, segmen1, segmen2] = pathname.split("/");
  if (segmen1 === "admin") return true;
  return !RESERVED_SLUGS.includes(segmen1) && HALAMAN_APP_TEMPAT.includes(segmen2);
}

// Proxy (pengganti middleware di Next 16):
// 1. Mendeteksi perangkat (android / ios / desktop) → header x-device untuk server.
// 2. Mengecek ada/tidaknya cookie sesi di halaman yang wajib login. Validasi cookie
//    & hak akses tempat yang sebenarnya dilakukan di server (requireTempatAccess).
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Alamat lama /{tempatId}/dashboard/{halaman} → /{tempatId}/{halaman}
  const lama = pathname.match(/^\/([^/]+)\/dashboard\/(.+)$/);
  if (lama && !RESERVED_SLUGS.includes(lama[1])) {
    return NextResponse.redirect(new URL(`/${lama[1]}/${lama[2]}${search}`, request.url), 308);
  }

  if (wajibLogin(pathname) && !request.cookies.has(SESSION_COOKIE)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname + search);
    return NextResponse.redirect(loginUrl);
  }

  // Selalu ditimpa, supaya nilai x-device kiriman browser tidak dipakai
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(DEVICE_HEADER, detectDevice(userAgent(request)));
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  // Semua halaman, kecuali API, aset Next.js, dan file statis
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|txt|xml|json|webmanifest)$).*)"],
};
