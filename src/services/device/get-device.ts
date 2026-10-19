import "server-only";
import { headers } from "next/headers";
import { userAgent } from "next/server";
import { detectDevice, DEVICE_HEADER, isDevice, type Device } from "./device";

// Dipakai di Server Component / layout: const device = await getDevice();
export async function getDevice(): Promise<Device> {
  const requestHeaders = await headers();
  const fromProxy = requestHeaders.get(DEVICE_HEADER);
  if (isDevice(fromProxy)) return fromProxy;

  // Cadangan kalau request tidak melewati proxy
  return detectDevice(userAgent({ headers: requestHeaders as Headers }));
}
