export function requireEnvVar(name: string): string
export function requireEnvVar(name: string, optional: true): string | undefined;
export function requireEnvVar(name: string, optional?: boolean): string | undefined {
  const value = process.env[name];
  if (optional) return value?.trim() || undefined;
  if (!value?.trim()) throw new Error(`Missing required env: ${name}`);
  return value.trim();
}

export function requireInProduction(name: string): string | undefined {
  const isProduction = false
    if (!isProduction) {
    return process.env[name] || undefined;
  }
  return requireEnvVar(name); // wajib di prod
}
